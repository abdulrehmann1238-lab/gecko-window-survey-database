import React from 'react';
import { PaneShape } from '../../data/types';

interface DimensionDiagramProps {
  width: number;
  height: number;
  shape?: PaneShape;
  displayId?: string;
  colour?: string;
  className?: string;
}

export const DimensionDiagram: React.FC<DimensionDiagramProps> = ({
  width,
  height,
  shape = 'Rectangle',
  displayId,
  colour = 'White (RAL 9016)',
  className = '',
}) => {
  // SVG viewport
  const svgWidth = 320;
  const svgHeight = 260;

  // Compute pane bounding box in SVG with margin for dimension lines
  const marginX = 48;
  const marginY = 48;
  const maxW = svgWidth - marginX * 2;
  const maxH = svgHeight - marginY * 2;

  const aspectRatio = width / height;
  let drawW = maxW;
  let drawH = drawW / aspectRatio;

  if (drawH > maxH) {
    drawH = maxH;
    drawW = drawH * aspectRatio;
  }

  const startX = (svgWidth - drawW) / 2 + 10;
  const startY = (svgHeight - drawH) / 2 + 10;
  const endX = startX + drawW;
  const endY = startY + drawH;

  // Render path depending on shape
  let pathD = '';
  if (shape === 'Arched') {
    const archH = drawH * 0.35;
    const shoulderY = startY + archH;
    pathD = `M ${startX} ${endY} L ${startX} ${shoulderY} A ${drawW / 2} ${archH} 0 0 1 ${endX} ${shoulderY} L ${endX} ${endY} Z`;
  } else if (shape === 'Angled') {
    const angleOffset = drawW * 0.25;
    pathD = `M ${startX} ${endY} L ${startX + angleOffset} ${startY} L ${endX} ${startY} L ${endX} ${endY} Z`;
  } else {
    pathD = `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY} L ${startX} ${endY} Z`;
  }

  // Dimension line positions:
  // Top horizontal dimension line:
  const topDimY = startY - 18;
  // Left vertical dimension line:
  const leftDimX = startX - 18;

  return (
    <div className={`p-4 bg-surface border border-line rounded-r3 flex flex-col items-center select-none ${className}`}>
      <svg
        width="100%"
        height="220"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="overflow-visible"
      >
        <defs>
          <pattern id="diag-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#E2DED4" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background blueprint subtle grid */}
        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#diag-grid)" rx="6" />

        {/* The Window Pane Outline */}
        <path
          d={pathD}
          fill="rgba(46, 74, 62, 0.04)"
          stroke="var(--primary)"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* Secondary glazing inner glazing bead */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="0.75"
          transform={`scale(0.96) translate(${startX * 0.04}, ${startY * 0.04})`}
        />

        {/* TOP DIMENSION LINE (WIDTH) */}
        {/* Main horizontal line */}
        <line
          x1={startX}
          y1={topDimY}
          x2={endX}
          y2={topDimY}
          stroke="var(--ink-2)"
          strokeWidth="1"
        />
        {/* Left tick */}
        <line
          x1={startX}
          y1={topDimY - 4}
          x2={startX}
          y2={topDimY + 4}
          stroke="var(--ink-2)"
          strokeWidth="1"
        />
        {/* Right tick */}
        <line
          x1={endX}
          y1={topDimY - 4}
          x2={endX}
          y2={topDimY + 4}
          stroke="var(--ink-2)"
          strokeWidth="1"
        />
        {/* Width label */}
        <text
          x={startX + drawW / 2}
          y={topDimY - 6}
          textAnchor="middle"
          fill="var(--ink)"
          fontSize="11"
          fontWeight="500"
          className="font-mono-data"
        >
          {width.toLocaleString()} mm
        </text>

        {/* LEFT DIMENSION LINE (HEIGHT) */}
        {/* Main vertical line */}
        <line
          x1={leftDimX}
          y1={startY}
          x2={leftDimX}
          y2={endY}
          stroke="var(--ink-2)"
          strokeWidth="1"
        />
        {/* Top tick */}
        <line
          x1={leftDimX - 4}
          y1={startY}
          x2={leftDimX + 4}
          y2={startY}
          stroke="var(--ink-2)"
          strokeWidth="1"
        />
        {/* Bottom tick */}
        <line
          x1={leftDimX - 4}
          y1={endY}
          x2={leftDimX + 4}
          y2={endY}
          stroke="var(--ink-2)"
          strokeWidth="1"
        />
        {/* Height label rotated */}
        <text
          x={-(startY + drawH / 2)}
          y={leftDimX - 6}
          textAnchor="middle"
          transform="rotate(-90)"
          fill="var(--ink)"
          fontSize="11"
          fontWeight="500"
          className="font-mono-data"
        >
          {height.toLocaleString()} mm
        </text>

        {/* Center Pane Identifier & Shape watermark */}
        {displayId && (
          <text
            x={startX + drawW / 2}
            y={startY + drawH / 2 + 4}
            textAnchor="middle"
            fill="var(--primary)"
            fontSize="12"
            fontWeight="600"
            className="font-mono-data"
          >
            {displayId}
          </text>
        )}
      </svg>

      <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-line text-[12px] text-ink-3">
        <span>Profile: <strong className="text-ink font-medium">{colour}</strong></span>
        <span>Shape: <strong className="text-ink font-medium">{shape}</strong></span>
      </div>
    </div>
  );
};
