"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { notesStorage, type Note } from "@/lib/localStorage"
import NoteEditor from "@/components/NoteEditor"

interface NoteEditProps {
  noteId: string
  onSave: () => void
  onCancel: () => void
}

export default function NoteEdit({ noteId, onSave, onCancel }: NoteEditProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNote = () => {
      const foundNote = notesStorage.getNoteById(noteId)
      setNote(foundNote)
      setLoading(false)
    }

    loadNote()
  }, [noteId])

  const handleSave = (noteData: any) => {
    notesStorage.saveNote(noteData)
    onSave()
  }

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="p-4 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
        <p className="text-muted-foreground mb-4">The note you're trying to edit doesn't exist.</p>
        <Button onClick={onCancel}>Back</Button>
      </div>
    )
  }

  return <NoteEditor initialNote={note} onSave={handleSave} onCancel={onCancel} isEditing />
}
