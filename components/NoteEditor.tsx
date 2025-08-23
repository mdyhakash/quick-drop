"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NoteEditorProps {
  initialNote?: {
    id?: string;
    title: string;
    description: string;
    content: string;
    pinned: boolean;
    isPublic: boolean;
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
  const [description, setDescription] = useState(
    initialNote?.description || ""
  );
  const [content, setContent] = useState(initialNote?.content || "");
  const [pinned, setPinned] = useState(initialNote?.pinned || false);
  const [isPublic, setIsPublic] = useState(initialNote?.isPublic || false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const draftKey = isEditing
      ? `notebook-edit-note-draft-${initialNote?.id}`
      : "notebook-new-note-draft";
    const interval = setInterval(() => {
      if (title || description || content) {
        const draft = { title, description, content, pinned, isPublic };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [
    title,
    description,
    content,
    pinned,
    isPublic,
    isEditing,
    initialNote?.id,
  ]);

  useEffect(() => {
    if (!isEditing) {
      const draftKey = "notebook-new-note-draft";
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || "");
          setDescription(draft.description || "");
          setContent(draft.content || "");
          setPinned(draft.pinned || false);
          setIsPublic(draft.isPublic || false);
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

  const generateTitleFromContent = (content: string) => {
    if (!content.trim()) return "";

    const firstLine = content.split("\n")[0].trim();
    if (firstLine.length > 0) {
      return firstLine.length > 50
        ? firstLine.substring(0, 50) + "..."
        : firstLine;
    }

    return `Note ${new Date().toLocaleDateString()}`;
  };

  useEffect(() => {
    if (!title && content.trim()) {
      const autoTitle = generateTitleFromContent(content);
      setTitle(autoTitle);
    }
  }, [content, title]);

  const handleSave = async () => {
    let finalTitle = title.trim();
    if (!finalTitle && content.trim()) {
      finalTitle = generateTitleFromContent(content);
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

    if (!finalTitle) {
      finalTitle = `Note ${new Date().toLocaleDateString()}`;
      setTitle(finalTitle);
    }

    setIsSaving(true);
    try {
      const noteData = {
        ...(initialNote?.id && { id: initialNote.id }),
        title: finalTitle,
        description: description.trim(),
        content: content.trim(),
        pinned,
        isPublic,
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
      description !== (initialNote?.description || "") ||
      content !== (initialNote?.content || "") ||
      pinned !== (initialNote?.pinned || false) ||
      isPublic !== (initialNote?.isPublic || false);

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

  const SettingsPanel = ({ isMobile = false }) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Auto-generated from content or enter manually..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 ${isMobile ? "h-12" : ""}`}
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 Tip: Just paste your content and save - title will be
          auto-generated!
        </p>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Brief description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`mt-1 ${isMobile ? "h-12" : ""}`}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="pinned" className={isMobile ? "text-base" : ""}>
            Pin note
          </Label>
          <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="public" className={isMobile ? "text-base" : ""}>
            Make public
          </Label>
          <Switch
            id="public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>
      </div>

      <Separator />

      <div className="text-sm text-muted-foreground space-y-1">
        <div>Words: {wordCount}</div>
        <div>Characters: {charCount}</div>
        <div>Lines: {lineCount}</div>
      </div>
    </div>
  );

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
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <SheetHeader>
                <SheetTitle>Note Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SettingsPanel isMobile />
              </div>
            </SheetContent>
          </Sheet>
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
              Auto-saves as draft every 2 seconds • Paste content for instant
              title generation
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Note Details</CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsPanel />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
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
      </div>

      <div className="md:hidden">
        <div className="p-4">
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
