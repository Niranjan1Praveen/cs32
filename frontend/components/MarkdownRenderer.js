// components/MarkdownRenderer.js
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;
  
  // Convert single newlines to double spaces + newline for proper Markdown line breaks
  // This makes each \n render as a line break
  const formattedContent = content.replace(/\n/g, '  \n');
  
  return (
    <div className={`text-[var(--color-text)] ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}