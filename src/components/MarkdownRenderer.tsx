import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  theme: 'dark' | 'light';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme }) => {
  const isDark = theme === 'dark';

  // Parse lines into tokens: code blocks vs text blocks
  const parts: { type: 'code' | 'text'; code?: string; lang?: string; text?: string }[] = [];
  const lines = content.split('\n');
  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let textBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        if (textBuffer.length > 0) {
          parts.push({ type: 'text', text: textBuffer.join('\n') });
          textBuffer = [];
        }
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
      } else {
        inCode = false;
        parts.push({
          type: 'code',
          code: codeBuffer.join('\n'),
          lang: codeLang || 'plaintext',
        });
        codeBuffer = [];
        codeLang = '';
      }
    } else if (inCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }

  if (inCode && codeBuffer.length > 0) {
    parts.push({ type: 'code', code: codeBuffer.join('\n'), lang: codeLang || 'plaintext' });
  } else if (textBuffer.length > 0) {
    parts.push({ type: 'text', text: textBuffer.join('\n') });
  }

  return (
    <div className="prose-javirus space-y-3 break-words leading-relaxed text-sm md:text-base">
      {parts.map((part, index) => {
        if (part.type === 'code' && part.code !== undefined) {
          return (
            <CodeBlock
              key={`code-${index}`}
              code={part.code}
              lang={part.lang || 'code'}
              isDark={isDark}
            />
          );
        }

        if (part.type === 'text' && part.text) {
          return (
            <TextBlock
              key={`text-${index}`}
              text={part.text}
              isDark={isDark}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; lang: string; isDark: boolean }> = ({
  code,
  lang,
  isDark,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`my-3 overflow-hidden rounded-xl border text-xs md:text-sm font-mono ${
        isDark
          ? 'border-white/10 bg-[#090b0e] text-slate-200'
          : 'border-slate-200 bg-slate-900 text-slate-100'
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-3.5 py-1.5 ${
          isDark
            ? 'border-white/10 bg-[#12161f] text-slate-400'
            : 'border-slate-800 bg-slate-950 text-slate-400'
        }`}
      >
        <span className="text-[11px] font-medium tracking-wide uppercase">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer py-0.5 px-2 rounded hover:bg-white/5"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const TextBlock: React.FC<{ text: string; isDark: boolean }> = ({ text, isDark }) => {
  // Split lines to handle headings, lists, quotes, tables, and paragraphs
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0 && listType) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`${keyPrefix}-ul`} className="list-disc pl-5 my-2 space-y-1">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInlineFormatting(item, isDark)}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`${keyPrefix}-ol`} className="list-decimal pl-5 my-2 space-y-1">
            {currentList.map((item, idx) => (
              <li key={idx}>{renderInlineFormatting(item, isDark)}</li>
            ))}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList(`flush-${i}`);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList(`h3-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold tracking-tight mt-3 mb-1 text-amber-200/90 dark:text-amber-300">
          {renderInlineFormatting(trimmed.slice(4), isDark)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList(`h2-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-semibold tracking-tight mt-4 mb-1.5 text-amber-100 dark:text-amber-200">
          {renderInlineFormatting(trimmed.slice(3), isDark)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList(`h1-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold tracking-tight mt-4 mb-2 gold-gradient-text">
          {renderInlineFormatting(trimmed.slice(2), isDark)}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList(`quote-${i}`);
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className={`border-l-2 pl-3 py-1 my-2 italic ${
            isDark ? 'border-amber-400/40 text-slate-300' : 'border-amber-600/40 text-slate-700'
          }`}
        >
          {renderInlineFormatting(trimmed.slice(2), isDark)}
        </blockquote>
      );
      continue;
    }

    // Unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList(`ul-switch-${i}`);
        listType = 'ul';
      }
      currentList.push(trimmed.slice(2));
      continue;
    }

    // Ordered lists
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList(`ol-switch-${i}`);
        listType = 'ol';
      }
      currentList.push(orderedMatch[2]);
      continue;
    }

    // Standard paragraph line
    flushList(`para-${i}`);
    elements.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed">
        {renderInlineFormatting(rawLine, isDark)}
      </p>
    );
  }

  flushList('final-flush');

  return <>{elements}</>;
};

function renderInlineFormatting(raw: string, isDark: boolean): React.ReactNode[] {
  // Match bold (**text**), inline code (`code`), italic (*text*), link [text](url)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = raw.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className={isDark ? 'text-amber-100 font-semibold' : 'text-slate-900 font-semibold'}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded text-[13px] font-mono ${
            isDark ? 'bg-white/10 text-amber-200' : 'bg-slate-200 text-slate-800'
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic opacity-90">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const label = part.slice(1, part.indexOf(']('));
      const url = part.slice(part.indexOf('](') + 2, -1);
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-400 hover:underline underline-offset-2"
        >
          {label}
        </a>
      );
    }
    return part;
  });
}
