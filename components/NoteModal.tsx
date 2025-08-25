"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { notesStorage, type Note } from "@/lib/localStorage";
import { exportNoteToPDF } from "@/lib/pdfExport";
import { Edit, Trash2, Calendar, Copy, X, Download } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import ContentWithLineNumbers from "@/components/ContentWithLineNumbers";
import { useRef } from "react";

interface NoteModalProps {
  noteId: string | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  onNoteUpdated: () => void;
}

export default function NoteModal({
  noteId,
  isOpen,
  onClose,
  mode,
  onNoteUpdated,
}: NoteModalProps) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === "edit");
  const [editedNote, setEditedNote] = useState<Partial<Note>>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const deleteConfirmUntilRef = useRef<number>(0);

  useEffect(() => {
    if (noteId && isOpen) {
      const foundNote = notesStorage.getNoteById(noteId);
      setNote(foundNote);
      if (foundNote) {
        setEditedNote({
          title: foundNote.title,
          content: foundNote.content,
          category: foundNote.category,
        });
      }
      setLoading(false);
    }
  }, [noteId, isOpen]);

  useEffect(() => {
    setIsEditing(mode === "edit");
  }, [mode]);

  // Disable autosave while typing in modal; drafts save only on Cancel/Close
  useEffect(() => {
    if (isEditing) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      // Set new timer for auto-save (2 seconds after last change)
      const timer = setTimeout(() => {
        if (editedNote.content?.trim() || editedNote.title?.trim()) {
          const draftData = {
            id: draftId || note?.id,
            title: editedNote.title?.trim() || "Draft",
            content: editedNote.content?.trim() || "",
            category: editedNote.category || "text",
          };
          const saved = notesStorage.autoSaveDraft(draftData);
          if (!draftId) setDraftId(saved.id);
          console.log("Auto-saved draft in modal");
        }
      }, 2000);

      setAutoSaveTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [
    editedNote.title,
    editedNote.content,
    editedNote.category,
    note?.id,
    draftId,
    isEditing,
  ]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

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
        detail: { message: "Text has been copied", type: "success" },
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
          onNoteUpdated();
          onClose();
        },
      },
    });
    window.dispatchEvent(event);
  };

  const handleSave = async () => {
    if (!note || !editedNote.title?.trim()) {
      const event = new CustomEvent("show-toast", {
        detail: { message: "Please add a title before saving.", type: "error" },
      });
      window.dispatchEvent(event);
      return;
    }

    try {
      // If current note is a draft, publish it with edited values
      if (note.isDraft) {
        const finalTitle =
          editedNote.title!.trim() ||
          (note.title === "Draft" ? "Untitled" : note.title);
        const finalContent = (editedNote.content ?? note.content) || "";
        const finalCategory = editedNote.category || note.category || "text";
        const updatedNote = {
          id: note.id,
          title: finalTitle,
          content: finalContent,
          category: finalCategory,
          isDraft: false,
        } as Partial<Note>;
        notesStorage.saveNote(updatedNote);
      } else {
        const updatedNote = {
          ...note,
          ...editedNote,
          updatedAt: new Date().toISOString(),
        };
        notesStorage.saveNote(updatedNote);
      }

      const event = new CustomEvent("show-toast", {
        detail: { message: "Note updated successfully!", type: "success" },
      });
      window.dispatchEvent(event);

      onNoteUpdated();
      const ping = new CustomEvent("refresh-notes", {});
      window.dispatchEvent(ping);
      setIsEditing(false);
      // Reload the note from storage to reflect status changes (draft -> active)
      if (note?.id) {
        const refreshed = notesStorage.getNoteById(note.id);
        setNote(refreshed);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Failed to save note. Please try again.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      // Save draft if there are changes
      if (editedNote.title?.trim() || editedNote.content?.trim()) {
        const draftData = {
          id: draftId || note?.id,
          title: editedNote.title?.trim() || "Draft",
          content: editedNote.content?.trim() || "",
          category: editedNote.category || "text",
        };
        notesStorage.autoSaveDraft(draftData);
        console.log("Auto-saved draft on cancel");
      }
      // If it's a draft, close the modal entirely instead of switching to view
      if (note?.isDraft) {
        onClose();
        return;
      }
      // For non-drafts, exit edit mode back to view without closing
      setIsEditing(false);
      setEditedNote({
        title: note?.title || "",
        content: note?.content || "",
        category: note?.category || "text",
      });
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    if (isEditing && (editedNote.title?.trim() || editedNote.content?.trim())) {
      const draftData = {
        id: draftId || note?.id,
        title: editedNote.title?.trim() || "Draft",
        content: editedNote.content?.trim() || "",
        category: editedNote.category || "text",
      };
      const saved = notesStorage.autoSaveDraft(draftData);
      if (!draftId) setDraftId(saved.id);
      const ping = new CustomEvent("refresh-notes", {});
      window.dispatchEvent(ping);
    }
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-black rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
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
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-black rounded-lg p-8 max-w-md mx-4 text-center border border-stone-800"
          onClick={(e) => e.stopPropagation()}
        >
          <h1 className="text-2xl font-bold mb-4 text-white">Note Not Found</h1>
          <p className="text-stone-400 mb-6">
            The note you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-black rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-stone-800 p-6 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleCancel}
                variant="ghost"
                className="h-10 w-10 p-0 text-white hover:bg-white/10"
                title={isEditing ? "Cancel" : "Close"}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">
                  {isEditing ? "Edit Note" : note.title}
                </h1>
                {note.isDraft && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Draft
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    className="h-10 w-10 p-0 text-white hover:bg-white/10"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleCopyNote}
                    variant="ghost"
                    className="h-10 w-10 p-0 text-white hover:bg-white/10"
                    title="Copy"
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    variant="ghost"
                    className="h-10 w-10 p-0 text-white hover:bg-white/10 disabled:opacity-50"
                    title="Download PDF"
                  >
                    {isExporting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!note) return;
                      notesStorage.deleteNote(note.id);
                      const success = new CustomEvent("show-toast", {
                        detail: {
                          message: "Deleted successfully",
                          type: "success",
                        },
                      });
                      window.dispatchEvent(success);
                      onNoteUpdated();
                      const ping = new CustomEvent("refresh-notes", {});
                      window.dispatchEvent(ping);
                      onClose();
                    }}
                    variant="ghost"
                    className="h-10 w-10 p-0 text-white hover:bg-white/10"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </>
              )}
              {isEditing && (
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </div>

          {/* Note Status */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-slate-100 text-slate-700">
              {note.category || "text"}
            </Badge>
            {note.pinned && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700">
                📌 Pinned
              </Badge>
            )}
            {note.isDraft && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-700"
              >
                Draft
              </Badge>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-stone-400">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(note.updatedAt)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              {/* Edit Form */}
              <Card className="bg-stone-900/50 border-stone-800">
                <CardHeader>
                  <CardTitle className="text-white">Note Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={editedNote.title || ""}
                      onChange={(e) =>
                        setEditedNote({ ...editedNote, title: e.target.value })
                      }
                      placeholder="Enter note title..."
                      className="mt-1 bg-stone-800 border-stone-700 text-white placeholder:text-stone-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-white">
                      Category
                    </Label>
                    <select
                      id="category"
                      value={editedNote.category || "text"}
                      onChange={(e) =>
                        setEditedNote({
                          ...editedNote,
                          category: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-stone-700 rounded-md bg-stone-800 text-white"
                    >
                      <option value="text">Text</option>
                      <option value="code">Code</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-stone-900/50 border-stone-800">
                <CardHeader>
                  <CardTitle className="text-white">Content</CardTitle>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                      setActiveTab(value as "write" | "preview")
                    }
                  >
                    <TabsList className="bg-stone-800">
                      <TabsTrigger
                        value="write"
                        className="text-white data-[state=active]:bg-stone-700"
                      >
                        Write
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        className="text-white data-[state=active]:bg-stone-700"
                      >
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  {activeTab === "write" ? (
                    <Textarea
                      value={editedNote.content || ""}
                      onChange={(e) =>
                        setEditedNote({
                          ...editedNote,
                          content: e.target.value,
                        })
                      }
                      placeholder="Start writing your note..."
                      className="min-h-[400px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed bg-stone-800 text-white placeholder:text-stone-400"
                    />
                  ) : (
                    <div className="min-h-[400px] prose prose-stone max-w-none bg-stone-800 p-4 rounded">
                      <MarkdownRenderer
                        content={editedNote.content || "No content to preview."}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="bg-stone-900/50 rounded-lg p-6 border border-stone-800">
              {/* Content Display */}
              {note.content ? (
                <ContentWithLineNumbers content={note.content} />
              ) : (
                <p className="text-stone-500 italic">No content available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
