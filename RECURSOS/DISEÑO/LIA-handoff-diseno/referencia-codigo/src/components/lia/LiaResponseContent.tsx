import React from 'react';
import Markdown from 'react-markdown';

const allowedElements = [
  'p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'hr',
];

/** Formats LIA's reply without changing the stored text or accepting raw HTML. */
export function LiaResponseContent({ text, className = '' }: { text: string; className?: string }) {
  return <div className={`lia-response-content ${className}`}>
    <Markdown allowedElements={allowedElements} unwrapDisallowed skipHtml components={{
      a: ({ href, children }) => href
        ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
        : <span>{children}</span>,
    }}>{text}</Markdown>
  </div>;
}
