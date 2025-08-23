"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Note } from "@/lib/localStorage";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Share, Eye, Pin, PinOff } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onSelect: () => void;
  onEdit: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onShare: () => void;
}

export default function NoteCard({
  note,
  onSelect,
  onEdit,
  onTogglePin,
  onDelete,
  onShare,
}: NoteCardProps) {
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
    const event = new CustomEvent("show-confirmation", {
      detail: {
        message: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
        onConfirm: () => onDelete(),
      },
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
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
          onClick={handleShare}
          className="h-8 w-8 p-0 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 backdrop-blur-sm transition-all hover:scale-110"
          title="Share note"
        >
          <Share className="h-4 w-4" />
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
              {note.isPublic && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-500/10 text-green-600 border-green-200"
                >
                  🌐 Public
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

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 4).map((tag, index) => {
              const tagColors = [
                "bg-purple-100 text-purple-700 border-purple-200",
                "bg-pink-100 text-pink-700 border-pink-200",
                "bg-blue-100 text-blue-700 border-blue-200",
                "bg-emerald-100 text-emerald-700 border-emerald-200",
                "bg-orange-100 text-orange-700 border-orange-200",
                "bg-indigo-100 text-indigo-700 border-indigo-200",
              ];
              return (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn("text-xs", tagColors[index % tagColors.length])}
                >
                  {tag}
                </Badge>
              );
            })}
            {note.tags.length > 4 && (
              <Badge
                variant="outline"
                className="text-xs bg-slate-100 text-slate-600"
              >
                +{note.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="truncate font-medium">{note.category}</span>
          <span className="flex-shrink-0 ml-2">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
