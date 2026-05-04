import React, { useState, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Activity, Eye, EyeOff, AlertCircle, Stethoscope, UserRound, X, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getRoleHome } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import client from '@/api/client'

type LoginType = 'staff' | 'patient'
type ForgotStep = 'email' | 'otp' | 'done'

const FEATURES = [
  'NFC-based instant patient identification',
  'AI-powered drug interaction detection',
  'Unified electronic health records',
  'Multi-hospital staff coordination',
]

function HealthcareIllustration() {
  const ref = useRef<HTMLDivElement>(null)
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({})

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) / (width / 2)
    const y = (e.clientY - top - height / 2) / (height / 2)
    setCardStyle({
      transform: `perspective(640px) rotateX(${-y * 9}deg) rotateY(${x * 11}deg) translateY(-6px) scale(1.03)`,
      transition: 'transform 80ms ease-out',
    })
  }

  const onMouseLeave = () => {
    setCardStyle({
      transform: 'perspective(640px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
      transition: 'transform 380ms cubic-bezier(0.23, 1, 0.32, 1)',
    })
  }

  return (
    <div className="animate-login-illus mt-8 w-full max-w-[272px] mx-auto">
      <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={cardStyle}>
      <svg
        viewBox="0 0 272 168"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-hidden="true"
      >
        {/* Decorative scatter dots */}
        <circle cx="12" cy="20" r="2.5" fill="white" fillOpacity="0.18" />
        <circle cx="260" cy="148" r="2.5" fill="white" fillOpacity="0.18" />
        <circle cx="254" cy="18" r="1.8" fill="white" fillOpacity="0.12" />
        <circle cx="16" cy="150" r="1.8" fill="white" fillOpacity="0.12" />
        <circle cx="136" cy="8" r="2" fill="white" fillOpacity="0.10" />
        <circle cx="246" cy="74" r="1.5" fill="white" fillOpacity="0.14" />
        <circle cx="26" cy="84" r="1.5" fill="white" fillOpacity="0.14" />

        {/* Card drop shadow */}
        <rect x="28" y="34" width="216" height="122" rx="17" fill="black" fillOpacity="0.20" />

        {/* Card body */}
        <rect x="20" y="24" width="232" height="122" rx="16" fill="white" fillOpacity="0.13" stroke="white" strokeOpacity="0.32" strokeWidth="1.5" />

        {/* Card header highlight */}
        <rect x="20" y="24" width="232" height="36" rx="16" fill="white" fillOpacity="0.07" />

        {/* EMV chip */}
        <rect x="42" y="50" width="32" height="24" rx="5" fill="white" fillOpacity="0.48" stroke="white" strokeOpacity="0.45" strokeWidth="1" />
        <line x1="48" y1="58" x2="68" y2="58" stroke="white" strokeOpacity="0.28" strokeWidth="0.8" />
        <line x1="48" y1="63" x2="68" y2="63" stroke="white" strokeOpacity="0.28" strokeWidth="0.8" />
        <line x1="48" y1="68" x2="68" y2="68" stroke="white" strokeOpacity="0.28" strokeWidth="0.8" />
        <line x1="56" y1="50" x2="56" y2="74" stroke="white" strokeOpacity="0.20" strokeWidth="0.8" />
        <line x1="62" y1="50" x2="62" y2="74" stroke="white" strokeOpacity="0.20" strokeWidth="0.8" />

        {/* NFC dot */}
        <circle cx="172" cy="62" r="4.5" fill="white" fillOpacity="0.80" />

        {/* NFC waves */}
        <path d="M 181 49 A 13 13 0 0 1 181 75" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.82" />
        <path d="M 189 42 A 21 21 0 0 1 189 82" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.58" />
        <path d="M 197 35 A 29 29 0 0 1 197 89" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.36" />

        {/* Card name + number placeholder lines */}
        <rect x="42" y="94" width="54" height="6" rx="3" fill="white" fillOpacity="0.28" />
        <rect x="42" y="106" width="78" height="5" rx="2.5" fill="white" fillOpacity="0.18" />

        {/* ECG heartbeat line — animates in on load */}
        <path
          d="M 20 136 L 66 136 L 80 114 L 96 158 L 110 136 L 252 136"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.68"
          strokeDasharray="320"
          className="login-ecg"
        />
      </svg>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login, isAuthenticated, user, loading: authLoading } = useAuth()
  const [loginType, setLoginType] = useState<LoginType>('staff')
  const [email, setEmail] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)

  const [showForgot, setShowForgot] = useState(false)
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')

  if (!authLoading && isAuthenticated && user) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email address'); return }
    if (!password)     { setError('Please enter your password'); return }
    setLoading(true)
    try {
      await login({ email, nationalId, password, loginType })
      setFailedAttempts(0)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      setError(axiosErr?.response?.data?.message ?? axiosErr?.message ?? 'Login failed. Please check your credentials.')
      setFailedAttempts(n => n + 1)
    } finally {
      setLoading(false)
    }
  }

  const openForgot = () => {
    setForgotEmail(email)
    setForgotStep('email')
    setForgotOtp('')
    setForgotNewPassword('')
    setForgotConfirmPassword('')
    setForgotError('')
    setShowForgot(true)
  }

  const closeForgot = () => { setShowForgot(false); setForgotError('') }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) { setForgotError('Enter your email'); return }
    setForgotLoading(true); setForgotError('')
    try {
      await client.post('/auth/doctor/forget-password', { email: forgotEmail })
      setForgotStep('otp')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setForgotError(e?.response?.data?.message ?? e?.message ?? 'Failed to send OTP')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotOtp.trim())      { setForgotError('Enter the OTP'); return }
    if (!forgotNewPassword)     { setForgotError('Enter a new password'); return }
    if (forgotNewPassword !== forgotConfirmPassword) { setForgotError('Passwords do not match'); return }
    setForgotLoading(true); setForgotError('')
    try {
      await client.post('/auth/doctor/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotNewPassword,
      })
      setForgotStep('done')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setForgotError(e?.response?.data?.message ?? e?.message ?? 'Failed to reset password')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel — vivid gradient */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-[42%] flex-col justify-between px-12 py-14 relative overflow-hidden animate-login-panel"
        style={{ background: 'linear-gradient(150deg, oklch(64% 0.24 232) 0%, oklch(54% 0.25 218) 48%, oklch(46% 0.22 207) 100%)' }}
      >
        {/* Soft glow blobs for depth */}
        <div className="pointer-events-none absolute -top-28 -right-28 h-80 w-80 rounded-full bg-white opacity-[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white opacity-[0.05] blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white opacity-[0.03] blur-2xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/22 border border-white/28 flex-shrink-0">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">NFC Healthcare</span>
        </div>

        {/* Content block — headline + features + illustration */}
        <div className="relative z-10">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.20em] text-white/55 mb-5">
            Clinical System
          </p>
          <h1 className="text-[2.05rem] font-bold text-white leading-[1.12] tracking-tight mb-8">
            Unified care,<br />one card.
          </h1>

          <ul className="space-y-3.5">
            {FEATURES.map((feat, i) => (
              <li
                key={feat}
                className="flex items-center gap-3 animate-login-feat"
                style={{ animationDelay: `${130 + i * 50}ms` }}
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/22 border border-white/28">
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                    <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm text-white/82 leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>

          {/* Illustration — NFC health card with animated ECG */}
          <HealthcareIllustration />
        </div>

        <p className="text-[0.6875rem] text-white/38 relative z-10">
          &copy; {new Date().getFullYear()} NFC Healthcare
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-sm animate-login-form">

          {/* Mobile brand mark */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold text-ink">NFC Healthcare</span>
          </div>

          <div className="bg-canvas-raised rounded-xl border border-line shadow-card p-8">
            <h2 className="text-xl font-semibold text-ink mb-0.5">Welcome back</h2>
            <p className="text-sm text-ink-secondary mb-6">Sign in to continue</p>

            {/* Login type toggle */}
            <div className="grid grid-cols-2 gap-1.5 mb-6 p-1 bg-canvas-subtle rounded-lg border border-line">
              <button
                type="button"
                onClick={() => { setLoginType('staff'); setError(''); setFailedAttempts(0) }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ${
                  loginType === 'staff'
                    ? 'bg-canvas-raised text-accent shadow-card'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                Doctor / Staff
              </button>
              <button
                type="button"
                onClick={() => { setLoginType('patient'); setError(''); setFailedAttempts(0) }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-[color,background-color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ${
                  loginType === 'patient'
                    ? 'bg-canvas-raised text-accent shadow-card'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                <UserRound className="h-3.5 w-3.5" />
                Patient
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Keyed so fields animate when switching type */}
              <div key={loginType} className="animate-form-type space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={loginType === 'staff' ? 'doctor@hospital.com' : 'you@example.com'}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setFailedAttempts(0) }}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors duration-150"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-danger-light border border-sev-critical-line px-3 py-2.5 text-sm text-danger">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {failedAttempts >= 2 && loginType === 'staff' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={openForgot}
                      className="text-sm text-accent hover:text-accent-hover font-medium transition-colors duration-150"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-accent-fg/30 border-t-accent-fg animate-spin" />
                      Signing in...
                    </span>
                  ) : loginType === 'patient' ? 'Access my passport' : 'Sign in'}
                </Button>
              </div>
            </form>

            <p className="mt-5 text-center text-sm text-ink-secondary">
              {loginType === 'staff' ? (
                <>New doctor?{' '}
                  <Link to="/signup/doctor" className="text-accent hover:text-accent-hover font-medium transition-colors duration-150">
                    Register here
                  </Link>
                </>
              ) : (
                <>New patient?{' '}
                  <Link to="/signup/patient" className="text-accent hover:text-accent-hover font-medium transition-colors duration-150">
                    Create account
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-canvas-raised rounded-xl border border-line shadow-card-lg p-8 relative animate-login-form">
            <button
              onClick={closeForgot}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors duration-150 active:scale-[0.95]"
            >
              <X className="h-5 w-5" />
            </button>

            {forgotStep === 'email' && (
              <>
                <h3 className="text-lg font-semibold text-ink mb-1">Reset password</h3>
                <p className="text-sm text-ink-secondary mb-6">Enter your email and we'll send a one-time code.</p>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email">Email address</Label>
                    <Input id="forgot-email" type="email" placeholder="doctor@hospital.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} autoFocus />
                  </div>
                  {forgotError && (
                    <div className="flex items-center gap-2 rounded-md bg-danger-light border border-sev-critical-line px-3 py-2.5 text-sm text-danger">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />{forgotError}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={forgotLoading}>
                    {forgotLoading ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-accent-fg/30 border-t-accent-fg animate-spin" />Sending...</span> : 'Send code'}
                  </Button>
                </form>
              </>
            )}

            {forgotStep === 'otp' && (
              <>
                <h3 className="text-lg font-semibold text-ink mb-1">Enter code</h3>
                <p className="text-sm text-ink-secondary mb-6">
                  A 6-digit code was sent to <span className="font-medium text-ink">{forgotEmail}</span>.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otp">Verification code</Label>
                    <Input id="otp" type="text" placeholder="6-digit code" value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} maxLength={6} autoFocus />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password">New password</Label>
                    <div className="relative">
                      <Input id="new-password" type={showForgotPassword ? 'text' : 'password'} placeholder="Min 8 chars, upper, lower, number, symbol" value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowForgotPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors duration-150">
                        {showForgotPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input id="confirm-password" type="password" placeholder="Repeat new password" value={forgotConfirmPassword} onChange={e => setForgotConfirmPassword(e.target.value)} />
                  </div>
                  {forgotError && (
                    <div className="flex items-center gap-2 rounded-md bg-danger-light border border-sev-critical-line px-3 py-2.5 text-sm text-danger">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />{forgotError}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={forgotLoading}>
                    {forgotLoading ? <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-accent-fg/30 border-t-accent-fg animate-spin" />Resetting...</span> : 'Reset password'}
                  </Button>
                  <button type="button" onClick={() => { setForgotStep('email'); setForgotError('') }} className="w-full text-sm text-ink-secondary hover:text-ink text-center transition-colors duration-150">
                    Use a different email
                  </button>
                </form>
              </>
            )}

            {forgotStep === 'done' && (
              <div className="text-center py-4 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sev-none-bg mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-sev-none-fg" />
                </div>
                <h3 className="text-lg font-semibold text-ink">Password updated</h3>
                <p className="text-sm text-ink-secondary">You can now sign in with your new password.</p>
                <Button className="w-full" onClick={closeForgot}>Back to sign in</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
