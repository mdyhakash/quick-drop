"use client"
import { notesStorage } from "@/lib/localStorage"
import NoteEditor from "@/components/NoteEditor"

interface NewNoteProps {
  onSave: () => void
  onCancel: () => void
}

export default function NewNote({ onSave, onCancel }: NewNoteProps) {
  const handleSave = (noteData: any) => {
    notesStorage.saveNote(noteData)
    onSave()
  }

  return <NoteEditor onSave={handleSave} onCancel={onCancel} />
}
