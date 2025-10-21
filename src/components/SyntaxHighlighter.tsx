'use client';

import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  className?: string;
}

export default function SyntaxHighlighter({ 
  code, 
  language, 
  className = '' 
}: SyntaxHighlighterProps) {
  const theme = themes.vsDark; // You can make this dynamic based on dark mode
  
  return (
    <Highlight
      theme={theme}
      code={code}
      language={language}
    >
      {({ className: highlightClassName, style, tokens, getLineProps, getTokenProps }) => (
        <pre 
          className={`${highlightClassName} ${className}`} 
          style={style}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="line-number">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}


