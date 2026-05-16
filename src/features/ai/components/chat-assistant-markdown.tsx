"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 text-sm last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 text-sm last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-foreground/90">{children}</em>
  ),
  h1: ({ children }) => (
    <h3 className="mt-3 mb-2 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-3 mb-2 text-base font-semibold first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-2 mb-1.5 text-sm font-semibold first:mt-0">{children}</h4>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground my-2">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border/60" />,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-primary underline underline-offset-2 hover:opacity-90 break-all"
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes("language-"));
    if (!isBlock) {
      return (
        <code
          className="rounded bg-background/80 px-1 py-px text-xs font-mono text-foreground ring-1 ring-border/60"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className={cn("block font-mono text-xs leading-relaxed", className)}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-2 max-h-64 overflow-x-auto overflow-y-auto rounded-lg border border-border/60 bg-background/50 p-3 last:mb-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-2 max-w-full overflow-x-auto rounded-lg border border-border/60 last:mb-0">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border bg-muted/50 font-medium">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-border/80">{children}</tbody>,
  tr: ({ children }) => <tr className="border-border/40">{children}</tr>,
  th: ({ children }) => (
    <th className="px-2 py-2 text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-2 text-muted-foreground">{children}</td>
  ),
};

type ChatAssistantMarkdownProps = {
  className?: string;
  children: string;
};

export const ChatAssistantMarkdown = ({
  className,
  children,
}: ChatAssistantMarkdownProps) => {
  if (!children.trim()) {
    return null;
  }

  return (
    <div className={cn("prose-chat min-w-0 text-foreground", className)}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
