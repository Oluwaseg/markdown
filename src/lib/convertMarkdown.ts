import { marked } from 'marked';

// Configure marked with custom renderer for syntax highlighting
const renderer = new marked.Renderer();

// Custom code block renderer with basic syntax highlighting
renderer.code = (code: any, language?: string) => {
  const lang = language || 'text';
  
  // Handle different types that might be passed
  const codeString = typeof code === 'string' ? code : String(code || '');
  
  const escapedCode = codeString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  return `<pre class="language-${lang}"><code class="language-${lang}">${escapedCode}</code></pre>`;
};

// Custom inline code renderer
renderer.codespan = (code: any) => {
  const codeString = typeof code === 'string' ? code : String(code || '');
  return `<code class="inline-code">${codeString}</code>`;
};

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
});

export interface MarkdownResult {
  html: string;
  cursorPosition?: number;
  warnings: string[];
}

export interface CursorPosition {
  line: number;
  column: number;
}

export function convertMarkdown(
  markdownText: string,
  cursorPosition?: CursorPosition
): MarkdownResult {
  const warnings: string[] = [];
  
  try {
    // Check for syntax warnings
    checkMarkdownSyntax(markdownText, warnings);
    
    // Convert markdown to HTML
    const html = String(marked.parse(markdownText));
    
    // Calculate cursor position in HTML if provided
    let htmlCursorPosition: number | undefined;
    if (cursorPosition && markdownText.length > 0) {
      htmlCursorPosition = calculateHtmlCursorPosition(markdownText, html, cursorPosition);
    }
    
    return {
      html,
      cursorPosition: htmlCursorPosition,
      warnings,
    };
  } catch (error) {
    console.error('Error converting markdown:', error);
    return {
      html: '<p>Error converting markdown to HTML</p>',
      cursorPosition: undefined,
      warnings: ['Error occurred while parsing markdown'],
    };
  }
}

function checkMarkdownSyntax(text: string, warnings: string[]): void {
  // Check for unmatched bold markers
  const boldMatches = text.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    warnings.push('Unmatched bold markers (**) detected');
  }
  
  // Check for unmatched italic markers
  const italicMatches = text.match(/\*(?!\*)/g);
  if (italicMatches && italicMatches.length % 2 !== 0) {
    warnings.push('Unmatched italic markers (*) detected');
  }
  
  // Check for unmatched strikethrough markers
  const strikeMatches = text.match(/~~/g);
  if (strikeMatches && strikeMatches.length % 2 !== 0) {
    warnings.push('Unmatched strikethrough markers (~~) detected');
  }
  
  // Check for unmatched code block markers
  const codeBlockMatches = text.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    warnings.push('Unmatched code block markers (```) detected');
  }
  
  // Check for malformed links
  const linkMatches = text.match(/\[([^\]]*)\]\(([^)]*)\)/g);
  if (linkMatches) {
    linkMatches.forEach(link => {
      const match = link.match(/\[([^\]]*)\]\(([^)]*)\)/);
      if (match && (!match[2] || match[2].trim() === '')) {
        warnings.push(`Malformed link detected: ${link}`);
      }
    });
  }
  
  // Check for malformed images
  const imageMatches = text.match(/!\[([^\]]*)\]\(([^)]*)\)/g);
  if (imageMatches) {
    imageMatches.forEach(image => {
      const match = image.match(/!\[([^\]]*)\]\(([^)]*)\)/);
      if (match && (!match[2] || match[2].trim() === '')) {
        warnings.push(`Malformed image detected: ${image}`);
      }
    });
  }
}

function calculateHtmlCursorPosition(
  markdownText: string,
  html: string,
  cursorPosition: CursorPosition
): number {
  // This is a simplified approach - in a real implementation,
  // you'd want more sophisticated cursor tracking
  const lines = markdownText.split('\n');
  let markdownPosition = 0;
  
  // Ensure cursor position is within bounds
  const safeLine = Math.min(cursorPosition.line, lines.length - 1);
  const safeColumn = Math.min(cursorPosition.column, lines[safeLine]?.length || 0);
  
  // Calculate character position in markdown
  for (let i = 0; i < safeLine; i++) {
    if (lines[i]) {
      markdownPosition += lines[i].length + 1; // +1 for newline
    }
  }
  markdownPosition += safeColumn;
  
  // Simple approximation: map markdown position to HTML position
  // This could be improved with a more sophisticated mapping algorithm
  const ratio = markdownText.length > 0 ? markdownPosition / markdownText.length : 0;
  return Math.floor(html.length * ratio);
}

export function exportToHtml(html: string, title: string = 'Markdown Document'): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 2em;
            margin-bottom: 1em;
            font-weight: 600;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.25em; }
        p { margin-bottom: 1em; }
        pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 0.9em;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin: 0;
            padding-left: 1em;
            color: #666;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
        ul, ol {
            margin-bottom: 1em;
        }
        li {
            margin-bottom: 0.5em;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
  
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPdf(html: string, title: string = 'Markdown Document'): void {
  // Dynamic import for html2pdf.js
  import('html2pdf.js').then((html2pdf) => {
    const element = document.createElement('div');
    element.innerHTML = html;
    
    const opt = {
      margin: 1,
      filename: `${title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf.default().set(opt).from(element).save();
  });
}
