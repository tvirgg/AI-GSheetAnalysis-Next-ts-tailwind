// components/EditableField.tsx
import { useState } from 'react'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface EditableFieldProps {
  label: string
  value: string
  icon: React.ReactNode
  onSave: (newValue: string) => void
}

const EditableField: React.FC<EditableFieldProps> = ({ label, value, icon, onSave }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)

  const handleSave = () => {
    onSave(currentValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setCurrentValue(value)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        {!isEditing ? (
          <span className="ml-3 text-gray-700">{value}</span>
        ) : (
          <input
            type={label === 'Email' ? 'email' : 'text'}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="ml-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        )}
      </div>
      <div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="text-green-500 hover:text-green-700 mr-2"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-red-500 hover:text-red-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default EditableField
