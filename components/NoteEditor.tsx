"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { notesStorage } from "@/lib/localStorage";

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    content: string;
    category?: string;
    isDraft?: boolean;
  };
  onSave: (note: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function NoteEditor({
  initialNote,
  onSave,
  onCancel,
  isEditing = false,
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || "");
  const [content, setContent] = useState(initialNote?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [category, setCategory] = useState(initialNote?.category || "text");
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const draftKey = isEditing
      ? `notebook-edit-note-draft-${initialNote?.id}`
      : "notebook-new-note-draft";
    const interval = setInterval(() => {
      if (title || content) {
        const draft = { title, content };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [title, content, isEditing, initialNote?.id]);

  useEffect(() => {
    if (!isEditing) {
      const draftKey = "notebook-new-note-draft";
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || "");
          setContent(draft.content || "");
        } catch (error) {
          console.error("Failed to load draft:", error);
        }
      }
    }
  }, [isEditing]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content ? content.split("\n").length : 0;
    setWordCount(words);
    setCharCount(content.length);
    setLineCount(lines);
  }, [content]);

  // Auto-save draft functionality
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new timer for auto-save (2 seconds after last change)
    const timer = setTimeout(() => {
      if (content.trim() || title.trim()) {
        const draftData = {
          id: initialNote?.id,
          title: title.trim() || "Draft",
          content: content.trim(),
          category,
        };

        notesStorage.autoSaveDraft(draftData);
        console.log("Auto-saved draft");
      }
    }, 2000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [title, content, category, initialNote?.id]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Please add a title or content before saving.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
      return;
    }

    setIsSaving(true);

    try {
      const noteData = {
        id: initialNote?.id,
        title: title.trim() || "Untitled",
        content: content.trim(),
        category,
      };

      // If this was a draft, publish it
      if (initialNote?.isDraft) {
        notesStorage.publishDraft(initialNote.id);
      } else {
        notesStorage.saveNote(noteData);
      }

      const event = new CustomEvent("show-toast", {
        detail: { message: "Note saved successfully!", type: "success" },
      });
      window.dispatchEvent(event);

      onSave(noteData);
    } catch (error) {
      console.error("Error saving note:", error);
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Failed to save note. Please try again.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const hasChanges =
      title !== (initialNote?.title || "") ||
      content !== (initialNote?.content || "") ||
      category !== (initialNote?.category || "text");

    if (hasChanges) {
      const event = new CustomEvent("show-confirmation", {
        detail: {
          message:
            "You have unsaved changes. Are you sure you want to discard them?",
          onConfirm: () => {
            onCancel();
          },
        },
      });
      window.dispatchEvent(event);
    } else {
      onCancel();
    }
  };

  const renderPlainContent = (content: string) => {
    if (!content)
      return (
        <p className="text-muted-foreground italic">
          Nothing to preview yet. Switch to Write tab to add content.
        </p>
      );

    return (
      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-white">
          {content}
        </pre>
      </div>
    );
  };

  const LineNumbers = ({ content }: { content: string }) => {
    const lines = content ? content.split("\n") : [""];

    return (
      <div className="select-none text-right pr-3 text-xs text-muted-foreground font-mono border-r border-border bg-muted/30">
        {lines.map((_, index) => (
          <div key={index} className="leading-6">
            {index + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
            >
              ← Cancel
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {initialNote ? "Edit Note" : "New Note"}
              </h1>
              {initialNote?.isDraft && (
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
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </div>
              ) : (
                "Save Note"
              )}
            </Button>
          </div>
        </div>

        {/* Note Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Note Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    initialNote?.isDraft ? "Draft" : "Enter note title..."
                  }
                  className="mt-1"
                />
                {initialNote?.isDraft && title === "Draft" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Change the title to save as a regular note
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="text">Text</option>
                  <option value="code">Code</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>

            {/* Word/Character/Line Count */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                Words: {content.trim() ? content.trim().split(/\s+/).length : 0}
              </span>
              <span>Characters: {content.length}</span>
              <span>Lines: {content.split("\n").length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "write" | "preview")
              }
            >
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {activeTab === "write" ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="min-h-[400px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed"
              />
            ) : (
              <div className="min-h-[400px] prose prose-stone max-w-none">
                <MarkdownRenderer
                  content={content || "No content to preview."}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Title Input */}
        <div className="md:hidden mt-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={initialNote?.isDraft ? "Draft" : "Enter note title..."}
            className="mb-4"
          />
        </div>
      </div>
    </div>
  );
}
