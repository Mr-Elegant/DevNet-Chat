import React from "react"
import { motion } from "motion/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'



const Modal= ({
  children,
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showFooter = true,
  submitVariant = "default",
  size,
  className = ''
}) => {
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${size} ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="py-4">
            {children}
          </div>

          {showFooter && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              {onSubmit && (
                <Button
                  variant={submitVariant}
                  onClick={handleSubmit}
                >
                  {submitText}
                </Button>
              )}
            </DialogFooter>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export default Modal
