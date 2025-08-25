"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notesStorage, type Note } from "@/lib/localStorage";
import NoteView from "@/components/NoteView";
import NoteEdit from "@/components/NoteEdit";
import { useSearchParams } from "next/navigation";

export default function NotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params.id as string;
  const isEdit = searchParams.get("edit") === "true";
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharedNote, setIsSharedNote] = useState(false);

  useEffect(() => {
    if (noteId) {
      const foundNote = notesStorage.getNoteById(noteId);
      if (foundNote) {
        setNote(foundNote);
        setIsSharedNote(false);
      } else {
        // This is a shared note that doesn't exist in current localStorage
        setIsSharedNote(true);
      }
      setLoading(false);
    }
  }, [noteId]);

  const handleBack = () => {
    if (isSharedNote) {
      // For shared notes, redirect to home
      window.location.href = "/";
    } else {
      window.history.back();
    }
  };

  const handleEdit = () => {
    if (isSharedNote) {
      // For shared notes, redirect to home since we can't edit them
      window.location.href = "/";
      return;
    }
    
    const url = new URL(window.location.href);
    url.searchParams.set("edit", "true");
    window.history.pushState({}, "", url.toString());
    window.location.reload();
  };

  const handleSave = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    window.history.pushState({}, "", url.toString());
    window.location.reload();
  };

  const handleCancel = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    window.history.pushState({}, "", url.toString());
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isSharedNote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold mb-4">Shared Note</h1>
          <p className="text-muted-foreground mb-6">
            This note was shared with you, but it's not available in your current browser. 
            The note may have been deleted or the link has expired.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The note you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isEdit) {
    return (
      <NoteEdit noteId={noteId} onSave={handleSave} onCancel={handleCancel} />
    );
  }

  return <NoteView noteId={noteId} onEdit={handleEdit} onBack={handleBack} />;
}
