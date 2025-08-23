import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Copy, Twitter, Facebook, MessageCircle } from "lucide-react";
import { notesStorage, type Note } from "@/lib/localStorage";
import { useState } from "react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  setNote?: (note: Note) => void;
}

export default function ShareDialog({
  open,
  onOpenChange,
  note,
  setNote,
}: ShareDialogProps) {
  if (!note) return null;
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/note/${note.id}`;

  // Make note public if not already
  const ensurePublic = () => {
    if (!note.isPublic) {
      const updatedNote = { ...note, isPublic: true };
      notesStorage.saveNote(updatedNote);
      setNote && setNote(updatedNote);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    const event = new CustomEvent("show-toast", {
      detail: { message: "Link copied to clipboard!", type: "success" },
    });
    window.dispatchEvent(event);
  };

  const handleShareToTwitter = () => {
    ensurePublic();
    const shareText = `${note.title}\n\n${
      note.description ? `${note.description}\n\n` : ""
    }${note.content.substring(0, 100)}...`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleShareToFacebook = () => {
    ensurePublic();
    const shareText = `${note.title}\n\n${
      note.description ? `${note.description}\n\n` : ""
    }${note.content.substring(0, 200)}...`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleShareToWhatsApp = () => {
    ensurePublic();
    const shareText = `${note.title}\n\n${
      note.description ? `${note.description}\n\n` : ""
    }${note.content.substring(0, 200)}...`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      shareText + "\n\n" + shareUrl
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-stone-900 border-stone-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Share link</DialogTitle>
          <p className="text-stone-400 text-sm">
            Anyone who has this link will be able to view this.
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {/* Link Input with Copy Button */}
          <div className="flex items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-stone-800 border-stone-700 text-white flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-10 w-10 p-0 bg-stone-900 border-stone-700 hover:bg-stone-800 text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {/* Social Media Sharing Icons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareToTwitter}
              className="h-12 w-12 p-0 bg-black hover:bg-gray-800 rounded-full"
            >
              <Twitter className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareToFacebook}
              className="h-12 w-12 p-0 bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              <Facebook className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareToWhatsApp}
              className="h-12 w-12 p-0 bg-green-500 hover:bg-green-600 rounded-full"
            >
              <MessageCircle className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
