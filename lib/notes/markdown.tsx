import { Fragment, type ReactNode } from "react";

export type WikilinkResolver = (title: string) =>
  | { href: string; exists: boolean }
  | null;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Minimal, dependency-free inline markdown renderer.
 * Supports: **bold**, *italic*, `code`, [text](url), and [[wikilinks]].
 */
function renderInline(
  text: string,
  resolveWikilink?: WikilinkResolver,
  keyPrefix = "i"
): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Tokenize on the supported inline patterns in one pass.
  const pattern =
    /(\[\[[^\]]+\]\])|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`${keyPrefix}-t-${i}`}>
          {text.slice(lastIndex, match.index)}
        </Fragment>
      );
    }
    const token = match[0];
    const key = `${keyPrefix}-${i}`;

    if (token.startsWith("[[")) {
      const inner = token.slice(2, -2);
      const [rawTitle, alias] = inner.split("|").map((s) => s.trim());
      const label = alias || rawTitle;
      const resolved = resolveWikilink?.(rawTitle) ?? null;
      if (resolved) {
        nodes.push(
          <a
            key={key}
            href={resolved.href}
            className={
              resolved.exists
                ? "text-emerald-600 underline decoration-emerald-400/50 underline-offset-2 hover:decoration-emerald-500"
                : "text-amber-600 underline decoration-dashed decoration-amber-400/60 underline-offset-2"
            }
          >
            {label}
          </a>
        );
      } else {
        nodes.push(
          <span key={key} className="text-emerald-600">
            {label}
          </span>
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={key}>{token.slice(1, -1)}</em>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
    i += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(
      <Fragment key={`${keyPrefix}-t-final`}>{text.slice(lastIndex)}</Fragment>
    );
  }

  return nodes;
}

export function renderMarkdown(
  source: string,
  resolveWikilink?: WikilinkResolver
): ReactNode {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let inCode = false;
  let codeBuffer: string[] = [];
  let key = 0;

  function flushList() {
    if (!listType || listBuffer.length === 0) {
      listBuffer = [];
      listType = null;
      return;
    }
    const items = listBuffer.map((item, idx) => (
      <li key={`li-${key}-${idx}`} className="ml-1">
        {renderInline(item, resolveWikilink, `li-${key}-${idx}`)}
      </li>
    ));
    blocks.push(
      listType === "ul" ? (
        <ul key={`ul-${key++}`} className="my-2 list-disc space-y-1 pl-5 text-sm">
          {items}
        </ul>
      ) : (
        <ol key={`ol-${key++}`} className="my-2 list-decimal space-y-1 pl-5 text-sm">
          {items}
        </ol>
      )
    );
    listBuffer = [];
    listType = null;
  }

  for (const line of lines) {
    const fence = line.trim().startsWith("```");
    if (fence) {
      if (inCode) {
        blocks.push(
          <pre
            key={`pre-${key++}`}
            className="my-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs"
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const text = heading[2];
      const sizes: Record<number, string> = {
        1: "mt-4 mb-2 text-xl font-semibold",
        2: "mt-3 mb-1.5 text-lg font-semibold",
        3: "mt-2 mb-1 text-base font-semibold",
        4: "mt-2 mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
      };
      blocks.push(
        <p key={`h-${key++}`} className={sizes[level]}>
          {renderInline(text, resolveWikilink, `h-${key}`)}
        </p>
      );
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (listType === "ol") flushList();
      listType = "ul";
      listBuffer.push(bullet[1]);
      continue;
    }

    const ordered = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ordered) {
      if (listType === "ul") flushList();
      listType = "ol";
      listBuffer.push(ordered[1]);
      continue;
    }

    const quote = /^>\s+(.*)$/.exec(line);
    if (quote) {
      flushList();
      blocks.push(
        <blockquote
          key={`q-${key++}`}
          className="my-2 border-l-2 border-emerald-500/50 pl-3 text-sm text-muted-foreground italic"
        >
          {renderInline(quote[1], resolveWikilink, `q-${key}`)}
        </blockquote>
      );
      continue;
    }

    if (line.trim() === "") {
      flushList();
      continue;
    }

    flushList();
    blocks.push(
      <p key={`p-${key++}`} className="my-1.5 text-sm leading-relaxed">
        {renderInline(line, resolveWikilink, `p-${key}`)}
      </p>
    );
  }

  flushList();
  if (inCode && codeBuffer.length) {
    blocks.push(
      <pre key={`pre-${key++}`} className="my-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
        <code>{codeBuffer.join("\n")}</code>
      </pre>
    );
  }

  return <div className="space-y-0.5">{blocks}</div>;
}

export { escapeRegExp };
