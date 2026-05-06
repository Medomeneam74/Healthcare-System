import { Router } from 'express';
import multer from 'multer';
import axios from 'axios';
import { isAuthenticated } from '../../middleware/authentication.js';
import { isAuthorized } from '../../middleware/autheraization.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { roles } from '../../utils/constant/enum.js';
import { AppError } from '../../utils/appError.js';
import { callChatbotService, checkChatbotHealth } from '../../utils/chatbot-service-config.js';
import { PatientChatLog } from '../../../db/index.js';

// ─── Voice upload middleware ───────────────────────────────────────────────────
// Stores the audio in memory (buffer) — no disk I/O needed for small recordings.
const _multerAudio = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
}).single('audio');

// Promise wrapper so multer errors flow through our asyncHandler / AppError system
const uploadAudio = (req, res) =>
    new Promise((resolve, reject) => _multerAudio(req, res, err => (err ? reject(err) : resolve())));

const chatbotRouter = Router();

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /chatbot/message
 *
 * - Fetches patient profile + medical records from MongoDB
 * - Injects them as a system context message at the top of conversation_history
 * - Falls back to patient_chat_logs for cross-session memory
 * - Saves every turn to patient_chat_logs
 */
chatbotRouter.post(
    '/message',
    isAuthenticated(),
    isAuthorized([roles.PATIENT, roles.DOCTOR, roles.ADMIN_HOSPITAL]),
    asyncHandler(async (req, res, next) => {
        const { message, conversation_history, patientId, session_id } = req.body;
        const authUser = req.authUser;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return next(new AppError('message is required', 400));
        }

        let resolvedPatientId;
        if (authUser.role === roles.PATIENT) {
            resolvedPatientId = authUser._id.toString();
        } else {
            if (!patientId) {
                return next(new AppError('patientId is required for non-patient roles', 400));
            }
            resolvedPatientId = patientId;
        }

        // Python chatbot fetches patient data + history directly from MongoDB —
        // no need to duplicate those queries here.
        const payload = {
            patient_id: resolvedPatientId,
            message: message.trim(),
            conversation_history: conversation_history || [],
        };

        const result = await callChatbotService('/chat', 'POST', payload);

        if (!result.success) {
            PatientChatLog.create({
                patientId: resolvedPatientId,
                sessionId: session_id || null,
                message: message.trim(),
                response: null,
                conversation_history: conversation_history || [],
                serviceAvailable: false,
            }).catch(err => console.error('[Chatbot] log save error:', err.message));

            return next(new AppError(
                result.error || 'Chatbot service unavailable',
                result.statusCode || 502
            ));
        }

        const assistantResponse =
            result.data?.response
            ?? result.data?.message
            ?? result.data?.answer
            ?? result.data?.reply
            ?? (typeof result.data === 'string' ? result.data : null);

        PatientChatLog.create({
            patientId: resolvedPatientId,
            sessionId: session_id || null,
            message: message.trim(),
            response: assistantResponse,
            serviceAvailable: true,
        }).catch(err => console.error('[Chatbot] log save error:', err.message));

        return res.status(200).json({
            success: true,
            data: result.data,
        });
    })
);

/**
 * GET /chatbot/history
 * Past chat logs for a patient, oldest → newest.
 * Patients are scoped automatically; doctors/admins pass ?patientId=.
 */
chatbotRouter.get(
    '/history',
    isAuthenticated(),
    isAuthorized([roles.PATIENT, roles.DOCTOR, roles.ADMIN_HOSPITAL]),
    asyncHandler(async (req, res, next) => {
        const { patientId, limit = 50 } = req.query;
        const authUser = req.authUser;

        let resolvedPatientId;
        if (authUser.role === roles.PATIENT) {
            resolvedPatientId = authUser._id.toString();
        } else {
            if (!patientId) return next(new AppError('patientId is required', 400));
            resolvedPatientId = patientId;
        }

        const logs = await PatientChatLog.find({ patientId: resolvedPatientId })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .select('message response sessionId serviceAvailable createdAt')
            .lean();

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs.reverse(),
        });
    })
);

/**
 * POST /chatbot/voice
 *
 * Flow:
 *   1. Accept multipart/form-data with field "audio" (webm / ogg / wav)
 *   2. Forward raw bytes to FastAPI POST /speech-to-text (Whisper, Arabic)
 *   3. Return { success: true, text: "<transcription>" }
 *
 * The frontend puts the transcription in the chat input so the user can
 * review / edit it before sending — satisfying the "edit before send" UX
 * requirement.  The actual chatbot call then goes through POST /chatbot/message
 * as normal.
 */
chatbotRouter.post(
    '/voice',
    isAuthenticated(),
    isAuthorized([roles.PATIENT, roles.DOCTOR, roles.ADMIN_HOSPITAL]),
    asyncHandler(async (req, res, next) => {
        // Run multer — stores audio in req.file.buffer
        try {
            await uploadAudio(req, res);
        } catch (multerErr) {
            return next(new AppError(`Audio upload error: ${multerErr.message}`, 400));
        }

        if (!req.file) {
            return next(new AppError(
                'No audio file received. Send multipart/form-data with field name "audio".',
                400,
            ));
        }

        const CHATBOT_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:8001';

        // Build a native FormData (available in Node 18+) to forward the audio
        // buffer to FastAPI as multipart/form-data.
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', blob, req.file.originalname || 'recording.webm');

        let sttRes;
        try {
            sttRes = await axios.post(`${CHATBOT_URL}/speech-to-text`, formData, {
                timeout: 60_000, // Whisper can take ~10-30 s for "base" model on CPU
            });
        } catch (err) {
            if (err.code === 'ECONNREFUSED') {
                return next(new AppError(
                    'Speech-to-text service is not running on port 8001.',
                    503,
                ));
            }
            const detail = err.response?.data?.detail || err.message;
            return next(new AppError(`Transcription failed: ${detail}`, err.response?.status || 502));
        }

        const text = sttRes.data?.text;
        if (!text) {
            return next(new AppError('Transcription returned empty text.', 422));
        }

        return res.status(200).json({ success: true, text });
    })
);

/**
 * GET /chatbot/health
 */
chatbotRouter.get('/health', async (_req, res) => {
    const health = await checkChatbotHealth();
    return res.status(health.available ? 200 : 503).json({
        success: health.available,
        service: 'patient-chatbot',
        data: health.data || null,
    });
});

export default chatbotRouter;
