"use client";

import NewNote from "@/components/NewNote";

export default function NewNotePage() {
  const handleSave = () => {
    window.history.back();
  };

  const handleCancel = () => {
    window.history.back();
  };

  return <NewNote onSave={handleSave} onCancel={handleCancel} />;
}
