// app/auth/page.tsx
'use client'

import { useState } from 'react'
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password)
        if (error) throw error
      } else {
        const { error } = await signUpWithEmail(email, password, name)
        if (error) throw error
      }
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg/95 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent to-purple-500 text-white shadow-lg mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-primary font-display tracking-tight mb-2">
              Tasklane
            </h1>
            <p className="text-sm text-secondary">
              Keyboard-first productivity for deep work
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-6">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ada Lovelace"
                    className="w-full pl-11 pr-4 py-3 bg-bg border border-border rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-bg border border-border rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-bg border border-border rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'}
            </button>
          </form>

          {/* Quick Demo Bypass */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-3 px-4 bg-surface hover:bg-surface-hover border border-border rounded-xl text-sm font-semibold text-secondary hover:text-primary transition flex items-center justify-center gap-2 group"
          >
            <span>Continue with Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Toggle Mode */}
          <div className="text-center text-sm text-secondary">
            {mode === 'signin' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="text-accent hover:underline font-semibold transition"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="text-accent hover:underline font-semibold transition"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted">
            Use Cmd+K for command palette • ? for shortcuts
          </p>
        </div>
      </div>
    </div>
  )
}
