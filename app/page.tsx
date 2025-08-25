"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeProvider } from "next-themes";
import BottomNav from "@/components/BottomNav";
import NotesList from "@/components/NotesList";
import NewNote from "@/components/NewNote";
import NoteView from "@/components/NoteView";
import NoteEdit from "@/components/NoteEdit";
import TrashBin from "@/components/TrashBin";
import WelcomeModal from "@/components/WelcomeModal";
import Loading from "./loading";

type Route = "notes" | "new" | "view" | "edit" | "trash";

interface ToastMessage {
  message: string;
  type: "success" | "error" | "info";
}

interface ConfirmationDialog {
  message: string;
  onConfirm: () => void;
}

export default function NotebookApp() {
  const [currentRoute, setCurrentRoute] = useState<Route>("notes");
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationDialog | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle client-side routing
  useEffect(() => {
    const path = window.location.pathname;
    const noteId = searchParams.get("id");

    if (path === "/new") {
      setCurrentRoute("new");
      setCurrentNoteId(null);
    } else if (path === "/trash") {
      setCurrentRoute("trash");
      setCurrentNoteId(null);
    } else if (path.startsWith("/note/") && noteId) {
      const isEdit = searchParams.get("edit") === "true";
      setCurrentRoute(isEdit ? "edit" : "view");
      setCurrentNoteId(noteId);
    } else {
      setCurrentRoute("notes");
      setCurrentNoteId(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      // Show welcome modal after loading completes
      setTimeout(() => {
        setShowWelcome(true);
      }, 500);
    }, 4000); // Show loading for 4 seconds to complete typing animation

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    const handleToast = (event: CustomEvent<ToastMessage>) => {
      setToast(event.detail);
      setTimeout(() => setToast(null), 4000); // Auto-hide after 4 seconds
    };

    const handleConfirmation = (event: CustomEvent<ConfirmationDialog>) => {
      setConfirmation(event.detail);
    };

    window.addEventListener("show-toast", handleToast as EventListener);
    window.addEventListener(
      "show-confirmation",
      handleConfirmation as EventListener
    );

    return () => {
      window.removeEventListener("show-toast", handleToast as EventListener);
      window.removeEventListener(
        "show-confirmation",
        handleConfirmation as EventListener
      );
    };
  }, []);

  const navigate = (route: Route, noteId?: string) => {
    // Prevent unnecessary re-renders if we're already on the same route
    if (currentRoute === route && currentNoteId === noteId) {
      return;
    }

    setCurrentRoute(route);
    setCurrentNoteId(noteId || null);

    // Update URL without page reload
    let url = "/";
    if (route === "new") url = "/new";
    else if (route === "trash") url = "/trash";
    else if (route === "view" && noteId) url = `/note/${noteId}`;
    else if (route === "edit" && noteId) url = `/note/${noteId}?edit=true`;

    // Only update URL if it's different from current
    if (window.location.pathname + window.location.search !== url) {
      window.history.pushState({}, "", url);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case "new":
        return (
          <NewNote
            onSave={() => navigate("notes")}
            onCancel={() => navigate("notes")}
          />
        );
      case "view":
        if (!currentNoteId) {
          return (
            <NotesList
              onNoteSelect={(id) => navigate("view", id)}
              onNoteEdit={(id) => navigate("edit", id)}
            />
          );
        }
        return (
          <NoteView
            noteId={currentNoteId}
            onEdit={() => navigate("edit", currentNoteId)}
            onBack={() => navigate("notes")}
          />
        );
      case "edit":
        if (!currentNoteId) {
          return (
            <NotesList
              onNoteSelect={(id) => navigate("view", id)}
              onNoteEdit={(id) => navigate("edit", id)}
            />
          );
        }
        return (
          <NoteEdit
            noteId={currentNoteId}
            onSave={() => navigate("view", currentNoteId)}
            onCancel={() => navigate("view", currentNoteId)}
          />
        );
      case "trash":
        return <TrashBin onBack={() => navigate("notes")} />;
      default:
        return (
          <NotesList
            onNoteSelect={(id) => navigate("view", id)}
            onNoteEdit={(id) => navigate("edit", id)}
          />
        );
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-background text-foreground">
        <main className="pb-20 md:pb-0">{renderCurrentView()}</main>

        <BottomNav currentRoute={currentRoute} onNavigate={navigate} />

        {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}

        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div
              className={`
              px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border max-w-sm
              ${
                toast.type === "success"
                  ? "bg-emerald-500/90 text-white border-emerald-400"
                  : ""
              }
              ${
                toast.type === "error"
                  ? "bg-red-500/90 text-white border-red-400"
                  : ""
              }
              ${
                toast.type === "info"
                  ? "bg-blue-500/90 text-white border-blue-400"
                  : ""
              }
            `}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {toast.type === "success" && "✅"}
                  {toast.type === "error" && "❌"}
                  {toast.type === "info" && "ℹ️"}
                </span>
                <p className="text-sm font-medium">{toast.message}</p>
                <button
                  onClick={() => setToast(null)}
                  className="ml-2 text-white/80 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
              <p className="text-muted-foreground mb-6">
                {confirmation.message}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmation(null)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmation.onConfirm();
                    setConfirmation(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
