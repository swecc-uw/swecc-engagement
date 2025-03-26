import { useColorModeValue } from '@chakra-ui/react';
import { useRef } from 'react';
import { Ring } from './ApplicationStats';
import { TooltipState } from './ApplicationStats';

// Fitness Rings Component
const FitnessRings = ({
  rings,
  tooltip,
  onShowTooltip,
  onHideTooltip,
}: {
  rings: Ring[];
  tooltip: TooltipState;
  onShowTooltip: (ring: Ring) => void;
  onHideTooltip: () => void;
}) => {
  const centerX = 150;
  const centerY = 150;
  const ringWidth = 20;
  const svgRef = useRef(null);
  const bgColor = useColorModeValue('#e2e8f0', '#2D3748');

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" ref={svgRef}>
      {rings.map((ring, index) => {
        const radius = ring.radius;
        const circumference = 2 * Math.PI * radius;
        const normalizedValue = ring.exceedsAverage
          ? (ring.value % ring.total) / (ring.total || 1)
          : ring.value / (ring.total || 1);
        const dashoffset = circumference * (1 - normalizedValue);

        return (
          <g key={index}>
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={bgColor}
              strokeWidth={ringWidth}
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={ringWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${centerX} ${centerY})`}
              onMouseEnter={() => onShowTooltip(ring)}
              onMouseLeave={onHideTooltip}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                filter: ring.exceedsAverage
                  ? 'brightness(1.3) drop-shadow(0 0 4px rgba(255,255,255,0.5))'
                  : 'none',
                opacity: 0.9,
              }}
            />
            {ring.exceedsAverage && (
              <text
                x={centerX}
                y={centerY - radius}
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
                  paintOrder: 'stroke',
                  stroke: ring.color,
                  strokeWidth: '3px',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                }}
              >
                {Math.floor(ring.value / (ring.total || 1))}x
              </text>
            )}
          </g>
        );
      })}

      {tooltip.show && (
        <g>
          <rect
            x={centerX - tooltip.width / 2}
            y={tooltip.y - 30}
            width={tooltip.width}
            height="24"
            rx="5"
            fill="rgba(0,0,0,0.75)"
          />
          <text
            x={centerX}
            y={tooltip.y - 18}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="white"
            fontSize="12"
          >
            {tooltip.content}
          </text>
        </g>
      )}
    </svg>
  );
};

export default FitnessRings;
