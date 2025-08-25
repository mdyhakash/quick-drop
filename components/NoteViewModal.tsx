"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { notesStorage, type Note } from "@/lib/localStorage";
import { exportNoteToPDF } from "@/lib/pdfExport";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface NoteViewModalProps {
  noteId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function NoteViewModal({
  noteId,
  isOpen,
  onClose,
  onEdit,
}: NoteViewModalProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (noteId && isOpen) {
      const foundNote = notesStorage.getNoteById(noteId);
      setNote(foundNote);
      setLoading(false);
    }
  }, [noteId, isOpen]);

  const handleCopyNote = async () => {
    if (!note) return;

    const noteText = `# ${note.title}\n\n${
      note.description && note.description.trim()
        ? `${note.description}\n\n`
        : ""
    }${note.content}`;

    try {
      await navigator.clipboard.writeText(noteText);
      const event = new CustomEvent("show-toast", {
        detail: { message: "Note copied to clipboard!", type: "success" },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to copy note:", error);
      const event = new CustomEvent("show-toast", {
        detail: { message: "Failed to copy note to clipboard.", type: "error" },
      });
      window.dispatchEvent(event);
    }
  };

  const handleShare = async () => {
    if (!note) return;

    const shareText = `${note.title}\n\n${
      note.description && note.description.trim()
        ? `${note.description}\n\n`
        : ""
    }${note.content}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: note.title,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        const event = new CustomEvent("show-toast", {
          detail: {
            message: "Note content copied to clipboard!",
            type: "success",
          },
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      const event = new CustomEvent("show-toast", {
        detail: { message: "Failed to share note.", type: "error" },
      });
      window.dispatchEvent(event);
    }
  };

  const handleExportPDF = async () => {
    if (!note) return;

    setIsExporting(true);
    try {
      const noteForExport = {
        title: note.title,
        description: note.description,
        content: note.content,
        category: note.category || "text",
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };

      const success = await exportNoteToPDF(noteForExport);
      if (success) {
        const event = new CustomEvent("show-toast", {
          detail: { message: "PDF exported successfully!", type: "success" },
        });
        window.dispatchEvent(event);
      } else {
        const event = new CustomEvent("show-toast", {
          detail: {
            message: "Failed to export PDF. Please try again.",
            type: "error",
          },
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Failed to export PDF:", error);
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Failed to export PDF. Please try again.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!note) return;

    const event = new CustomEvent("show-confirmation", {
      detail: {
        message: `Are you sure you want to delete "${note.title}"? It will be moved to trash.`,
        onConfirm: () => {
          notesStorage.deleteNote(note.id);
          onClose();
        },
      },
    });
    window.dispatchEvent(event);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

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
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 hover:from-red-600 hover:to-pink-600"
                >
                  🗑️ Delete
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="mt-6">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          ) : note ? (
            <div className="space-y-4">
              {note.description && note.description.trim() && (
                <p className="text-muted-foreground">{note.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Category: {note.category || "text"}</span>
                <span>•</span>
                <span>Updated: {formatDate(note.updatedAt)}</span>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <MarkdownRenderer content={note.content} />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Note not found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
