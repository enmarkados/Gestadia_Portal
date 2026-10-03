import React from "react";
function Inline({ text }) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
}
export default function AssistantContent({ content }) {
  return (
    <div className="assistant-content">
      {content.split("\n").map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        if (/^#{1,3} /.test(line))
          return (
            <p className="message-heading" key={i}>
              <Inline text={line.replace(/^#{1,3} /, "")} />
            </p>
          );
        return (
          <p key={i}>
            <Inline text={line} />
          </p>
        );
      })}
    </div>
  );
}
