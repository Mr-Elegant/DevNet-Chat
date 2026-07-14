import type { ReactNode } from "react"
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

type ModalProps = {
  children?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void | Promise<void>;
  submitText?: ReactNode;
  cancelText?: ReactNode;
  showFooter?: boolean;
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: string;
  className?: string;
};

const Modal = ({
  children,
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  submitText = "Submit",
  cancelText = "Cancel",
  showFooter = true,
  submitVariant = "default",
  size = "",
  className = "",
}: ModalProps) => {
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
