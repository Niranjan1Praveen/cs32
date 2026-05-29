// components/FAQAnswer.js
'use client';
import { renderAsLines, splitIntoLines, formatNewlines } from '@/lib/textFormatter';

export default function FAQAnswer({ content, className = '' }) {
  if (!content) return null;
  
  // Split into lines and render each line separately with spacing
  const lines = content.split('\n');
  
  return (
    <div className={`space-y-2 ${className}`}>
      {lines.map((line, index) => {
        // Skip empty lines but add spacing
        if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }
        return (
          <p key={index} className="text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}