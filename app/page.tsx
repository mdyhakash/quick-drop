"use client";

import { useEffect, useState } from "react";
import NotesList from "@/components/NotesList";
import NewNote from "@/components/NewNote";
import TrashBin from "@/components/TrashBin";
import BottomNav from "@/components/BottomNav";
import Loading from "./loading";
import WelcomeModal from "@/components/WelcomeModal";

type Route = "home" | "new" | "trash";

export default function Home() {
  const [currentRoute, setCurrentRoute] = useState<Route>("home");
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Skip loader after first session display
    try {
      const shown = sessionStorage.getItem("initialLoadingShown");
      if (shown) {
        setIsLoading(false);
      }
    } catch {}

    // Show welcome only once (persists across sessions)
    try {
      const dismissed = localStorage.getItem("welcomeDismissed");
      if (!dismissed) setShowWelcome(true);
    } catch {}
    return () => {};
  }, []);

  const handleDismissWelcome = () => {
    try {
      localStorage.setItem("welcomeDismissed", "1");
    } catch {}
    setShowWelcome(false);
  };

  const navigate = (route: Route) => {
    setCurrentRoute(route);

    // Use direct navigation for better performance
    if (route === "new") {
      window.location.href = "/new";
    } else if (route === "trash") {
      window.location.href = "/trash";
    }
    // For home route, just update state
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case "new":
        return (
          <NewNote
            onSave={() => navigate("home")}
            onCancel={() => navigate("home")}
          />
        );
      case "trash":
        return <TrashBin onBack={() => navigate("home")} />;
      case "home":
      default:
        return <NotesList onNoteSelect={() => {}} onNoteEdit={() => {}} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <Loading
          onComplete={() => {
            try {
              sessionStorage.setItem("initialLoadingShown", "1");
            } catch {}
            setIsLoading(false);
          }}
        />
      ) : (
        <>
          {renderCurrentView()}
          {showWelcome && <WelcomeModal onClose={handleDismissWelcome} />}
        </>
      )}
    </div>
  );
}
