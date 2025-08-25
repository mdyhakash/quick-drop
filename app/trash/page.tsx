"use client";

import TrashBin from "@/components/TrashBin";

export default function TrashPage() {
  const handleBack = () => {
    window.history.back();
  };

  return <TrashBin onBack={handleBack} />;
}
