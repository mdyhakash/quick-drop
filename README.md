# 📓 Copy-Paste Notebook

A modern, mobile-first note-taking application built with Next.js 15, featuring beautiful typography, syntax highlighting, and seamless PDF export capabilities.

![Notebook App](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-black?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 **Core Functionality**

- **Smart Note Creation** - Auto-generate titles from content
- **Multiple Formats** - Support for Text (Markdown), Code, and JSON
- **Real-time Preview** - See your content as you type
- **Auto-save Drafts** - Never lose your work with automatic saving

### 🎨 **Beautiful Design**

- **Modern UI/UX** - Clean, intuitive interface
- **Professional Typography** - Inter font for text, JetBrains Mono for code
- **Dark Theme** - Easy on the eyes with elegant dark mode
- **Responsive Design** - Optimized for mobile and desktop
- **Smooth Animations** - Polished user experience

### 💻 **Advanced Content Support**

- **Markdown Rendering** - Full Markdown support with beautiful formatting
- **Syntax Highlighting** - VS Code-like highlighting for 25+ programming languages
- **JSON Validation** - Auto-format and validate JSON with colorful syntax
- **Code Blocks** - Professional code display with copy functionality

### 📱 **Smart Features**

- **Tag System** - Organize notes with custom tags
- **Categories** - Group notes by type or project
- **Search & Filter** - Find notes quickly with powerful search
- **Pin Important Notes** - Keep important content at the top
- **Public Sharing** - Share notes publicly with generated links

### 📄 **Export & Sharing**

- **PDF Export** - Professional PDF generation with proper formatting
- **Content Copying** - Easy copying of notes and code blocks
- **Share Integration** - Native sharing on mobile devices
- **Clipboard Support** - Copy links and content seamlessly

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Modern web browser

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mdyhakash/quick-drop.git
   cd notebook-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

### **Frontend Framework**

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development

### **Styling & UI**

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Custom CSS Variables** - Dynamic theming system

### **State Management**

- **React Hooks** - Built-in state management
- **Local Storage** - Persistent data storage
- **Custom Hooks** - Reusable logic

### **Content Processing**

- **Custom Markdown Parser** - Fast, lightweight rendering
- **Syntax Highlighting** - Professional code display
- **PDF Generation** - jsPDF integration

## 📱 Usage Guide

### **Creating Notes**

1. **Choose Format**

   - **Text**: Full Markdown support
   - **Code**: Syntax-highlighted programming
   - **JSON**: Auto-formatted with validation

2. **Write Content**

   - Type or paste your content
   - Use Markdown syntax for text notes
   - Add tags and categories for organization

3. **Auto-save**
   - Content saves automatically every 2 seconds
   - Drafts are preserved between sessions

### **Organizing Notes**

- **Tags**: Add `#tag` to categorize notes
- **Categories**: Group notes by project or type
- **Pin Important**: Keep frequently used notes at the top
- **Search**: Find notes quickly with the search bar

### **Sharing & Export**

- **PDF Export**: Click the PDF button for professional export
- **Public Sharing**: Make notes public and share links
- **Copy Content**: Use copy buttons for easy sharing
- **Mobile Share**: Native sharing on mobile devices

## 🎨 Customization

### **Themes**

The app uses CSS custom properties for easy theming:

```css
:root {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  --color-primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}
```

### **Typography**

- **Primary Font**: Inter (Google Fonts)
- **Code Font**: JetBrains Mono
- **Fallbacks**: System fonts for optimal performance

### **Styling**

- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Elegant dark mode by default
- **Smooth Transitions**: Polished animations throughout

## 📁 Project Structure

```
notebook-app/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles & Tailwind config
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── NoteEditor.tsx    # Note editing interface
│   ├── NoteView.tsx      # Note viewing component
│   ├── MarkdownRenderer.tsx # Markdown & code rendering
│   └── ...               # Other components
├── lib/                  # Utility functions
│   ├── localStorage.ts   # Data persistence
│   ├── pdfExport.ts      # PDF generation
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## 🔧 Configuration


### **Tailwind CSS**

The app uses Tailwind CSS v4 with custom configuration:

```css
@import "tailwindcss";

@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  /* ... custom color palette */
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Style**

- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

<!-- - **Issues**: [GitHub Issues](https://github.com/mdyhakash/notebook-app/issues) -->
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/notebook-app/discussions)
- **Email**: mdyhakash@gmail.com

