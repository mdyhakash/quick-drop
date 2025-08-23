"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { notesStorage, type Note } from "@/lib/localStorage";

interface TrashBinProps {
  onBack: () => void;
}

type SortOption = "deleted" | "title" | "category";

export default function TrashBin({ onBack }: TrashBinProps) {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("deleted");
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDeletedNotes();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [deletedNotes, searchQuery, sortBy]);

  const loadDeletedNotes = () => {
    const notes = notesStorage.getDeletedNotes();
    setDeletedNotes(notes);
    setSelectedNotes(new Set()); // Clear selection when reloading
  };

  const applyFiltersAndSort = () => {
    let filtered = [...deletedNotes];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.description.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.category.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "category":
          return a.category.localeCompare(b.category);
        case "deleted":
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });

    setFilteredNotes(filtered);
  };

  const handleRestore = (id: string) => {
    if (confirm("Are you sure you want to restore this note?")) {
      notesStorage.restoreNote(id);
      loadDeletedNotes();
    }
  };

  const handlePermanentDelete = (id: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this note? This action cannot be undone."
      )
    ) {
      notesStorage.permanentlyDeleteNote(id);
      loadDeletedNotes();
    }
  };

  const handleBulkRestore = () => {
    if (selectedNotes.size === 0) return;

    if (
      confirm(
        `Are you sure you want to restore ${selectedNotes.size} selected notes?`
      )
    ) {
      selectedNotes.forEach((id) => {
        notesStorage.restoreNote(id);
      });
      loadDeletedNotes();
    }
  };

  const handleBulkDelete = () => {
    if (selectedNotes.size === 0) return;

    if (
      confirm(
        `Are you sure you want to permanently delete ${selectedNotes.size} selected notes? This action cannot be undone.`
      )
    ) {
      selectedNotes.forEach((id) => {
        notesStorage.permanentlyDeleteNote(id);
      });
      loadDeletedNotes();
    }
  };

  const handleEmptyTrash = () => {
    if (deletedNotes.length === 0) return;

    if (
      confirm(
        `Are you sure you want to permanently delete all ${deletedNotes.length} notes in trash? This action cannot be undone.`
      )
    ) {
      deletedNotes.forEach((note) => {
        notesStorage.permanentlyDeleteNote(note.id);
      });
      loadDeletedNotes();
    }
  };

  const handleSelectNote = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedNotes(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(new Set(filteredNotes.map((note) => note.id)));
    } else {
      setSelectedNotes(new Set());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const allSelected =
    filteredNotes.length > 0 && selectedNotes.size === filteredNotes.length;
  const someSelected =
    selectedNotes.size > 0 && selectedNotes.size < filteredNotes.length;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Trash</h1>
            <p className="text-sm text-muted-foreground">
              {filteredNotes.length} of {deletedNotes.length} notes
              {selectedNotes.size > 0 && ` (${selectedNotes.size} selected)`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {deletedNotes.length > 0 && (
              <Button variant="destructive" onClick={handleEmptyTrash}>
                Empty Trash
              </Button>
            )}
          </div>
        </div>

        {deletedNotes.length > 0 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search deleted notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deleted">Date Deleted</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredNotes.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm cursor-pointer"
                  >
                    Select all
                  </label>
                </div>

                {selectedNotes.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkRestore}
                    >
                      Restore Selected ({selectedNotes.size})
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      Delete Selected ({selectedNotes.size})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {deletedNotes.length === 0
              ? "Trash is empty."
              : searchQuery
              ? "No deleted notes match your search."
              : "No notes to display."}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="opacity-75 relative">
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedNotes.has(note.id)}
                  onCheckedChange={(checked) =>
                    handleSelectNote(note.id, checked as boolean)
                  }
                />
              </div>

              <CardHeader className="pb-2 pl-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{note.title}</h3>
                    {note.description && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {note.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(note.id)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                      title="Restore note"
                    >
                      ↺
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePermanentDelete(note.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete permanently"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {note.content && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {truncateContent(note.content)}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{note.category}</span>
                  <span>Deleted: {formatDate(note.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
