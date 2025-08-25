"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    content: string;
    category?: string;
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

  const handleSave = async () => {
    let finalTitle = title.trim();
    if (!finalTitle) {
      finalTitle = `Note ${new Date().toLocaleDateString()}`;
      setTitle(finalTitle);
    }

    if (!content.trim()) {
      const event = new CustomEvent("show-toast", {
        detail: {
          message: "Please add some content to your note.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
      return;
    }

    setIsSaving(true);
    try {
      const noteData = {
        ...(initialNote?.id && { id: initialNote.id }),
        title: finalTitle,
        content: content.trim(),
        category,
      };

      onSave(noteData);

      const draftKey = isEditing
        ? `notebook-edit-note-draft-${initialNote?.id}`
        : "notebook-new-note-draft";
      localStorage.removeItem(draftKey);

      const event = new CustomEvent("show-toast", {
        detail: {
          message: isEditing
            ? "Note updated successfully!"
            : "Note saved successfully!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to save note:", error);
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
      content !== (initialNote?.content || "");

    if (hasChanges) {
      const event = new CustomEvent("show-confirmation", {
        detail: {
          message: "You have unsaved changes. Are you sure you want to cancel?",
          onConfirm: () => {
            const draftKey = isEditing
              ? `notebook-edit-note-draft-${initialNote?.id}`
              : "notebook-new-note-draft";
            localStorage.removeItem(draftKey);
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
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b p-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:from-pink-600 hover:to-rose-600"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {isEditing ? "Edit Note" : "New Note"}
              </h1>
              <p className="text-xs text-muted-foreground">
                Auto-saves every 2s
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block p-4 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 hover:from-purple-600 hover:to-violet-600"
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {isEditing ? "Edit Note" : "Create New Note"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Auto-saves as draft every 2 seconds
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Note Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 bg-background text-foreground"
                >
                  <option value="text">Text</option>
                  <option value="code">Code</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
                <div>Words: {wordCount}</div>
                <div>Characters: {charCount}</div>
                <div>Lines: {lineCount}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
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
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="write" className="space-y-4">
                  <div className="flex border rounded-lg overflow-hidden">
                    <LineNumbers content={content} />
                    <Textarea
                      ref={textareaRef}
                      placeholder="Write your note content here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[400px] resize-y font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="min-h-[400px] p-4 border rounded-lg bg-background">
                    {renderPlainContent(content)}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Save Note"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-12 px-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 hover:from-rose-600 hover:to-pink-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor="mobile-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="mobile-title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "write" | "preview")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-4">
              <div className="flex border rounded-lg overflow-hidden">
                <LineNumbers content={content} />
                <Textarea
                  ref={textareaRef}
                  placeholder="Write your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[60vh] resize-none font-mono text-base leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="min-h-[60vh] p-4 border rounded-lg bg-background">
                {renderPlainContent(content)}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 bg-background border-t p-4 pb-24">
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Save Note"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-12 px-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 hover:from-rose-600 hover:to-pink-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
