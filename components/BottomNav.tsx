"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Route = "notes" | "new" | "view" | "edit" | "trash"

interface BottomNavProps {
  currentRoute: Route
  onNavigate: (route: Route) => void
}

export default function BottomNav({ currentRoute, onNavigate }: BottomNavProps) {
  const navItems = [
    {
      id: "notes" as Route,
      label: "Notes",
      icon: "📋",
      active: currentRoute === "notes" || currentRoute === "view" || currentRoute === "edit",
    },
    {
      id: "new" as Route,
      label: "New",
      icon: "➕",
      active: currentRoute === "new",
    },
    {
      id: "trash" as Route,
      label: "Trash",
      icon: "🗑",
      active: currentRoute === "trash",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-4",
              item.active && "bg-accent text-accent-foreground",
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  )
}
