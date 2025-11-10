// app/change-password/components/ChangePasswordForm.tsx
'use client'

import { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { changePassword, type ActionState } from '../action'
import PasswordInput from './PasswordInput'
import PasswordRequirements from './PasswordRequirements'
import SubmitButton from './SubmitButton'
import StatusMessages from './StatusMessages'

interface PasswordRequirementsState {
  length: boolean
  specialChar: boolean
  hasLetter: boolean
}

export default function ChangePasswordForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(changePassword, null)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [requirements, setRequirements] = useState<PasswordRequirementsState>({
    length: false,
    specialChar: false,
    hasLetter: false
  })
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [allRequirementsMet, setAllRequirementsMet] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect after successful password change
  useEffect(() => {
    if (state?.success) {
      setIsRedirecting(true)
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  // Real-time password validation
  useEffect(() => {
    const newRequirements = {
      length: formData.newPassword.length >= 8,
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword),
      hasLetter: /[a-zA-Z]/.test(formData.newPassword)
    }
    setRequirements(newRequirements)
    setAllRequirementsMet(newRequirements.length && newRequirements.specialChar && newRequirements.hasLetter)
  }, [formData.newPassword])

  // Real-time password match check
  useEffect(() => {
    setPasswordsMatch(
      formData.newPassword === formData.confirmPassword || 
      formData.confirmPassword === ''
    )
  }, [formData.newPassword, formData.confirmPassword])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const canSubmit = allRequirementsMet && passwordsMatch && formData.currentPassword && formData.newPassword && formData.confirmPassword && !isPending && !isRedirecting

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="w-full max-w-md">
        {/* Futuristic Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl shadow-blue-500/10 dark:shadow-purple-500/10 p-8 relative overflow-hidden">
          
          {/* Animated Background Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200/30 dark:bg-purple-500/20 rounded-full blur-xl"></div>
          
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Update Security
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Secure your account with a new password</p>
          </div>

          <form action={formAction} className="space-y-6 relative z-10">
            {/* Current Password */}
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              showPassword={showPassword.current}
              onTogglePassword={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />

            {/* New Password */}
            <div className="group">
              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={handleInputChange}
                showPassword={showPassword.new}
                onTogglePassword={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                placeholder="Create new password"
                autoComplete="new-password"
                isValid={allRequirementsMet}
              />
              
              <PasswordRequirements 
                requirements={requirements} 
                newPassword={formData.newPassword} 
              />
            </div>

            {/* Confirm New Password */}
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              showPassword={showPassword.confirm}
              onTogglePassword={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              isConfirm={true}
              passwordsMatch={passwordsMatch}
            />

            <SubmitButton 
              isPending={isPending}
              isRedirecting={isRedirecting}
              disabled={!canSubmit}
            />

            {/* Form Status Message */}
            {!canSubmit && formData.newPassword && (
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-xl">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Complete all security requirements to continue
                </p>
              </div>
            )}

            {/* Status Messages from Server */}
            <StatusMessages 
              state={state}
              newPassword={formData.newPassword}
            />
          </form>
        </div>
      </div>
    </div>
  )
}