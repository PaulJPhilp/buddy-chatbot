'use client'

import { useRef } from 'react'
import { toast } from 'sonner'
import { PaperclipIcon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface FileUploadInputProps {
  isLoading: boolean
  className?: string
}

export function FileUploadInput({
  isLoading,
  className,
}: FileUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (isLoading) {
      toast.error('Please wait for the model to finish its response!')
      return
    }
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        tabIndex={-1}
        multiple
      />
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-accent hover:text-accent-foreground h-8 w-8"
        onClick={handleClick}
        disabled={isLoading}
        data-state="closed"
      >
        <PaperclipIcon size={16} />
      </Button>
    </div>
  )
}
