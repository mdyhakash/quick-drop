"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { notesStorage } from "@/lib/localStorage";

interface NewNoteProps {
  onSave: () => void;
  onCancel: () => void;
}

export default function NewNote({ onSave, onCancel }: NewNoteProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("text");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  // No autosave while typing; drafts are saved only on Cancel/back

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
        title: title.trim() || "Untitled",
        content: content.trim(),
        category,
      };

      notesStorage.saveNote(noteData);

      // If there was a draft created previously, remove it
      if (draftId) {
        try {
          notesStorage.permanentlyDeleteNote(draftId);
        } catch {}
        setDraftId(null);
      }

      const event = new CustomEvent("show-toast", {
        detail: { message: "Note saved successfully!", type: "success" },
      });
      window.dispatchEvent(event);

      onSave();
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
    // Save draft only when user clicks back/cancel
    if (title.trim() || content.trim()) {
      const draftData = {
        id: draftId || undefined,
        title: title.trim() || "Draft",
        content: content.trim(),
        category,
      };
      const saved = notesStorage.autoSaveDraft(draftData);
      if (!draftId) setDraftId(saved.id);
      const ping = new CustomEvent("refresh-notes", {});
      window.dispatchEvent(ping);
    }
    // No confirmation needed - just go back
    onCancel();
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
              <h1 className="text-2xl font-bold">New Note</h1>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                Draft
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-sm text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
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
                  placeholder="Draft"
                  className="mt-1"
                />
                {title === "Draft" && (
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
            placeholder="Draft"
            className="mb-4"
          />
        </div>
      </div>
    </div>
  );
}
