"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WelcomeModalProps {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Copy-Paste Notebook</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>Your notes are saved locally in your browser's storage (localStorage). This means:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Notes are private and stay on your device</li>
                <li>No data is sent to external servers</li>
                <li>Clearing browser data will delete your notes</li>
                <li>Notes won't sync between devices</li>
              </ul>
              <div className="text-xs">Consider exporting important notes as PDF for backup.</div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Got it, Start Using
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
