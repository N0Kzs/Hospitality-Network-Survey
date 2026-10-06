'use client'

import { useActionState, useState } from 'react'
import { loginAction } from '@/app/admin/login/actions'
import './login.css'

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/Logo/YFC.webp" alt="YFC Logo" className="login-logo yfc" />
        </div>
        
        <h1 className="login-title">Admin Sign In</h1>
        
        <form action={formAction} className="login-form">
          <input type="hidden" name="nextPath" value={nextPath || ''} />
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              name="username" 
              type="text" 
              autoComplete="username" 
              required 
              disabled={isPending}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input 
                id="password"
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                autoComplete="current-password" 
                required 
                disabled={isPending}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="show-password-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          {state?.error && (
            <div className="login-error" role="alert">
              {state.error}
            </div>
          )}
          
          <button type="submit" className="login-submit" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
