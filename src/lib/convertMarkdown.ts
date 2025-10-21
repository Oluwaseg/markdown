import { marked } from 'marked';

// Configure marked with proper renderer that handles all element types correctly
const renderer = new marked.Renderer();

// Handle paragraphs
renderer.paragraph = (token: any) => {
  return `<p>${token.text}</p>\n`;
};

// Handle headings
renderer.heading = (token: any) => {
  const level = token.depth;
  return `<h${level}>${token.text}</h${level}>\n`;
};

// Handle code blocks with proper syntax highlighting support
renderer.code = (token: any) => {
  const lang = token.lang || 'text';
  const code = token.text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return `<pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>\n`;
};

// Handle inline code
renderer.codespan = (token: any) => {
  const code = token.text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<code class="inline-code">${code}</code>`;
};

// Handle unordered lists
renderer.list = (token: any) => {
  const tag = token.ordered ? 'ol' : 'ul';
  const start =
    token.ordered && token.start !== 1 ? ` start="${token.start}"` : '';
  return `<${tag}${start}>\n${token.items
    .map((item: any) => renderer.listitem(item))
    .join('')}</${tag}>\n`;
};

// Handle list items
renderer.listitem = (token: any) => {
  const checkbox = token.task
    ? `<input type="checkbox" ${token.checked ? 'checked' : ''} disabled> `
    : '';
  return `<li>${checkbox}${token.text}</li>\n`;
};

// Handle blockquotes
renderer.blockquote = (token: any) => {
  return `<blockquote>\n${token.text}</blockquote>\n`;
};

// Handle horizontal rules
renderer.hr = () => {
  return '<hr>\n';
};

// Handle tables
renderer.table = (token: any) => {
  let html = '<table>\n<thead>\n<tr>\n';

  // Header row
  token.header.forEach((cell: any) => {
    const align = cell.align ? ` style="text-align:${cell.align}"` : '';
    html += `<th${align}>${cell.text}</th>\n`;
  });

  html += '</tr>\n</thead>\n<tbody>\n';

  // Body rows
  token.rows.forEach((row: any) => {
    html += '<tr>\n';
    row.forEach((cell: any) => {
      const align = cell.align ? ` style="text-align:${cell.align}"` : '';
      html += `<td${align}>${cell.text}</td>\n`;
    });
    html += '</tr>\n';
  });

  html += '</tbody>\n</table>\n';
  return html;
};

// Handle images
renderer.image = (token: any) => {
  return `<img src="${token.href}" alt="${token.text}" title="${
    token.title || ''
  }" />\n`;
};

// Handle links
renderer.link = (token: any) => {
  return `<a href="${token.href}" title="${token.title || ''}">${
    token.text
  }</a>`;
};

// Handle strong (bold)
renderer.strong = (token: any) => {
  return `<strong>${token.text}</strong>`;
};

// Handle emphasis (italic)
renderer.em = (token: any) => {
  return `<em>${token.text}</em>`;
};

// Handle line breaks
renderer.br = () => {
  return '<br>\n';
};

// Handle text
renderer.text = (token: any) => {
  return token.text;
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
      htmlCursorPosition = calculateHtmlCursorPosition(
        markdownText,
        html,
        cursorPosition
      );
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
  const linkMatches = text.match(/\[([^\]]*)\]$$([^)]*)$$/g);
  if (linkMatches) {
    linkMatches.forEach((link) => {
      const match = link.match(/\[([^\]]*)\]$$([^)]*)$$/);
      if (match && (!match[2] || match[2].trim() === '')) {
        warnings.push(`Malformed link detected: ${link}`);
      }
    });
  }

  // Check for malformed images
  const imageMatches = text.match(/!\[([^\]]*)\]$$([^)]*)$$/g);
  if (imageMatches) {
    imageMatches.forEach((image) => {
      const match = image.match(/!\[([^\]]*)\]$$([^)]*)$$/);
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
  const safeColumn = Math.min(
    cursorPosition.column,
    lines[safeLine]?.length || 0
  );

  // Calculate character position in markdown
  for (let i = 0; i < safeLine; i++) {
    if (lines[i]) {
      markdownPosition += lines[i].length + 1; // +1 for newline
    }
  }
  markdownPosition += safeColumn;

  // Simple approximation: map markdown position to HTML position
  // This could be improved with a more sophisticated mapping algorithm
  const ratio =
    markdownText.length > 0 ? markdownPosition / markdownText.length : 0;
  return Math.floor(html.length * ratio);
}

export function exportToHtml(html: string, title = 'Markdown Document'): void {
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

export function exportToPdf(html: string, title = 'Markdown Document'): void {
  // Dynamic import for html2pdf.js
  import('html2pdf.js').then((html2pdf) => {
    const element = document.createElement('div');
    element.innerHTML = html;

    const opt = {
      margin: 1,
      filename: `${title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    } as const;

    html2pdf.default().set(opt).from(element).save();
  });
}
