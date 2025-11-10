// app/change-password/components/PasswordInput.tsx
'use client'

interface PasswordInputProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  showPassword: boolean
  onTogglePassword: () => void
  placeholder: string
  autoComplete: string
  isValid?: boolean
  isConfirm?: boolean
  passwordsMatch?: boolean
}

export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  placeholder,
  autoComplete,
  isValid,
  isConfirm,
  passwordsMatch
}: PasswordInputProps) {
  const getBorderColor = () => {
    if (!value) return 'border-gray-200/50 dark:border-gray-700/50 focus:border-blue-500 dark:focus:border-blue-400'
    
    if (isConfirm) {
      return passwordsMatch 
        ? 'border-green-500/70 dark:border-green-400/70 focus:border-green-500 dark:focus:border-green-400'
        : 'border-red-500/70 dark:border-red-400/70 focus:border-red-500 dark:focus:border-red-400'
    }
    
    return isValid 
      ? 'border-green-500/70 dark:border-green-400/70 focus:border-green-500 dark:focus:border-green-400'
      : 'border-orange-500/70 dark:border-orange-400/70 focus:border-orange-500 dark:focus:border-orange-400'
  }

  return (
    <div className="group">
      <label htmlFor={id} className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          required
          value={value}
          onChange={onChange}
          className={`w-full bg-white/50 dark:bg-gray-800/50 border-2 rounded-2xl px-4 py-3 focus:outline-none focus:bg-white/80 dark:focus:bg-gray-800/80 transition-all duration-300 backdrop-blur-sm placeholder-gray-500 dark:placeholder-gray-400 ${getBorderColor()}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Password match indicator for confirm field */}
      {isConfirm && value && (
        <div className={`mt-2 flex items-center text-sm font-medium transition-all duration-300 ${
          passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          <span className={`w-5 h-5 mr-2 rounded-full flex items-center justify-center text-xs ${
            passwordsMatch 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {passwordsMatch ? '✓' : '✗'}
          </span>
          {passwordsMatch ? 'Passwords match perfectly' : 'Passwords do not match'}
        </div>
      )}
    </div>
  )
}