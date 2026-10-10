import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../mock/store';

export const HeroScene: React.FC = () => {
  const navigate = useNavigate();
  const { openPaneDrawer } = useAppStore();

  const [hoveredPane, setHoveredPane] = useState<string | null>(null);
  const [remeasuredToggle, setRemeasuredToggle] = useState(false);

  // Remeasure loop every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRemeasuredToggle(prev => !prev);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const handlePaneClick = (paneId: string) => {
    openPaneDrawer('pane_cal_w1p3');
    navigate('/app/customers/cust_calloway');
  };

  // Dimensions for w1p3
  const w1p3Width = remeasuredToggle ? 1184 : 1181;
  const w1p3Height = remeasuredToggle ? 862 : 860;
  const w1p3Price = remeasuredToggle ? '£212.00' : '£184.00';
  const w1p3Version = remeasuredToggle ? 'w1p3-2' : 'w1p3';

  return (
    <div className="relative w-full max-w-[580px] mx-auto select-none">
      {/* SVG Container */}
      <svg
        viewBox="0 0 540 520"
        className="w-full h-auto overflow-visible drop-shadow-sm"
      >
        <defs>
          <pattern id="hero-paper-grain" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#E2DED4" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Outer Architectural Sash Window Timber Frame */}
        <rect
          x="40"
          y="40"
          width="460"
          height="440"
          rx="4"
          fill="#FBFAF7"
          stroke="#46524C"
          strokeWidth="1.5"
        />

        {/* Background Paper Grain subtle grid */}
        <rect
          x="40"
          y="40"
          width="460"
          height="440"
          rx="4"
          fill="url(#hero-paper-grain)"
          opacity="0.6"
        />

        {/* Central Vertical Timber Mullion */}
        <line
          x1="270"
          y1="40"
          x2="270"
          y2="480"
          stroke="#46524C"
          strokeWidth="1.5"
        />

        {/* Central Horizontal Timber Transom Rail */}
        <line
          x1="40"
          y1="250"
          x2="500"
          y2="250"
          stroke="#46524C"
          strokeWidth="1.5"
        />

        {/* PANE 1: Top-Left (w1p1) - Rectangle */}
        <g
          className="cursor-pointer group"
          onClick={() => handlePaneClick('w1p1')}
          onMouseEnter={() => setHoveredPane('w1p1')}
          onMouseLeave={() => setHoveredPane(null)}
        >
          <rect
            x="55"
            y="55"
            width="200"
            height="180"
            rx="2"
            fill={hoveredPane === 'w1p1' ? 'rgba(46,74,62,0.08)' : 'rgba(251,250,247,0.4)'}
            stroke={hoveredPane === 'w1p1' ? 'var(--primary)' : '#76817B'}
            strokeWidth={hoveredPane === 'w1p1' ? '2' : '1'}
            className="transition-colors duration-160"
          />
          {/* Top Dimension Line w1p1 */}
          <line x1="55" y1="48" x2="255" y2="48" stroke="#76817B" strokeWidth="0.75" />
          <line x1="55" y1="45" x2="55" y2="51" stroke="#76817B" strokeWidth="0.75" />
          <line x1="255" y1="45" x2="255" y2="51" stroke="#76817B" strokeWidth="0.75" />
          <text x="155" y="44" textAnchor="middle" fill="#46524C" fontSize="10" className="font-mono-data">
            1,184 mm
          </text>
          {/* Chip */}
          <rect x="65" y="65" width="48" height="20" rx="3" fill="#FBFAF7" stroke="#CFC9BB" strokeWidth="1" />
          <text x="89" y="79" textAnchor="middle" fill="#1E2824" fontSize="11" fontWeight="600" className="font-mono-data">
            w1p1
          </text>
          {/* Price */}
          <rect x="65" y="90" width="56" height="18" rx="2" fill="#E6EDE8" />
          <text x="93" y="103" textAnchor="middle" fill="#2E4A3E" fontSize="10" fontWeight="600" className="font-mono-data">
            £178.00
          </text>
        </g>

        {/* PANE 2: Top-Right (w1p4) - ARCHED PANE */}
        <g
          className="cursor-pointer group"
          onClick={() => handlePaneClick('w1p4')}
          onMouseEnter={() => setHoveredPane('w1p4')}
          onMouseLeave={() => setHoveredPane(null)}
        >
          {/* Arched Path */}
          <path
            d="M 285 235 L 285 115 A 100 60 0 0 1 485 115 L 485 235 Z"
            fill={hoveredPane === 'w1p4' ? 'rgba(46,74,62,0.08)' : 'rgba(251,250,247,0.4)'}
            stroke={hoveredPane === 'w1p4' ? 'var(--primary)' : '#76817B'}
            strokeWidth={hoveredPane === 'w1p4' ? '2' : '1'}
            className="transition-colors duration-160"
          />
          {/* Dimension Line w1p4 */}
          <line x1="285" y1="48" x2="485" y2="48" stroke="#76817B" strokeWidth="0.75" />
          <line x1="285" y1="45" x2="285" y2="51" stroke="#76817B" strokeWidth="0.75" />
          <line x1="485" y1="45" x2="485" y2="51" stroke="#76817B" strokeWidth="0.75" />
          <text x="385" y="44" textAnchor="middle" fill="#46524C" fontSize="10" className="font-mono-data">
            1,184 mm (R 600)
          </text>
          {/* Chip */}
          <rect x="295" y="125" width="48" height="20" rx="3" fill="#FBFAF7" stroke="#CFC9BB" strokeWidth="1" />
          <text x="319" y="139" textAnchor="middle" fill="#1E2824" fontSize="11" fontWeight="600" className="font-mono-data">
            w1p4
          </text>
          {/* Price */}
          <rect x="295" y="150" width="56" height="18" rx="2" fill="#E6EDE8" />
          <text x="323" y="163" textAnchor="middle" fill="#2E4A3E" fontSize="10" fontWeight="600" className="font-mono-data">
            £220.00
          </text>
        </g>

        {/* PANE 3: Bottom-Left (w1p2) - Rectangle */}
        <g
          className="cursor-pointer group"
          onClick={() => handlePaneClick('w1p2')}
          onMouseEnter={() => setHoveredPane('w1p2')}
          onMouseLeave={() => setHoveredPane(null)}
        >
          <rect
            x="55"
            y="265"
            width="200"
            height="200"
            rx="2"
            fill={hoveredPane === 'w1p2' ? 'rgba(46,74,62,0.08)' : 'rgba(251,250,247,0.4)'}
            stroke={hoveredPane === 'w1p2' ? 'var(--primary)' : '#76817B'}
            strokeWidth={hoveredPane === 'w1p2' ? '2' : '1'}
            className="transition-colors duration-160"
          />
          {/* Chip */}
          <rect x="65" y="275" width="48" height="20" rx="3" fill="#FBFAF7" stroke="#CFC9BB" strokeWidth="1" />
          <text x="89" y="289" textAnchor="middle" fill="#1E2824" fontSize="11" fontWeight="600" className="font-mono-data">
            w1p2
          </text>
          {/* Price */}
          <rect x="65" y="300" width="56" height="18" rx="2" fill="#E6EDE8" />
          <text x="93" y="313" textAnchor="middle" fill="#2E4A3E" fontSize="10" fontWeight="600" className="font-mono-data">
            £178.00
          </text>
        </g>

        {/* PANE 4: Bottom-Right (w1p3 / w1p3-2) - The Star of the Narrative Thread */}
        <g
          className="cursor-pointer group"
          onClick={() => handlePaneClick('w1p3')}
          onMouseEnter={() => setHoveredPane('w1p3')}
          onMouseLeave={() => setHoveredPane(null)}
        >
          <rect
            x="285"
            y="265"
            width="200"
            height="200"
            rx="2"
            fill={hoveredPane === 'w1p3' ? 'rgba(176,133,71,0.12)' : 'rgba(251,250,247,0.5)'}
            stroke={hoveredPane === 'w1p3' ? 'var(--accent)' : '#76817B'}
            strokeWidth={hoveredPane === 'w1p3' ? '2' : '1'}
            className="transition-colors duration-160"
          />

          {/* Right Height Dimension Line */}
          <line x1="492" y1="265" x2="492" y2="465" stroke="#76817B" strokeWidth="0.75" />
          <line x1="489" y1="265" x2="495" y2="265" stroke="#76817B" strokeWidth="0.75" />
          <line x1="489" y1="465" x2="495" y2="465" stroke="#76817B" strokeWidth="0.75" />
          <text
            x="-365"
            y="506"
            transform="rotate(-90)"
            textAnchor="middle"
            fill="#46524C"
            fontSize="10"
            className="font-mono-data font-semibold"
          >
            {w1p3Height} mm
          </text>

          {/* Bottom Width Dimension Line */}
          <line x1="285" y1="472" x2="485" y2="472" stroke="#76817B" strokeWidth="0.75" />
          <line x1="285" y1="469" x2="285" y2="475" stroke="#76817B" strokeWidth="0.75" />
          <line x1="485" y1="469" x2="485" y2="475" stroke="#76817B" strokeWidth="0.75" />
          <text x="385" y="486" textAnchor="middle" fill="#46524C" fontSize="10" className="font-mono-data font-semibold">
            {w1p3Width} mm
          </text>

          {/* Version Chip (Flips between w1p3 and w1p3-2) */}
          <rect
            x="295"
            y="275"
            width={remeasuredToggle ? "62" : "50"}
            height="22"
            rx="3"
            fill="#FBFAF7"
            stroke="var(--accent)"
            strokeWidth="1.2"
          />
          <text
            x={remeasuredToggle ? 326 : 320}
            y="290"
            textAnchor="middle"
            fill="#1E2824"
            fontSize="11"
            fontWeight="600"
            className="font-mono-data"
          >
            {w1p3Version}
          </text>

          {/* Ghost of Old Version when remeasured */}
          {remeasuredToggle && (
            <g opacity="0.6">
              <text x="295" y="325" fill="#76817B" fontSize="9" className="font-mono-data line-through">
                w1p3: 1,181 × 860
              </text>
              <text x="295" y="337" fill="var(--accent)" fontSize="9" className="font-mono-data font-medium">
                Δ +3 mm reveal taper
              </text>
            </g>
          )}

          {/* Dynamic Rule Price Chip */}
          <rect
            x={remeasuredToggle ? "365" : "355"}
            y="275"
            width="60"
            height="22"
            rx="2"
            fill="var(--accent-tint)"
            stroke="var(--accent)"
            strokeWidth="0.75"
          />
          <text
            x={remeasuredToggle ? 395 : 385}
            y="290"
            textAnchor="middle"
            fill="#B08547"
            fontSize="11"
            fontWeight="600"
            className="font-mono-data"
          >
            {w1p3Price}
          </text>

          {/* "Rule price" micro-caption under price */}
          <text x={remeasuredToggle ? 395 : 385} y="306" textAnchor="middle" fill="#76817B" fontSize="8" className="font-mono-data">
            Rule price
          </text>
        </g>
      </svg>

      {/* Hero Scene Hint Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-3 font-mono px-2">
        <span>DRAWING REF: ELEVATION-SASH-01</span>
        <span className="text-primary font-medium hover:underline cursor-pointer" onClick={() => handlePaneClick('w1p3')}>
          Click pane to open live lineage drawer →
        </span>
      </div>
    </div>
  );
};
