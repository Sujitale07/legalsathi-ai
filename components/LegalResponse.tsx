'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

// ─── Step item (numbered card) ────────────────────────────────────────────────

function StepItem({ stepNumber, children }: { stepNumber: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 leading-none"
        style={{ backgroundColor: '#1E2E4F', color: '#EEE9DF' }}
      >
        {stepNumber}
      </span>
      <div className="flex-1 min-w-0 text-[13.5px] leading-[1.75]" style={{ color: '#1A1A2E' }}>
        {children}
      </div>
    </li>
  )
}

// ─── Custom renderers ─────────────────────────────────────────────────────────

const components: Components = {
  // Ordered list → step cards — inject step numbers into children
  ol({ children }) {
    let idx = 0
    const numbered = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Each child here is a li element; replace with StepItem
        const step = idx + 1
        idx++
        return (
          <StepItem key={step} stepNumber={step}>
            {(child.props as { children?: React.ReactNode }).children}
          </StepItem>
        )
      }
      return child
    })
    return <ol className="space-y-3 my-3 list-none p-0">{numbered}</ol>
  },

  // Unordered list → styled bullet list
  ul({ children }) {
    return <ul className="space-y-2 my-3 list-none p-0">{children}</ul>
  },

  // Unordered list item → bullet dot
  li({ children }) {
    return (
      <li className="flex gap-2.5 items-start text-[13.5px] leading-[1.75]" style={{ color: '#1A1A2E' }}>
        <span
          className="shrink-0 w-1.5 h-1.5 rounded-full mt-[0.55em]"
          style={{ backgroundColor: '#1E2E4F' }}
        />
        <div className="flex-1 min-w-0">{children}</div>
      </li>
    )
  },

  // Paragraph
  p({ children }) {
    return (
      <p className="text-[13.5px] leading-[1.85] my-2 first:mt-0 last:mb-0" style={{ color: '#1A1A2E' }}>
        {children}
      </p>
    )
  },

  // Bold → navy emphasis
  strong({ children }) {
    return (
      <strong className="font-semibold" style={{ color: '#1E2E4F' }}>
        {children}
      </strong>
    )
  },

  // H2 → section label
  h2({ children }) {
    return (
      <h2
        className="text-[11px] font-bold uppercase tracking-widest mt-5 mb-2 first:mt-0 pb-1.5 border-b"
        style={{ color: '#1E2E4F', borderColor: '#E2D9CF' }}
      >
        {children}
      </h2>
    )
  },

  // H3 → subsection
  h3({ children }) {
    return (
      <h3 className="text-[13px] font-semibold mt-4 mb-1.5 first:mt-0" style={{ color: '#1E2E4F' }}>
        {children}
      </h3>
    )
  },

  // Blockquote → callout / important note box
  blockquote({ children }) {
    return (
      <blockquote
        className="border-l-[3px] pl-4 py-2 my-3 rounded-r-sm text-[13px] leading-[1.75]"
        style={{ borderColor: '#1E2E4F', backgroundColor: '#E8ECF4', color: '#3D4F6B' }}
      >
        {children}
      </blockquote>
    )
  },

  // Inline code
  code({ children }) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-[12px] font-mono"
        style={{ backgroundColor: '#E8ECF4', color: '#1E2E4F' }}
      >
        {children}
      </code>
    )
  },

  // HR → section divider
  hr() {
    return <hr className="my-4 border-0 border-t" style={{ borderColor: '#E2D9CF' }} />
  },
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function LegalResponse({ content }: { content: string }) {
  return (
    <div>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
