import React from 'react'
import { X } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-600 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          {onConfirm && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`px-4 py-2 text-white rounded font-medium ${
                  isDangerous
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmText}
              </button>
            </>
          )}
          {!onConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded font-medium"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
