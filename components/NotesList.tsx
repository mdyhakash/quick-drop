"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { notesStorage, type Note } from "@/lib/localStorage";
import NoteCard from "@/components/NoteCard";
import NoteModal from "@/components/NoteModal";

interface NotesListProps {
  onNoteSelect: (id: string) => void;
  onNoteEdit: (id: string) => void;
}

type SortOption = "recent" | "code" | "text" | "json";

export default function NotesList({
  onNoteSelect,
  onNoteEdit,
}: NotesListProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNoteId, setModalNoteId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  // two-click delete confirmation memory
  const deleteConfirmUntilRef = useRef<Record<string, number>>({});

  useEffect(() => {
    loadNotes();

    const refresh = () => loadNotes();
    window.addEventListener("refresh-notes", refresh as EventListener);
    window.addEventListener("focus", refresh as EventListener);
    window.addEventListener("pageshow", refresh as EventListener);
    window.addEventListener("storage", refresh as EventListener);
    return () => {
      window.removeEventListener("refresh-notes", refresh as EventListener);
      window.removeEventListener("focus", refresh as EventListener);
      window.removeEventListener("pageshow", refresh as EventListener);
      window.removeEventListener("storage", refresh as EventListener);
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, notes, sortBy, selectedCategories, selectedTags]);

  const loadNotes = () => {
    const allNotes = notesStorage.getActiveNotes();
    const draftNotes = notesStorage.getDraftNotes();
    console.log("Loaded notes:", allNotes.length);
    console.log("Loaded drafts:", draftNotes.length);
    console.log(
      "Sample notes:",
      allNotes.slice(0, 3).map((n) => ({
        id: n.id,
        title: n.title,
        category: n.category,
        tags: n.tags,
      }))
    );
    setNotes(allNotes);

    // Extract unique categories and tags
    const categories = [
      ...new Set(allNotes.map((note) => note.category).filter(Boolean)),
    ];
    const tags = [...new Set(allNotes.flatMap((note) => note.tags || []))];

    console.log("Available categories:", categories);
    console.log("Available tags:", tags);

    setAvailableCategories(categories.sort());
    setAvailableTags(tags.sort());
  };

  const applyFiltersAndSort = () => {
    console.log("Applying filters and sort:", {
      sortBy,
      searchQuery,
      selectedCategories,
      selectedTags,
    });
    console.log("Total notes before filtering:", notes.length);

    let filtered = [...notes];

    // Primary sort mode drives category filtering
    if (sortBy === "code" || sortBy === "text" || sortBy === "json") {
      filtered = filtered.filter((n) => n.category === sortBy);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          (note.description &&
            note.description.toLowerCase().includes(query)) ||
          note.content.toLowerCase().includes(query) ||
          (note.category && note.category.toLowerCase().includes(query)) ||
          (note.tags &&
            note.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
      console.log("After search filter:", filtered.length);
    }

    // Apply category filter controls (additional)
    if (selectedCategories.length > 0) {
      console.log("Filtering by categories (chips):", selectedCategories);
      filtered = filtered.filter((note) =>
        selectedCategories.includes(note.category)
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      console.log("Filtering by tags:", selectedTags);
      filtered = filtered.filter(
        (note) =>
          note.tags && note.tags.some((tag) => selectedTags.includes(tag))
      );
    }

    // Sort by most recent updated at the end
    filtered.sort((a, b) => {
      // Pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    setFilteredNotes(filtered);
  };

  const handleTogglePin = (id: string) => {
    const note = notesStorage.getNoteById(id);
    if (note) {
      notesStorage.saveNote({ ...note, pinned: !note.pinned });
      loadNotes();
    }
  };

  const handleDeleteNote = (id: string) => {
    notesStorage.deleteNote(id);
    const success = new CustomEvent("show-toast", {
      detail: { message: "Deleted successfully", type: "success" },
    });
    window.dispatchEvent(success);
    loadNotes();
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const handleTagToggle = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy("recent");
  };

  const activeFiltersCount =
    selectedCategories.length + selectedTags.length + (searchQuery ? 1 : 0);

  // Modal handlers
  const handleViewNote = (noteId: string) => {
    setModalNoteId(noteId);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEditNote = (noteId: string) => {
    setModalNoteId(noteId);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalNoteId(null);
  };

  const handleNoteUpdated = () => {
    loadNotes();
    // If a note was deleted, ensure modal is closed
    setModalOpen(false);
    setModalNoteId(null);
  };

  return (
    <div className="px-3 py-3 pb-16 sm:pb-4 sm:p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">My Notes</h1>
            <p className="text-sm text-muted-foreground">
              {filteredNotes.length} of {notes.length} notes
              {activeFiltersCount > 0 &&
                ` (${activeFiltersCount} filter${
                  activeFiltersCount > 1 ? "s" : ""
                } active)`}
            </p>
          </div>
          <Button
            onClick={() => {
              // Use direct navigation instead of history.pushState for better performance
              window.location.href = "/new";
            }}
            className="hidden md:flex bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            New Note
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/new";
            }}
            className="md:hidden h-9 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            New
          </Button>
        </div>

        {/* Drafts Section */}
        {(() => {
          const draftNotes = notesStorage
            .getDraftNotes()
            .slice()
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
          if (draftNotes.length > 0) {
            return (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h2 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                    📝 Drafts ({draftNotes.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Use direct navigation for better performance
                        window.location.href = "/new";
                      }}
                      className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                    >
                      Continue Writing
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const count = notesStorage.deleteAllDrafts();
                        const event = new CustomEvent("show-toast", {
                          detail: {
                            message:
                              count > 0
                                ? `Deleted ${count} draft${
                                    count > 1 ? "s" : ""
                                  }`
                                : "No drafts to delete",
                            type: "success",
                          },
                        });
                        window.dispatchEvent(event);
                        loadNotes();
                        const ping = new CustomEvent("refresh-notes", {});
                        window.dispatchEvent(ping);
                      }}
                      className="bg-rose-500 text-white border-0 hover:bg-rose-600"
                    >
                      Delete All
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {draftNotes.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-3 bg-white border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors"
                      onClick={() => handleEditNote(draft.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 text-xs"
                        >
                          Draft
                        </Badge>
                        <span className="text-xs text-yellow-600">
                          {new Date(draft.updatedAt).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <h3 className="font-medium text-yellow-900 mb-1">
                        {draft.title === "Draft"
                          ? "Untitled Draft"
                          : draft.title}
                      </h3>
                      <p className="text-sm text-yellow-700 line-clamp-2">
                        {draft.content.substring(0, 100)}
                        {draft.content.length > 100 ? "..." : ""}
                      </p>
                      <div className="mt-2 text-xs text-yellow-600">
                        {draft.content.length} characters
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        <div className="flex gap-2 mb-3 sm:mb-4">
          <Input
            placeholder="Search notes by title, content, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />

          {/* Desktop Compact Controls */}
          <div className="hidden md:flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-32 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="h-10 bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 hover:from-rose-600 hover:to-pink-600"
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden relative bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 hover:from-purple-600 hover:to-violet-600"
              >
                Filter
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-rose-500"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filter & Sort</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterControls
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  availableCategories={availableCategories}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                  onClearAll={clearAllFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
            {searchQuery && (
              <Badge
                variant="secondary"
                className="cursor-pointer bg-blue-100 text-blue-700 hover:bg-blue-200"
                onClick={() => setSearchQuery("")}
              >
                Search: "{searchQuery}" ×
              </Badge>
            )}
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer bg-purple-100 text-purple-700 hover:bg-purple-200"
                onClick={() => handleCategoryToggle(category, false)}
              >
                Category: {category} ×
              </Badge>
            ))}
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                onClick={() => handleTagToggle(tag, false)}
              >
                Tag: {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-10 sm:py-12">
          <p className="text-muted-foreground mb-4">
            {notes.length === 0
              ? "No notes yet. Create your first note!"
              : activeFiltersCount > 0
              ? "No notes match your current filters."
              : "No notes found."}
          </p>
          {notes.length === 0 ? (
            <Button
              onClick={() => {
                // Use direct navigation for better performance
                window.location.href = "/new";
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              Create First Note
            </Button>
          ) : activeFiltersCount > 0 ? (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 hover:from-rose-600 hover:to-pink-600"
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onSelect={() => handleViewNote(note.id)}
              onEdit={() => handleEditNote(note.id)}
              onTogglePin={() => handleTogglePin(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      )}

      {/* Small Floating New Button for Mobile */}
      <Button
        onClick={() => {
          window.location.href = "/new";
        }}
        className="fixed bottom-3 right-3 h-10 w-10 rounded-full shadow-lg z-50 md:hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        size="icon"
        title="New Note"
      >
        +
      </Button>

      {/* FAB removed for mobile to hide bottom UI */}

      {/* Note Modal */}
      <NoteModal
        noteId={modalNoteId}
        isOpen={modalOpen}
        onClose={handleModalClose}
        mode={modalMode}
        onNoteUpdated={handleNoteUpdated}
      />
    </div>
  );
}

interface FilterControlsProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  availableCategories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string, checked: boolean) => void;
  availableTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string, checked: boolean) => void;
  onClearAll: () => void;
}

function FilterControls({
  sortBy,
  setSortBy,
  availableCategories,
  selectedCategories,
  onCategoryToggle,
  availableTags,
  selectedTags,
  onTagToggle,
  onClearAll,
}: FilterControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Sort by</label>
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filters */}
      {availableCategories.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Categories</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableCategories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) =>
                    onCategoryToggle(category, checked as boolean)
                  }
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tag Filters */}
      {availableTags.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag}`}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) =>
                    onTagToggle(tag, checked as boolean)
                  }
                />
                <label
                  htmlFor={`tag-${tag}`}
                  className="text-sm cursor-pointer"
                >
                  {tag}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      <Button
        variant="outline"
        onClick={onClearAll}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 hover:from-rose-600 hover:to-pink-600"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
