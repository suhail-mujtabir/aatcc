// app/change-password/components/StatusMessages.tsx
'use client'

import { ActionState } from '../action'

interface StatusMessagesProps {
  state: ActionState
  newPassword: string
}

export default function StatusMessages({ state, newPassword }: StatusMessagesProps) {
  return (
    <>
      {/* Success/Error Messages from Server */}
      {state?.success && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center text-green-800 dark:text-green-300">
            <span className="w-6 h-6 mr-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              ✓
            </span>
            <span className="font-medium">{state.success}</span>
          </div>
          <div className="mt-2 text-sm text-green-700 dark:text-green-400">
            Redirecting to your dashboard...
          </div>
        </div>
      )}
      
      {state?.error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl backdrop-blur-sm">
          <div className="flex items-center text-red-800 dark:text-red-300">
            <span className="w-6 h-6 mr-3 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
              ✗
            </span>
            <span className="font-medium">{state.error}</span>
          </div>
        </div>
      )}
    </>
  )
}