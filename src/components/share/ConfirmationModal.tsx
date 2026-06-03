"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  icon?: React.ReactNode
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  title,
  description,
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  icon,
}: ConfirmationModalProps) => {
  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl overflow-hidden md:p-4 p-2 border-none">
        <div className="p-6 pt-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              {icon || <HelpCircle className="h-8 w-8" />}
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl text-center font-bold text-gray-900 tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-center text-gray-500 leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
        
        <DialogFooter className="flex flex-row gap-2 p-4 bg-gray-50/50 sm:justify-center border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-11 rounded-xl border-gray-200 text-gray-500 hover:bg-white transition-all font-semibold cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-11 rounded-xl bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all font-semibold cursor-pointer"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationModal