"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@/lib/localStorage";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Eye, Pin, PinOff, Copy } from "lucide-react";
import { useRef } from "react";

interface NoteCardProps {
  note: Note;
  onSelect: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}

export default function NoteCard({
  note,
  onSelect,
  onEdit,
  onTogglePin,
  onDelete,
}: NoteCardProps) {
  const { toast } = useToast();
  const deleteConfirmUntilRef = useRef<number>(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getCardVariant = (noteId: string) => {
    const hash = noteId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const variants = [
      "bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-200/20",
      "bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-200/20",
      "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/20",
      "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200/20",
      "bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200/20",
      "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200/20",
      "bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-200/20",
      "bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-200/20",
    ];
    return variants[Math.abs(hash) % variants.length];
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now < deleteConfirmUntilRef.current) {
      onDelete();
      const event = new CustomEvent("show-toast", {
        detail: { message: "Deleted successfully", type: "success" },
      });
      window.dispatchEvent(event);
      deleteConfirmUntilRef.current = 0;
      return;
    }
    deleteConfirmUntilRef.current = now + 3000;
    const event = new CustomEvent("show-toast", {
      detail: { message: "Click delete again to confirm", type: "info" },
    });
    window.dispatchEvent(event);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin();
    const event = new CustomEvent("show-toast", {
      detail: {
        message: note.pinned ? "Note unpinned" : "Note pinned",
        type: "success",
      },
    });
    window.dispatchEvent(event);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const noteText = `# ${note.title}\n\n${
      (note.description || "").trim() ? `${note.description}\n\n` : ""
    }${note.content}`;
    try {
      await navigator.clipboard.writeText(noteText);
      const event = new CustomEvent("show-toast", {
        detail: { message: "Text has been copied", type: "success" },
      });
      window.dispatchEvent(event);
    } catch (err) {
      const event = new CustomEvent("show-toast", {
        detail: { message: "Failed to copy", type: "error" },
      });
      window.dispatchEvent(event);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg hover:scale-[1.02] group relative cursor-pointer",
        getCardVariant(note.id),
        note.pinned && "ring-2 ring-primary/30 shadow-md"
      )}
    >
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePin}
          className={cn(
            "h-8 w-8 p-0 backdrop-blur-sm transition-all hover:scale-110",
            note.pinned
              ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              : "bg-stone-500/20 text-stone-400 hover:bg-stone-500/30"
          )}
          title={note.pinned ? "Unpin note" : "Pin note"}
        >
          {note.pinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          className="h-8 w-8 p-0 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 backdrop-blur-sm transition-all hover:scale-110"
          title="View note"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="h-8 w-8 p-0 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 backdrop-blur-sm transition-all hover:scale-110"
          title="Edit note"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 bg-stone-500/20 text-stone-300 hover:bg-stone-500/30 backdrop-blur-sm transition-all hover:scale-110"
          title="Copy note"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 bg-red-500/20 text-red-400 hover:bg-red-500/30 backdrop-blur-sm transition-all hover:scale-110"
          title="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader className="pb-3 cursor-pointer" onClick={handleView}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 pr-12">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate text-base">{note.title}</h3>
              {note.pinned && <span className="text-sm flex-shrink-0">📌</span>}
              {note.isDraft && (
                <Badge
                  variant="outline"
                  className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300"
                >
                  Draft
                </Badge>
              )}
            </div>
            {note.description && (
              <p className="text-sm text-muted-foreground truncate">
                {note.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 cursor-pointer" onClick={handleView}>
        {/* Content Preview */}
        {note.content && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {truncateContent(note.content)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="truncate font-medium">
            {note.category || "text"}
          </span>
          <span className="flex-shrink-0 ml-2">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
