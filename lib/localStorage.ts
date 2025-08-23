export interface Note {
  id: string;
  title: string;
  description: string;
  content: string;
  pinned: boolean;
  isPublic: boolean;
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
    return this.getAllNotes().filter((note) => !note.deleted);
  },

  // Get deleted notes
  getDeletedNotes(): Note[] {
    return this.getAllNotes().filter((note) => note.deleted);
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
      pinned: note.pinned || false,
      isPublic: note.isPublic || false,
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
        note.description.toLowerCase().includes(lowercaseQuery) ||
        note.content.toLowerCase().includes(lowercaseQuery)
    );
  },
};
