import { useMemo } from "react";
import * as d3 from "d3";

type YAxisProps = {
  yScale: d3.ScaleLinear<number, number>;
  height: number;
};

export const YAxis = ({ yScale, height }: YAxisProps) => {
  const ticks = useMemo(() => {
    const numberOfTicksTarget = Math.floor(height / 40);
    return yScale.ticks(numberOfTicksTarget).map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [yScale, height]);

  return (
    <g>
      {/* Main vertical line */}
      <line
        x1={0}
        y1={yScale.range()[0]}
        x2={0}
        y2={yScale.range()[1]}
        stroke="currentColor"
      />

      {/* Ticks and labels */}
      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(0, ${yOffset})`}>
          <line x2={-6} stroke="currentColor" />
          <text
            x={-10}
            y={5}
            fontSize="10"
            textAnchor="end"
          >
            {value}
          </text>
        </g>
      ))}
    </g>
  );
};
