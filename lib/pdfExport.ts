// PDF export utility using jsPDF
export const exportNoteToPDF = async (note: {
  title: string;
  description?: string;
  content: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}) => {
  try {
    console.log("Starting PDF export for note:", note.title);

    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf");
    console.log("jsPDF library loaded successfully");

    const doc = new jsPDF();
    console.log("PDF document created");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with proper word wrapping and page management
    const addWrappedText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont(undefined, "bold");
      } else {
        doc.setFont(undefined, "normal");
      }

      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(text, maxWidth);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineHeight = fontSize * 0.4;

        // Check if we need a new page before adding this line
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        // Add the line
        doc.text(line, margin, yPosition);
        yPosition += lineHeight + 2; // Add small spacing between lines
      }
    };

    // Add title
    addWrappedText(note.title, 20, true);
    yPosition += 10;

    // Add description if exists
    if (note.description) {
      addWrappedText(note.description, 12);
      yPosition += 10;
    }

    // Add metadata
    const metadata = [`Category: ${note.category || "text"}`];

    if (note.createdAt) {
      metadata.push(
        `Created: ${new Date(note.createdAt).toLocaleDateString()}`
      );
    }
    if (note.updatedAt) {
      metadata.push(
        `Updated: ${new Date(note.updatedAt).toLocaleDateString()}`
      );
    }

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);

    metadata.forEach((line) => {
      if (yPosition + 12 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 12;
    });

    // Add separator
    yPosition += 10;
    if (yPosition + 15 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;

    // Add content with better handling
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    if (note.content) {
      console.log("Original content length:", note.content.length);

      // Convert markdown to plain text while preserving structure
      const plainContent = note.content
        // Preserve headers with clear formatting
        .replace(/^#{6}\s(.+)$/gm, "      $1")
        .replace(/^#{5}\s(.+)$/gm, "     $1")
        .replace(/^#{4}\s(.+)$/gm, "    $1")
        .replace(/^#{3}\s(.+)$/gm, "   $1")
        .replace(/^#{2}\s(.+)$/gm, "  $1")
        .replace(/^#{1}\s(.+)$/gm, " $1")
        // Preserve bold and italic formatting
        .replace(/\*\*\*(.*?)\*\*\*/g, "***$1***")
        .replace(/\*\*(.*?)\*\*/g, "**$1**")
        .replace(/\*(.*?)\*/g, "*$1*")
        // Preserve inline code
        .replace(/`(.*?)`/g, "[$1]")
        // Better code block handling
        .replace(/```[\w]*\n([\s\S]*?)```/g, (match, code) => {
          return (
            "\n--- CODE BLOCK ---\n" + code.trim() + "\n--- END CODE ---\n"
          );
        })
        // Convert links to readable format
        .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "$1 ($2)")
        // Better list handling
        .replace(/^[-*+]\s(.+)$/gm, "• $1")
        .replace(/^\d+\.\s(.+)$/gm, (match, text, offset, string) => {
          const lineNum =
            (string.substring(0, offset).match(/^\d+\./gm) || []).length + 1;
          return `${lineNum}. ${text}`;
        })
        // Convert blockquotes
        .replace(/^>\s(.+)$/gm, "» $1")
        // Clean up extra whitespace but preserve intentional line breaks
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      console.log("Processed content length:", plainContent.length);
      console.log("Content preview:", plainContent.substring(0, 200) + "...");

      // Process the entire content as one block to ensure nothing is lost
      addWrappedText(plainContent, 11);
    }

    // Save the PDF with proper filename
    const fileName = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    console.log("Saving PDF with filename:", fileName);
    console.log("Total pages in PDF:", doc.getNumberOfPages());

    // Use save() method to trigger download
    doc.save(fileName);

    console.log("PDF save operation completed");

    return true;
  } catch (error) {
    console.error("Failed to export PDF:", error);
    return false;
  }
};
