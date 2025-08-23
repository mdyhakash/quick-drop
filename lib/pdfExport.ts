// PDF export utility using jsPDF
export const exportNoteToPDF = async (note: {
  title: string;
  description?: string;
  content: string;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}) => {
  try {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, "bold");
      } else {
        doc.setFont(undefined, "normal");
      }

      const lines = doc.splitTextToSize(text, maxWidth);

      // Check if we need a new page
      if (yPosition + lines.length * fontSize * 0.4 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.4 + 5;
    };

    // Add title
    addWrappedText(note.title, 20, true);
    yPosition += 5;

    // Add description if exists
    if (note.description) {
      addWrappedText(note.description, 12);
      yPosition += 5;
    }

    // Add metadata
    const metadata = [
      `Category: ${note.category}`,
      `Created: ${new Date(note.createdAt).toLocaleDateString()}`,
      `Updated: ${new Date(note.updatedAt).toLocaleDateString()}`,
    ];

    if (note.tags.length > 0) {
      metadata.push(`Tags: ${note.tags.join(", ")}`);
    }

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);

    metadata.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 12;
    });

    // Add separator
    yPosition += 10;
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Add content
    doc.setTextColor(0, 0, 0);
    if (note.content) {
      // Better markdown to plain text conversion for PDF that preserves more content
      const plainContent = note.content
        // Preserve headers with formatting
        .replace(/^#{6}\s(.+)$/gm, "      $1")
        .replace(/^#{5}\s(.+)$/gm, "     $1")
        .replace(/^#{4}\s(.+)$/gm, "    $1")
        .replace(/^#{3}\s(.+)$/gm, "   $1")
        .replace(/^#{2}\s(.+)$/gm, "  $1")
        .replace(/^#{1}\s(.+)$/gm, " $1")
        // Preserve bold and italic with different formatting
        .replace(/\*\*\*(.*?)\*\*\*/g, "***$1***") // Bold italic
        .replace(/\*\*(.*?)\*\*/g, "**$1**") // Bold
        .replace(/\*(.*?)\*/g, "*$1*") // Italic
        // Preserve inline code
        .replace(/`(.*?)`/g, "[$1]") // Inline code in brackets
        // Better code block handling - preserve the content
        .replace(/```[\w]*\n([\s\S]*?)```/g, (match, code) => {
          return (
            "\n--- CODE BLOCK ---\n" + code.trim() + "\n--- END CODE ---\n"
          );
        })
        // Convert links to readable format
        .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "$1 ($2)") // Convert links to "text (url)"
        // Better list handling
        .replace(/^[-*+]\s(.+)$/gm, "• $1") // Convert list items
        .replace(/^\d+\.\s(.+)$/gm, (match, text, offset, string) => {
          const lineNum =
            (string.substring(0, offset).match(/^\d+\./gm) || []).length + 1;
          return `${lineNum}. ${text}`;
        }) // Convert numbered lists with proper numbering
        // Convert blockquotes
        .replace(/^>\s(.+)$/gm, "» $1") // Convert blockquotes
        // Clean up extra whitespace but preserve intentional line breaks
        .replace(/\n{3,}/g, "\n\n") // Limit consecutive line breaks
        .trim();

      addWrappedText(plainContent, 11);
    }

    // Save the PDF
    const fileName = `${note.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error("Failed to export PDF:", error);
    return false;
  }
};
