"use client";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, notes, sortBy, selectedCategories, selectedTags]);

  const loadNotes = () => {
    const allNotes = notesStorage.getActiveNotes();
    const draftNotes = notesStorage.getDraftNotes();
    console.log("Loaded notes:", allNotes.length);
    console.log("Loaded drafts:", draftNotes.length);
    setNotes(allNotes);

    // Extract unique categories and tags
    const categories = [
      ...new Set(allNotes.map((note) => note.category).filter(Boolean)),
    ];
    const tags = [...new Set(allNotes.flatMap((note) => note.tags))];

    console.log("Available categories:", categories);
    console.log("Available tags:", tags);

    setAvailableCategories(categories.sort());
    setAvailableTags(tags.sort());
  };

  const applyFiltersAndSort = () => {
    console.log("Applying filters and sort:", { sortBy, searchQuery, selectedCategories, selectedTags });
    
    let filtered = [...notes];

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

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((note) =>
        selectedCategories.includes(note.category)
      );
      console.log("After category filter:", filtered.length);
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(
        (note) =>
          note.tags && note.tags.some((tag) => selectedTags.includes(tag))
      );
      console.log("After tag filter:", filtered.length);
    }

    // Apply sorting based on selected option
    filtered.sort((a, b) => {
      // Always show pinned notes first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case "code":
          // Show code notes first, then sort by update time
          if (a.category === "code" && b.category !== "code") return -1;
          if (a.category !== "code" && b.category === "code") return 1;
          // If both have same category priority, sort by update time
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "text":
          // Show text notes first, then sort by update time
          if (a.category === "text" && b.category !== "text") return -1;
          if (a.category !== "text" && b.category === "text") return 1;
          // If both have same category priority, sort by update time
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "json":
          // Show JSON notes first, then sort by update time
          if (a.category === "json" && b.category !== "json") return -1;
          if (a.category !== "json" && b.category === "json") return 1;
          // If both have same category priority, sort by update time
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "recent":
        default:
          // Sort by most recently updated
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    console.log("Final filtered and sorted notes:", filtered.length);
    console.log("Sort by:", sortBy);
    console.log("First few notes:", filtered.slice(0, 3).map(n => ({ title: n.title, category: n.category, updatedAt: n.updatedAt })));
    
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
    const event = new CustomEvent("show-toast", {
      detail: { message: "Note moved to trash successfully", type: "success" },
    });
    window.dispatchEvent(event);
    notesStorage.deleteNote(id);
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

  return (
    <div className="p-4 max-w-6xl mx-auto">
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
            onClick={() => window.history.pushState({}, "", "/new")}
            className="hidden md:flex bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            New Note
          </Button>
        </div>

        {/* Drafts Section */}
        {(() => {
          const draftNotes = notesStorage.getDraftNotes();
          if (draftNotes.length > 0) {
            return (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                    📝 Drafts ({draftNotes.length})
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.history.pushState({}, "", "/new")}
                    className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                  >
                    Continue Writing
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {draftNotes.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-3 bg-white border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-50 transition-colors"
                      onClick={() => onNoteEdit(draft.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          Draft
                        </Badge>
                        <span className="text-xs text-yellow-600">
                          {new Date(draft.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-medium text-yellow-900 mb-1">
                        {draft.title === "Draft" ? "Untitled Draft" : draft.title}
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

        <div className="flex gap-2 mb-4">
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
          <div className="flex flex-wrap gap-2 mt-4">
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
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {notes.length === 0
              ? "No notes yet. Create your first note!"
              : activeFiltersCount > 0
              ? "No notes match your current filters."
              : "No notes found."}
          </p>
          {notes.length === 0 ? (
            <Button
              onClick={() => window.history.pushState({}, "", "/new")}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onSelect={() => onNoteSelect(note.id)}
              onEdit={() => onNoteEdit(note.id)}
              onTogglePin={() => handleTogglePin(note.id)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <Button
        onClick={() => window.history.pushState({}, "", "/new")}
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        size="icon"
      >
        +
      </Button>
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
