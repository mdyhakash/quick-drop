"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  useEffect(() => {
    // Since we're using modals now, redirect shared links to home
    // The modal system will handle viewing/editing notes
    router.replace("/");
  }, [noteId, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
