# 📓 Quick Drop

A modern, mobile-first note-taking application built with Next.js, featuring a simplified editor, instant drafts, modal-based view/edit, and polished PDF export.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-black?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Core

- Simplified editor: title, category (defaults to "text"), content
- Write/Preview tabs only, with info for words/characters/lines
- Category support: code, text, json
- Search + filter: Recent (all, sorted by updated date), Code, Text, JSON
- Instant drafts: auto-save as you type; drafts list sorted by newest first
- One-click delete: deletes immediately and shows a success toast
- PDF export for any note
- Copy buttons in details and cards with toast feedback

### 🎨 Design & UX

- Mobile-first responsive UI
- Unified modal for view and edit (no double-click issues)
- Blurry modal backdrop for focus
- Consistent dark theme and global styling
- Initial loading splash + one-time welcome modal
- Toast notifications via react-toastify

### 🗃️ Storage

- Local-only persistence using `localStorage`
- Active notes exclude drafts and deleted items

## ❌ Removed or Changed

- Public sharing and all share-related logic and buttons
- Confirmation dialogs for delete (replaced with immediate delete + success toast)
- Auto-generate title from content (manual title; drafts default to "Draft")

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone

```bash
git clone https://github.com/mdyhakash/quick-drop.git
cd quick-drop
```

2. Install deps

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run dev

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS 4, shadcn/ui (Radix primitives), Lucide icons
- jsPDF for PDF export
- LocalStorage for persistence

## 📱 Usage Guide

### Create & Edit

- Click New Note to create
- Enter title (or keep default "Draft" while writing), choose category if needed, write content
- Switch between Write/Preview
- Changes auto-save to Drafts; saving/publishing moves from Drafts to main list

### Organize & Find

- Use the top filter to switch: Recent (all), Code, Text, JSON
- Search by title/content/tags; pinned notes appear first when applicable
- Drafts section shows newest-first

### Actions

- Copy content with copy buttons (toast confirms)
- Export to PDF
- Delete removes immediately (toast confirms success)

## 📁 Project Structure

```
quick-drop/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── page.tsx
│   ├── new/page.tsx
│   └── trash/page.tsx
├── components/
│   ├── NotesList.tsx
│   ├── NoteCard.tsx
│   ├── NoteModal.tsx
│   ├── NewNote.tsx
│   ├── NoteEditor.tsx
│   ├── MarkdownRenderer.tsx
│   ├── BottomNav.tsx
│   ├── TrashBin.tsx
│   └── WelcomeModal.tsx
├── lib/
│   ├── localStorage.ts
│   └── pdfExport.ts
└── hooks/
    └── use-toast.ts
```

## 🎨 Theming & Responsiveness

- Tailwind CSS with CSS variables backed by a dark theme
- Mobile optimizations (touch sizes, dialog sizing, typography)
- Custom scrollbar styling kept consistent across interactions

## 📄 License

MIT

## 📞 Support

- Discussions: `https://github.com/yourusername/notebook-app/discussions`
- Email: mdyhakash@gmail.com
