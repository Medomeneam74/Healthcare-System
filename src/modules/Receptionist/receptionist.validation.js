import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';

// assign patient to doctor validation schema
export const assignPatientToDoctorSchema = joi.object({
    doctorId : generalFields.objectId.required(),
    patientId : generalFields.objectId.required(),
})


// reassign patient from one doctor to another
export const reassignPatientSchema = joi.object({
    patientId    : generalFields.objectId.required(),
    fromDoctorId : generalFields.objectId.required(),
    toDoctorId   : generalFields.objectId.required(),
})

// get patients of a doctor schema
export const getPatientsOfDoctorSchema = joi.object({
    doctorId : generalFields.objectId.required(),
})