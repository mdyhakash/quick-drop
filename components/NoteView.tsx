"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { notesStorage, type Note } from "@/lib/localStorage";
import { exportNoteToPDF } from "@/lib/pdfExport";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ContentWithLineNumbers from "@/components/ContentWithLineNumbers";
import {
  Edit,
  Trash2,
  Share,
  Calendar,
  Copy,
  Link,
  Facebook,
  Twitter,
  MessageCircle,
  X,
} from "lucide-react";
import ShareDialog from "@/components/ShareDialog";

interface NoteViewProps {
  noteId: string;
  onEdit: () => void;
  onBack: () => void;
}

export default function NoteView({ noteId, onEdit, onBack }: NoteViewProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    const loadNote = () => {
      const foundNote = notesStorage.getNoteById(noteId);
      setNote(foundNote);
      setLoading(false);
    };

    loadNote();
  }, [noteId]);

  const handleCopyNote = async () => {
    if (!note) return;

    const noteText = `# ${note.title}\n\n${
      note.description ? `${note.description}\n\n` : ""
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

  const handleCopyContent = async () => {
    if (!note) return;

    try {
      await navigator.clipboard.writeText(note.content);
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Note content copied to clipboard!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to copy content:", error);
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Failed to copy content to clipboard.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }
  };

  const handleShare = async () => {
    if (!note) return;

    if (note.isPublic) {
      const shareUrl = `${window.location.origin}/note/${note.id}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        const event = new CustomEvent("show-toast", {
          detail: {
            message: "Public note link copied to clipboard!",
            type: "success",
          },
        });
        window.dispatchEvent(event);
      } catch (error) {
        const event = new CustomEvent("show-toast", {
          detail: { message: "Failed to copy share link.", type: "error" },
        });
        window.dispatchEvent(event);
      }
    } else {
      const shareText = `${note.title}\n\n${
        note.description ? `${note.description}\n\n` : ""
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
    }
  };

  const handleSharePublicLink = async () => {
    if (!note) return;

    try {
      // Make note public if it isn't already
      if (!note.isPublic) {
        const updatedNote = { ...note, isPublic: true };
        notesStorage.saveNote(updatedNote);
        setNote(updatedNote);
      }

      const shareUrl = `${window.location.origin}/note/${note.id}`;
      await navigator.clipboard.writeText(shareUrl);

      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Public link generated and copied to clipboard!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      const event = new CustomEvent("show-toast", {
        detail: { message: "Failed to generate public link.", type: "error" },
      });
      window.dispatchEvent(event);
    }
  };

  const handleShareToFacebook = async () => {
    if (!note) return;

    // Make note public if it isn't already
    if (!note.isPublic) {
      const updatedNote = { ...note, isPublic: true };
      notesStorage.saveNote(updatedNote);
      setNote(updatedNote);
    }

    const shareUrl = `${window.location.origin}/note/${note.id}`;
    const shareText = `${note.title}\n\n${
      note.description ? `${note.description}\n\n` : ""
    }${note.content.substring(0, 200)}...`;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleShareToTwitter = async () => {
    if (!note) return;

    // Make note public if it isn't already
    if (!note.isPublic) {
      const updatedNote = { ...note, isPublic: true };
      notesStorage.saveNote(updatedNote);
      setNote(updatedNote);
    }

    const shareUrl = `${window.location.origin}/note/${note.id}`;
    const shareText = `${note.title}\n\n${
      note.description ? `${note.description}\n\n` : ""
    }${note.content.substring(0, 100)}...`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleShareToWhatsApp = async () => {
    if (!note) return;

    // Make note public if it isn't already
    if (!note.isPublic) {
      const updatedNote = { ...note, isPublic: true };
      notesStorage.saveNote(updatedNote);
      setNote(updatedNote);
    }

    const shareUrl = `${window.location.origin}/note/${note.id}`;
    const shareText = `${note.title}\n\n${
      note.description ? `${note.description}\n\n` : ""
    }${note.content.substring(0, 200)}...`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      shareText + "\n\n" + shareUrl
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleExportPDF = async () => {
    if (!note) return;

    setIsExporting(true);
    try {
      const success = await exportNoteToPDF(note);
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
          onBack();
        },
      },
    });
    window.dispatchEvent(event);
  };

  const handleOpenShareDialog = () => {
    if (!note) return;

    // Make note public if it isn't already
    if (!note.isPublic) {
      const updatedNote = { ...note, isPublic: true };
      notesStorage.saveNote(updatedNote);
      setNote(updatedNote);
    }

    setShowShareDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-black">
        <div className="p-4 max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-800 rounded mb-4"></div>
            <div className="h-4 bg-stone-800 rounded mb-2"></div>
            <div className="h-4 bg-stone-800 rounded mb-4 w-3/4"></div>
            <div className="h-32 bg-stone-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="bg-black">
        <div className="p-4 max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Note Not Found</h1>
          <p className="text-stone-400 mb-4">
            The note you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={onBack}
            className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      <div className="p-4 max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            ← Back to Notes
          </Button>
        </div>

        <div className="flex items-start justify-between mb-8">
          {/* Left side - Title and description */}
          <div className="flex-1 mr-8">
            <h1 className="text-4xl font-bold text-white mb-2">{note.title}</h1>
            {note.description && (
              <p className="text-stone-400 text-lg">{note.description}</p>
            )}
          </div>

          {/* Right side - Action buttons and date */}
          <div className="flex flex-col items-end gap-4">
            {/* Action buttons row */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit()}
                className="h-10 w-10 p-0 bg-stone-900 border-stone-700 hover:bg-stone-800 text-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="h-10 w-10 p-0 bg-stone-900 border-stone-700 hover:bg-stone-800 text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenShareDialog}
                className="h-10 w-10 p-0 bg-stone-900 border-stone-700 hover:bg-stone-800 text-white"
              >
                <Share className="h-4 w-4" />
              </Button>
              <ShareDialog
                open={showShareDialog}
                onOpenChange={setShowShareDialog}
                note={note}
                setNote={setNote}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="h-10 w-10 p-0 bg-stone-900 border-stone-700 hover:bg-stone-800 text-white"
              >
                {isExporting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
              </Button>
            </div>

            {/* Date with calendar icon */}
            <div className="flex items-center gap-2 text-stone-400">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatDate(note.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Tags and category */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {note.pinned && (
            <Badge
              variant="outline"
              className="bg-purple-900/20 border-purple-700 text-purple-300"
            >
              📌 Pinned
            </Badge>
          )}
          {note.isPublic && (
            <Badge
              variant="outline"
              className="bg-green-900/20 border-green-700 text-green-300"
            >
              🌐 Public
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="bg-stone-900/50 rounded-lg p-6 border border-stone-800">
          {/* Content Display */}
          {note.content ? (
            <ContentWithLineNumbers content={note.content} />
          ) : (
            <p className="text-stone-500 italic">No content available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
