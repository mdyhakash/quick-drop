"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { JSX } from "react/jsx-runtime";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  // Enhanced markdown parser with better formatting support
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: JSX.Element[] = [];
    let currentCodeBlock = "";
    let currentCodeLanguage = "";
    let inCodeBlock = false;
    let codeBlockIndex = 0;
    let currentList: JSX.Element[] = [];
    let inList = false;
    let listType: "ul" | "ol" = "ul";

    const flushList = () => {
      if (currentList.length > 0) {
        const ListComponent = listType === "ul" ? "ul" : "ol";
        elements.push(
          <ListComponent
            key={`list-${elements.length}`}
            className={`${
              listType === "ul" ? "list-disc" : "list-decimal"
            } list-inside mb-4 space-y-1`}
          >
            {currentList}
          </ListComponent>
        );
        currentList = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks with language support
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <div key={`code-${codeBlockIndex}`} className="relative group mb-4">
              <div className="bg-stone-900 rounded-lg overflow-hidden border border-stone-800">
                {currentCodeLanguage && (
                  <div className="px-4 py-2 bg-stone-800 text-xs font-medium text-stone-300 border-b border-stone-700 flex items-center justify-between">
                    <span>{currentCodeLanguage}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs bg-stone-700 hover:bg-stone-600 border-stone-600 text-stone-300"
                      onClick={() =>
                        handleCopyCodeBlock(currentCodeBlock, codeBlockIndex)
                      }
                    >
                      {copiedBlocks.has(codeBlockIndex) ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                )}
                <pre className="p-4 overflow-x-auto bg-stone-900">
                  <code
                    className="text-sm font-mono text-stone-200"
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(
                        currentCodeBlock.trim(),
                        currentCodeLanguage
                      ),
                    }}
                  />
                </pre>
              </div>
            </div>
          );
          currentCodeBlock = "";
          currentCodeLanguage = "";
          inCodeBlock = false;
          codeBlockIndex++;
        } else {
          // Start code block
          flushList();
          inCodeBlock = true;
          currentCodeLanguage = line.substring(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        currentCodeBlock += line + "\n";
        continue;
      }

      // Headers with better styling
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1
            key={i}
            className="text-3xl font-bold mb-4 mt-8 first:mt-0 pb-2 border-b"
          >
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={i} className="text-2xl font-semibold mb-3 mt-6 first:mt-0">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={i} className="text-xl font-semibold mb-2 mt-5 first:mt-0">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith("#### ")) {
        flushList();
        elements.push(
          <h4 key={i} className="text-lg font-semibold mb-2 mt-4 first:mt-0">
            {line.substring(5)}
          </h4>
        );
      }
      // Enhanced list handling
      else if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!inList || listType !== "ul") {
          flushList();
          inList = true;
          listType = "ul";
        }
        currentList.push(
          <li key={`li-${i}`}>{parseInlineMarkdown(line.substring(2))}</li>
        );
      } else if (line.match(/^\d+\. /)) {
        const match = line.match(/^\d+\. (.*)/);
        if (match) {
          if (!inList || listType !== "ol") {
            flushList();
            inList = true;
            listType = "ol";
          }
          currentList.push(
            <li key={`li-${i}`}>{parseInlineMarkdown(match[1])}</li>
          );
        }
      }
      // Blockquotes
      else if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote
            key={i}
            className="border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground mb-4"
          >
            {parseInlineMarkdown(line.substring(2))}
          </blockquote>
        );
      }
      // Horizontal rule
      else if (line.trim() === "---" || line.trim() === "***") {
        flushList();
        elements.push(
          <hr key={i} className="my-6 border-muted-foreground/20" />
        );
      }
      // Empty line
      else if (line.trim() === "") {
        if (inList) {
          flushList();
        } else {
          elements.push(<div key={i} className="h-2" />);
        }
      }
      // Regular paragraph
      else {
        flushList();
        elements.push(
          <p key={i} className="mb-4 leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    }

    // Flush any remaining list
    flushList();

    return elements;
  };

  // Enhanced inline markdown parsing
  const parseInlineMarkdown = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let keyIndex = 0;

    // Process inline code first
    remaining = remaining.replace(/`([^`]+)`/g, (match, code) => {
      const placeholder = `__INLINE_CODE_${keyIndex}__`;
      parts.push(
        <code
          key={`inline-code-${keyIndex}`}
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {code}
        </code>
      );
      keyIndex++;
      return placeholder;
    });

    // Process links
    remaining = remaining.replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      (match, text, url) => {
        const placeholder = `__LINK_${keyIndex}__`;
        parts.push(
          <a
            key={`link-${keyIndex}`}
            href={url}
            className="text-primary underline hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        );
        keyIndex++;
        return placeholder;
      }
    );

    // Process bold and italic
    remaining = remaining.replace(/\*\*\*(.*?)\*\*\*/g, (match, text) => {
      const placeholder = `__BOLD_ITALIC_${keyIndex}__`;
      parts.push(
        <strong key={`bold-italic-${keyIndex}`} className="font-bold italic">
          {text}
        </strong>
      );
      keyIndex++;
      return placeholder;
    });

    remaining = remaining.replace(/\*\*(.*?)\*\*/g, (match, text) => {
      const placeholder = `__BOLD_${keyIndex}__`;
      parts.push(
        <strong key={`bold-${keyIndex}`} className="font-semibold">
          {text}
        </strong>
      );
      keyIndex++;
      return placeholder;
    });

    remaining = remaining.replace(/\*(.*?)\*/g, (match, text) => {
      const placeholder = `__ITALIC_${keyIndex}__`;
      parts.push(
        <em key={`italic-${keyIndex}`} className="italic">
          {text}
        </em>
      );
      keyIndex++;
      return placeholder;
    });

    // Process strikethrough
    remaining = remaining.replace(/~~(.*?)~~/g, (match, text) => {
      const placeholder = `__STRIKE_${keyIndex}__`;
      parts.push(
        <del key={`strike-${keyIndex}`} className="line-through">
          {text}
        </del>
      );
      keyIndex++;
      return placeholder;
    });

    // Split by placeholders and reconstruct
    const finalParts: (string | JSX.Element)[] = [];
    const placeholderRegex =
      /__(?:INLINE_CODE|LINK|BOLD_ITALIC|BOLD|ITALIC|STRIKE)_\d+__/g;
    let lastIndex = 0;
    let match;

    while ((match = placeholderRegex.exec(remaining)) !== null) {
      // Add text before placeholder
      if (match.index > lastIndex) {
        finalParts.push(remaining.substring(lastIndex, match.index));
      }

      // Find and add the corresponding element
      const placeholderIndex = Number.parseInt(
        match[0].match(/\d+/)?.[0] || "0"
      );
      const element = parts.find((part, index) => index === placeholderIndex);
      if (element) {
        finalParts.push(element);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      finalParts.push(remaining.substring(lastIndex));
    }

    return finalParts.length > 0 ? finalParts : [text];
  };

  const getLanguageClass = (language: string) => {
    const langMap: Record<string, string> = {
      javascript: "language-javascript",
      js: "language-javascript",
      typescript: "language-typescript",
      ts: "language-typescript",
      python: "language-python",
      py: "language-python",
      html: "language-html",
      css: "language-css",
      json: "language-json",
      bash: "language-bash",
      shell: "language-bash",
      sql: "language-sql",
    };
    return langMap[language.toLowerCase()] || "";
  };

  const highlightCode = (code: string, language: string) => {
    if (language === "json") {
      return highlightJSON(code);
    } else if (["javascript", "js", "typescript", "ts"].includes(language)) {
      return highlightJavaScript(code);
    } else if (["python", "py"].includes(language)) {
      return highlightPython(code);
    } else if (language === "css") {
      return highlightCSS(code);
    } else if (language === "html") {
      return highlightHTML(code);
    }
    return code;
  };

  const highlightJSON = (code: string) => {
    return code
      .replace(/"([^"]+)":/g, '<span style="color: #9CDCFE">"$1"</span>:') // Keys - light blue
      .replace(/:\s*"([^"]+)"/g, ': <span style="color: #CE9178">"$1"</span>') // String values - orange
      .replace(/:\s*(\d+)/g, ': <span style="color: #B5CEA8">$1</span>') // Numbers - light green
      .replace(
        /:\s*(true|false|null)/g,
        ': <span style="color: #569CD6">$1</span>'
      ) // Booleans/null - blue
      .replace(/([{}[\],])/g, '<span style="color: #D4D4D4">$1</span>'); // Brackets/punctuation - light gray
  };

  const highlightJavaScript = (code: string) => {
    return code
      .replace(
        /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default)\b/g,
        '<span style="color: #569CD6">$1</span>'
      ) // Keywords - blue
      .replace(
        /\b(true|false|null|undefined)\b/g,
        '<span style="color: #569CD6">$1</span>'
      ) // Literals - blue
      .replace(/"([^"]+)"/g, '<span style="color: #CE9178">"$1"</span>') // Strings - orange
      .replace(/'([^']+)'/g, "<span style=\"color: #CE9178\">'$1'</span>") // Strings - orange
      .replace(/`([^`]+)`/g, '<span style="color: #CE9178">`$1`</span>') // Template strings - orange
      .replace(/\b(\d+)\b/g, '<span style="color: #B5CEA8">$1</span>') // Numbers - light green
      .replace(/\/\/.*$/gm, '<span style="color: #6A9955">$&</span>') // Comments - green
      .replace(/\/\*[\s\S]*?\*\//g, '<span style="color: #6A9955">$&</span>'); // Block comments - green
  };

  const highlightPython = (code: string) => {
    return code
      .replace(
        /\b(def|class|if|elif|else|for|while|try|except|finally|with|import|from|as|return|yield|lambda|pass|break|continue)\b/g,
        '<span style="color: #569CD6">$1</span>'
      ) // Keywords - blue
      .replace(
        /\b(True|False|None)\b/g,
        '<span style="color: #569CD6">$1</span>'
      ) // Literals - blue
      .replace(/"([^"]+)"/g, '<span style="color: #CE9178">"$1"</span>') // Strings - orange
      .replace(/'([^']+)'/g, "<span style=\"color: #CE9178\">'$1'</span>") // Strings - orange
      .replace(/\b(\d+)\b/g, '<span style="color: #B5CEA8">$1</span>') // Numbers - light green
      .replace(/#.*$/gm, '<span style="color: #6A9955">$&</span>'); // Comments - green
  };

  const highlightCSS = (code: string) => {
    return code
      .replace(
        /([.#]?[a-zA-Z-]+)\s*{/g,
        '<span style="color: #D7BA7D">$1</span> {'
      ) // Selectors - yellow
      .replace(/([a-zA-Z-]+):/g, '<span style="color: #9CDCFE">$1</span>:') // Properties - light blue
      .replace(/:\s*([^;]+);/g, ': <span style="color: #CE9178">$1</span>;') // Values - orange
      .replace(/\/\*[\s\S]*?\*\//g, '<span style="color: #6A9955">$&</span>'); // Comments - green
  };

  const highlightHTML = (code: string) => {
    return code
      .replace(/(<\/?)([\w-]+)/g, '$1<span style="color: #569CD6">$2</span>') // Tags - blue
      .replace(/(\w+)=/g, '<span style="color: #9CDCFE">$1</span>=') // Attributes - light blue
      .replace(/="([^"]+)"/g, '="<span style="color: #CE9178">$1</span>"') // Attribute values - orange
      .replace(/<!--[\s\S]*?-->/g, '<span style="color: #6A9955">$&</span>'); // Comments - green
  };

  const handleCopyCodeBlock = async (code: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopiedBlocks((prev) => new Set(prev).add(blockIndex));
      setTimeout(() => {
        setCopiedBlocks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(blockIndex);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code block:", error);
    }
  };

  return (
    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-em:text-foreground">
      {parseMarkdown(content)}
    </div>
  );
}
