// app/change-password/ChangePasswordForm.tsx
'use client'

import { useState, useActionState, useEffect } from 'react'
import { changePassword, type ActionState } from './action'

interface PasswordRequirements {
  length: boolean
  specialChar: boolean
  hasLetter: boolean
}

export default function ChangePasswordForm() {
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
  const [requirements, setRequirements] = useState<PasswordRequirements>({
    length: false,
    specialChar: false,
    hasLetter: false
  })
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [allRequirementsMet, setAllRequirementsMet] = useState(false)

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

  const canSubmit = allRequirementsMet && passwordsMatch && formData.currentPassword && formData.newPassword && formData.confirmPassword && !isPending

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h1>
      
      <form action={formAction} className="space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium mb-2 text-gray-700">
            Current Password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPassword.current ? "text" : "password"}
              required
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-400 hover:text-blue-500 text-sm"
              onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
            >
              {showPassword.current ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-gray-700">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword.new ? "text" : "password"}
              required
              value={formData.newPassword}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formData.newPassword ? (allRequirementsMet ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-400 hover:text-blue-500 text-sm"
              onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
            >
              {showPassword.new ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {/* Password Requirements */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center ${requirements.length ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{requirements.length ? '✓' : '○'}</span>
                At least 8 characters
                {formData.newPassword && (
                  <span className="ml-1 text-xs">
                    ({formData.newPassword.length}/8)
                  </span>
                )}
              </div>
              <div className={`flex items-center ${requirements.specialChar ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{requirements.specialChar ? '✓' : '○'}</span>
                At least 1 special character (!@#$% etc.)
              </div>
              <div className={`flex items-center ${requirements.hasLetter ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{requirements.hasLetter ? '✓' : '○'}</span>
                At least 1 letter (a-z, A-Z)
              </div>
            </div>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword.confirm ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formData.confirmPassword ? (passwordsMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-300'
              }`}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-2 text-gray-400 hover:text-blue-500 text-sm"
              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
            >
              {showPassword.confirm ? 'Hide' : 'Show'}
            </button>
          </div>
          {!passwordsMatch && formData.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">✗</span>
              Passwords do not match
            </p>
          )}
          {passwordsMatch && formData.confirmPassword && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <span className="mr-1">✓</span>
              Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
        >
          {isPending ? 'Updating Password...' : 'Change Password'}
        </button>

        {/* Form Status */}
        <div className="text-center">
          {!canSubmit && formData.newPassword && (
            <p className="text-sm text-orange-600">
              Please fulfill all requirements above to change password
            </p>
          )}
        </div>
      </form>

      {/* Success/Error Messages from Server */}
      {state?.success && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-md">
          {state.success}
        </div>
      )}
      
      {state?.error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}
    </div>
  )
}