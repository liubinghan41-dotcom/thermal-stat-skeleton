import katex from "katex";

const tokenPattern = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\[\[[^\]]+\]\])/g;

interface MathTextProps {
  text: string;
  onTermClick?: (id: string) => void;
}

export function MathText({ text, onTermClick }: MathTextProps) {
  const parts = text.split(tokenPattern).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const raw = part.slice(2, -2);
          const [id, label = id] = raw.split("|");
          return (
            <button
              className="term-link"
              key={`${part}-${index}`}
              type="button"
              onClick={() => onTermClick?.(id)}
            >
              {label}
            </button>
          );
        }

        if (part.startsWith("$$") && part.endsWith("$$")) {
          const html = katex.renderToString(part.slice(2, -2), {
            displayMode: true,
            throwOnError: false,
          });
          return <span className="math-display" dangerouslySetInnerHTML={{ __html: html }} key={`${part}-${index}`} />;
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          const html = katex.renderToString(part.slice(1, -1), {
            displayMode: false,
            throwOnError: false,
          });
          return <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} key={`${part}-${index}`} />;
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}
