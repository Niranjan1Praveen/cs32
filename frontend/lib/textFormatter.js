// lib/textFormatter.js

/**
 * Converts newlines to HTML line breaks and creates paragraph spacing
 * This ensures each \n creates a visual line break
 */
export const formatNewlines = (text) => {
    if (!text) return '';
    
    // Split by double newlines first (paragraphs)
    const paragraphs = text.split(/\n\s*\n/);
    
    if (paragraphs.length > 1) {
      // Multiple paragraphs - wrap each in <p> tags
      return paragraphs
        .filter(p => p.trim())
        .map(para => {
          // Within paragraph, convert single newlines to <br />
          const withBreaks = para.replace(/\n/g, '<br />');
          return `<p class="mb-4">${withBreaks}</p>`;
        })
        .join('');
    }
    
    // Single paragraph - just convert \n to <br />
    return text.replace(/\n/g, '<br />');
  };
  
  /**
   * Converts newlines to double spaces + newline for Markdown
   * This ensures Markdown renders line breaks properly
   */
  export const formatForMarkdown = (text) => {
    if (!text) return '';
    
    // Replace single newlines with double space + newline for Markdown line breaks
    // Also handle double newlines as paragraph separators
    return text
      .split(/\n\s*\n/)
      .map(para => para.replace(/\n/g, '  \n'))
      .join('\n\n');
  };
  
  /**
   * Splits text by newlines into lines array
   */
  export const splitIntoLines = (text) => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim() !== '');
  };
  
  /**
   * Renders text as separate lines using divs (for React components)
   */
  export const renderAsLines = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    
    return lines.map((line, index) => (
      <div key={index} className="mb-2">
        {line || <br />}
      </div>
    ));
  };