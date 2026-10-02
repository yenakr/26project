import React from 'react';

interface HighlightedMessageProps {
  text: string;
  className?: string;
}

export function HighlightedMessage({ text, className = '' }: HighlightedMessageProps) {
  if (!text) return null;

  // Regex matches KakaoTalk mentions starting with @, e.g. @유지훈 Hun, @김도현, @chulsoo_run
  const mentionRegex = /(@[\w\u3131-\uD79D]+(?:\s+[A-Za-z0-9_]+)?)/g;
  const parts = text.split(mentionRegex);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <span
              key={index}
              className="text-blue-600 font-bold bg-blue-50/90 px-1.5 py-0.5 rounded-md border border-blue-100 inline-block whitespace-nowrap mx-0.5 my-0.5 text-[11px] sm:text-xs shadow-2xs"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
