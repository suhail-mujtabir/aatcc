// app/change-password/components/PasswordRequirements.tsx
'use client'

interface PasswordRequirementsProps {
  requirements: {
    length: boolean
    specialChar: boolean
    hasLetter: boolean
  }
  newPassword: string
}

export default function PasswordRequirements({ requirements, newPassword }: PasswordRequirementsProps) {
  return (
    <div className="mt-4 p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-white/30 dark:border-gray-700/30 backdrop-blur-sm">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Security Requirements:</p>
      <div className="space-y-2 text-sm">
        <RequirementItem 
          met={requirements.length}
          text="At least 8 characters"
          additionalText={newPassword ? `(${newPassword.length}/8)` : undefined}
        />
        <RequirementItem 
          met={requirements.specialChar}
          text="Special character required"
        />
        <RequirementItem 
          met={requirements.hasLetter}
          text="At least one letter"
        />
      </div>
    </div>
  )
}

function RequirementItem({ met, text, additionalText }: { met: boolean; text: string; additionalText?: string }) {
  return (
    <div className={`flex items-center transition-all duration-300 ${
      met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
    }`}>
      <span className={`w-5 h-5 mr-3 rounded-full flex items-center justify-center text-xs ${
        met 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
      }`}>
        {met ? '✓' : '○'}
      </span>
      {text}
      {additionalText && (
        <span className="ml-2 text-xs font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
          {additionalText}
        </span>
      )}
    </div>
  )
}