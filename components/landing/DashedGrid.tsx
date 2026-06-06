import React from 'react'

interface DashedGridProps {
  color?: string
}

export function DashedGrid({ color = '#e7e5e4' }: DashedGridProps) {
  const masks = `
    repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
    repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
    radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
  `
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, ${color} 1px, transparent 1px),
          linear-gradient(to bottom, ${color} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 0',
        maskImage: masks,
        WebkitMaskImage: masks,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      } as React.CSSProperties}
    />
  )
}
