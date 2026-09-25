'use client';

import React from 'react';
import { CheckSquare, Square, Code, Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Xử lý thay thế các ký hiệu toán học phổ biến sang Unicode chuẩn
  const parseMathSymbols = (text: string) => {
    return text
      .replace(/\\sum/g, '∑')
      .replace(/\\int/g, '∫')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\neq/g, '≠')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\pm/g, '±')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\infty/g, '∞')
      .replace(/\\approx/g, '≈')
      .replace(/\\in/g, '∈')
      .replace(/\\notin/g, '∉')
      .replace(/\\subset/g, '⊂')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\to/g, '→')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\^n/g, 'ⁿ');
  };

  // Phân tích từng đoạn văn bản inline (in đậm, in nghiêng, code, link, math inline)
  const renderInlineFormatted = (rawText: string) => {
    const text = parseMathSymbols(rawText);

    // Regex tìm inline code `code`, bold **text**, italic *text*, math $math$, link [text](url)
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$|\[[^\]]+\]\([^)]+\))/g);

    return tokens.map((token, idx) => {
      if (!token) return null;

      // Inline Code: `code`
      if (token.startsWith('`') && token.endsWith('`') && token.length > 1) {
        return (
          <code key={idx} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#182234] border border-white/10 text-blue-300 font-mono text-[12px]">
            {token.slice(1, -1)}
          </code>
        );
      }

      // Math Inline: $formula$
      if (token.startsWith('$') && token.endsWith('$') && token.length > 1) {
        return (
          <span key={idx} className="px-2 py-0.5 mx-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[12px] font-semibold italic">
            {token.slice(1, -1)}
          </span>
        );
      }

      // Bold: **text**
      if (token.startsWith('**') && token.endsWith('**') && token.length > 3) {
        return <strong key={idx} className="font-bold text-white tracking-wide">{token.slice(2, -2)}</strong>;
      }

      // Italic: *text*
      if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
        return <em key={idx} className="italic text-slate-200">{token.slice(1, -1)}</em>;
      }

      // Link: [text](url)
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-semibold transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
      }

      return <span key={idx}>{token}</span>;
    });
  };

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Xử lý Code Blocks: ```lang ... ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Đóng block
        elements.push(
          <div key={`codeblock-${i}`} className="my-4 rounded-2xl bg-[#090D16] border border-white/10 overflow-hidden shadow-2xl">
            <div className="px-4 py-2 border-b border-white/[0.08] bg-[#121826]/80 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
              <span className="uppercase text-blue-400 font-bold">{codeBlockLang || 'CODE'}</span>
              <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5" /> Terminal</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Dòng trống
    if (!trimmed) {
      elements.push(<div key={`space-${i}`} className="h-2" />);
      continue;
    }

    // Math Block: $$ ... $$
    if (trimmed.startsWith('') && trimmed.endsWith('') && trimmed.length > 3) {
      const mathFormula = parseMathSymbols(trimmed.slice(2, -2).trim());
      elements.push(
        <div key={`mathblock-${i}`} className="my-3 p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-center font-mono text-sm sm:text-base text-indigo-300 font-semibold shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
          {mathFormula}
        </div>
      );
      continue;
    }

    // Header 1: #
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-white mt-6 mb-2 tracking-tight border-b border-white/10 pb-2 flex items-center gap-2">
          <span className="text-blue-500 font-mono">#</span>
          <span>{renderInlineFormatted(line.slice(2))}</span>
        </h1>
      );
      continue;
    }

    // Header 2: ##
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-extrabold text-white mt-5 mb-2 tracking-tight text-blue-300 flex items-center gap-2">
          <span className="text-indigo-400 font-mono text-base">##</span>
          <span>{renderInlineFormatted(line.slice(3))}</span>
        </h2>
      );
      continue;
    }

    // Header 3: ###
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-slate-100 mt-4 mb-1.5 flex items-center gap-1.5">
          <span className="text-cyan-400 font-mono text-xs">###</span>
          <span>{renderInlineFormatted(line.slice(4))}</span>
        </h3>
      );
      continue;
    }

    // Header 4: ####
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm sm:text-base font-bold text-slate-200 mt-3 mb-1">
          {renderInlineFormatted(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Horizontal Rule: --- or ***
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-5 border-white/[0.08]" />);
      continue;
    }

    // Blockquote: >
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`quote-${i}`} className="my-3 pl-4 py-1.5 border-l-2 border-blue-500 bg-blue-500/[0.04] rounded-r-xl text-xs sm:text-sm text-slate-300 italic font-mono">
          {renderInlineFormatted(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Checkbox Lists: - [x] or - [ ]
    if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [ ] ')) {
      const isChecked = trimmed.startsWith('- [x] ');
      const taskText = trimmed.slice(6);
      elements.push(
        <div key={`task-${i}`} className="flex items-center gap-2.5 my-1.5 text-xs sm:text-sm">
          {isChecked ? (
            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Square className="w-4 h-4 text-[#94A3B8] shrink-0" />
          )}
          <span className={isChecked ? 'text-slate-200 line-through opacity-80' : 'text-slate-100'}>
            {renderInlineFormatted(taskText)}
          </span>
        </div>
      );
      continue;
    }

    // Bullet Lists: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm text-slate-200 leading-relaxed pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0 shadow-[0_0_6px_#38BDF8]" />
          <span className="flex-1">{renderInlineFormatted(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Paragraph thông thường
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed my-1.5">
        {renderInlineFormatted(line)}
      </p>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}