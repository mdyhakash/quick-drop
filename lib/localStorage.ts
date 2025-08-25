export interface Note {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  tags: string[];
  pinned: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

const NOTES_KEY = "notebook-notes";

export const notesStorage = {
  // Get all notes
  getAllNotes(): Note[] {
    if (typeof window === "undefined") return [];
    try {
      const notes = localStorage.getItem(NOTES_KEY);
      return notes ? JSON.parse(notes) : [];
    } catch {
      return [];
    }
  },

  // Get active (non-deleted) notes
  getActiveNotes(): Note[] {
    return this.getAllNotes().filter((note) => !note.deleted && !note.isDraft);
  },

  // Get deleted notes
  getDeletedNotes(): Note[] {
    return this.getAllNotes().filter((note) => note.deleted);
  },

  // Get draft notes
  getDraftNotes(): Note[] {
    return this.getAllNotes().filter((note) => note.isDraft);
  },

  // Get note by ID
  getNoteById(id: string): Note | null {
    const notes = this.getAllNotes();
    return notes.find((note) => note.id === id) || null;
  },

  // Save note (create or update)
  saveNote(note: Partial<Note>): Note {
    const notes = this.getAllNotes();
    const now = new Date().toISOString();

    if (note.id) {
      // Update existing note
      const index = notes.findIndex((n) => n.id === note.id);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...note, updatedAt: now };
        this.saveAllNotes(notes);
        return notes[index];
      }
    }

    // Create new note
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: note.title || "Untitled",
      description: note.description || "",
      content: note.content || "",
      category: note.category || "text",
      tags: note.tags || [],
      pinned: note.pinned || false,
      isDraft: note.isDraft || false,
      createdAt: now,
      updatedAt: now,
      deleted: false,
    };

    notes.push(newNote);
    this.saveAllNotes(notes);
    return newNote;
  },

  // Soft delete note
  deleteNote(id: string): boolean {
    const notes = this.getAllNotes();
    const index = notes.findIndex((note) => note.id === id);

    if (index !== -1) {
      notes[index].deleted = true;
      notes[index].updatedAt = new Date().toISOString();
      this.saveAllNotes(notes);
      return true;
    }
    return false;
  },

  // Restore note from trash
  restoreNote(id: string): boolean {
    const notes = this.getAllNotes();
    const index = notes.findIndex((note) => note.id === id);

    if (index !== -1) {
      notes[index].deleted = false;
      notes[index].updatedAt = new Date().toISOString();
      this.saveAllNotes(notes);
      return true;
    }
    return false;
  },

  // Permanently delete note
  permanentlyDeleteNote(id: string): boolean {
    const notes = this.getAllNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);

    if (filteredNotes.length !== notes.length) {
      this.saveAllNotes(filteredNotes);
      return true;
    }
    return false;
  },

  // Save all notes to localStorage
  saveAllNotes(notes: Note[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  },

  // Search notes
  searchNotes(query: string): Note[] {
    const notes = this.getActiveNotes();
    const lowercaseQuery = query.toLowerCase();

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowercaseQuery) ||
        (note.description || "").toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Auto-save draft functionality
  autoSaveDraft: (noteData: Partial<Note>): Note => {
    const now = new Date().toISOString();

    const draftData: Partial<Note> = {
      ...noteData,
      title: noteData.title && noteData.title.trim() ? noteData.title : "Draft",
      isDraft: true,
      updatedAt: now,
    };

    if (!noteData.id) {
      draftData.createdAt = now;
    }

    return notesStorage.saveNote(draftData);
  },

  // Convert draft to regular note
  publishDraft: (id: string): Note | null => {
    const note = notesStorage.getNoteById(id);
    if (!note || !note.isDraft) return null;

    const publishedNote = {
      ...note,
      isDraft: false,
      title: note.title === "Draft" ? "Untitled" : note.title,
      updatedAt: new Date().toISOString(),
    };

    return notesStorage.saveNote(publishedNote);
  },

  // Permanently delete all drafts
  deleteAllDrafts: (): number => {
    const notes = notesStorage.getAllNotes();
    const remaining = notes.filter((n) => !n.isDraft);
    const deletedCount = notes.length - remaining.length;
    if (deletedCount > 0) {
      notesStorage.saveAllNotes(remaining);
    }
    return deletedCount;
  },
};
