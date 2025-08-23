"use client";

interface ContentWithLineNumbersProps {
  content: string;
}

export default function ContentWithLineNumbers({
  content,
}: ContentWithLineNumbersProps) {
  const lines = content ? content.split("\n") : [""];

  return (
    <div className="flex border border-stone-800 rounded-lg overflow-hidden bg-stone-900/50">
      {/* Line Numbers */}
      <div className="select-none text-right pr-3 text-xs text-stone-500 font-mono border-r border-stone-700 bg-stone-800/50 min-w-[3rem]">
        {lines.map((_, index) => (
          <div key={index} className="leading-6 px-2 py-1">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <pre className="text-sm font-mono leading-6 whitespace-pre-wrap text-stone-200">
          {content || "No content available."}
        </pre>
      </div>
    </div>
  );
}
