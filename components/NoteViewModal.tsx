"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { notesStorage, type Note } from "@/lib/localStorage"
import { exportNoteToPDF } from "@/lib/pdfExport"
import MarkdownRenderer from "@/components/MarkdownRenderer"

interface NoteViewModalProps {
  noteId: string | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

export default function NoteViewModal({ noteId, isOpen, onClose, onEdit }: NoteViewModalProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (noteId && isOpen) {
      const loadNote = () => {
        const foundNote = notesStorage.getNoteById(noteId)
        setNote(foundNote)
        setLoading(false)
      }
      loadNote()
    }
  }, [noteId, isOpen])

  const handleCopyNote = async () => {
    if (!note) return

    const noteText = `# ${note.title}\n\n${note.description ? `${note.description}\n\n` : ""}${note.content}`

    try {
      await navigator.clipboard.writeText(noteText)
      const event = new CustomEvent("show-toast", {
        detail: { message: "Note copied to clipboard!", type: "success" },
      })
      window.dispatchEvent(event)
    } catch (error) {
      const event = new CustomEvent("show-toast", {
        detail: { message: "Failed to copy note to clipboard.", type: "error" },
      })
      window.dispatchEvent(event)
    }
  }

  const handleShare = async () => {
    if (!note) return

    if (note.isPublic) {
      const shareUrl = `${window.location.origin}/note/${note.id}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        const event = new CustomEvent("show-toast", {
          detail: { message: "Public note link copied to clipboard!", type: "success" },
        })
        window.dispatchEvent(event)
      } catch (error) {
        const event = new CustomEvent("show-toast", {
          detail: { message: "Failed to copy share link.", type: "error" },
        })
        window.dispatchEvent(event)
      }
    } else {
      const shareText = `${note.title}\n\n${note.description ? `${note.description}\n\n` : ""}${note.content}`
      try {
        await navigator.clipboard.writeText(shareText)
        const event = new CustomEvent("show-toast", {
          detail: { message: "Note content copied to clipboard!", type: "success" },
        })
        window.dispatchEvent(event)
      } catch (error) {
        const event = new CustomEvent("show-toast", {
          detail: { message: "Failed to share note.", type: "error" },
        })
        window.dispatchEvent(event)
      }
    }
  }

  const handleExportPDF = async () => {
    if (!note) return

    setIsExporting(true)
    try {
      const success = await exportNoteToPDF(note)
      if (success) {
        const event = new CustomEvent("show-toast", {
          detail: { message: "PDF exported successfully!", type: "success" },
        })
        window.dispatchEvent(event)
      } else {
        const event = new CustomEvent("show-toast", {
          detail: { message: "Failed to export PDF. Please try again.", type: "error" },
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      const event = new CustomEvent("show-toast", {
        detail: { message: "Failed to export PDF. Please try again.", type: "error" },
      })
      window.dispatchEvent(event)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = () => {
    if (!note) return

    const event = new CustomEvent("show-confirmation", {
      detail: {
        message: `Are you sure you want to delete "${note.title}"? It will be moved to trash.`,
        onConfirm: () => {
          notesStorage.deleteNote(note.id)
          onClose()
          const event = new CustomEvent("show-toast", {
            detail: { message: "Note deleted successfully!", type: "success" },
          })
          window.dispatchEvent(event)
        },
      },
    })
    window.dispatchEvent(event)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {loading ? "Loading..." : note?.title || "Note Not Found"}
            </DialogTitle>
            {note && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 hover:from-emerald-600 hover:to-teal-600"
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyNote}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600"
                >
                  📋 Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 hover:from-purple-600 hover:to-violet-600"
                >
                  📤 Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 hover:from-orange-600 hover:to-amber-600"
                >
                  {isExporting ? "⏳" : "📄"} Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 hover:from-red-600 hover:to-rose-600"
                >
                  🗑️ Delete
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        ) : note ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {note.pinned && <span className="text-lg">📌</span>}
                {note.isPublic && <Badge variant="secondary">Public</Badge>}
              </div>

              {note.description && <p className="text-lg text-muted-foreground mb-4">{note.description}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Category: {note.category}</span>
                <span>Created: {formatDate(note.createdAt)}</span>
                <span>Updated: {formatDate(note.updatedAt)}</span>
              </div>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold">Content</h3>
              </CardHeader>
              <CardContent>
                {note.content ? (
                  <MarkdownRenderer content={note.content} />
                ) : (
                  <p className="text-muted-foreground italic">No content available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Note not found or has been deleted.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
