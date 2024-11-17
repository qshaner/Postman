import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { XAxis } from "./XAxis";
import { YAxis } from "./YAxis";

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type DataPoint = { x: string; y: number };

type LineChartProps = {
  width: number;
  height: number;
  data: DataPoint[];
};

export const LineChart = ({ width, height, data }: LineChartProps) => {
  
  // bounds = area inside the graph axis = calculated by subtracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const [isBrushing, setIsBrushing] = useState(false);
  const [brushStart, setBrushStart] = useState<number | null>(null);
  const [brushEnd, setBrushEnd] = useState<number | null>(null);

  // Y axis
  const max = d3.max(data, (d) => d.y);
  const yScale = d3
    .scaleLinear()
    .domain([0, max || 0])
    .range([boundsHeight, 0]);

  // X axis
  const customTimeParser = d3.timeParse("%Y-%m-%d");
  const times = data
    .map((d) => customTimeParser(d.x))
    .filter((item) => item instanceof Date); // Ensure only valid dates are kept

  const dateDomain = d3.extent(times); // Get min and max dates

  if (!dateDomain[0] || !dateDomain[1]) {
    throw new Error("Invalid date domain: ensure your data contains valid dates.");
  }

  const [domain, setDomain] = useState<[number, number]>(dateDomain);

  const xScale = d3.scaleTime().domain(domain).range([0, boundsWidth]);

  // Mouse handlers for custom brushing
  const handleMouseDown = (event: React.MouseEvent<SVGRectElement>) => {
    setIsBrushing(true);
    setBrushStart(event.nativeEvent.offsetX);
    setBrushEnd(null);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    if (!isBrushing || brushStart === null) return;
    setBrushEnd(event.nativeEvent.offsetX);
  };

  const handleMouseUp = () => {
    if (isBrushing && brushStart !== null && brushEnd !== null) {
      const startX = Math.min(brushStart, brushEnd);
      const endX = Math.max(brushStart, brushEnd);
      const newDomain = [xScale.invert(startX), xScale.invert(endX)];
      setDomain(newDomain);
    }
    setIsBrushing(false);
    setBrushStart(null);
    setBrushEnd(null);
  };

  // Render the X and Y axis using d3.js
  useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append("g")
      .attr("transform", "translate(" + MARGIN.left + "," + (boundsHeight + MARGIN.top) + ")")
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")").call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);

  // Build the line
  const lineBuilder = d3
    .line<DataPoint>()
    .x((d) => xScale(customTimeParser(d.x)))
    .y((d) => yScale(d.y));
  const linePath = lineBuilder(data);

  if (!linePath) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          <path
            d={linePath}
            opacity={1}
            stroke="#9a6fb0"
            fill="none"
            strokeWidth={2}
          />
        </g>
        <g ref={axesRef}>
          {/* Y-axis and X-axis will be rendered inside this group */}
        </g>
        {/* Brushing overlay */}
        <rect
          width={boundsWidth}
          height={boundsHeight}
          fill="transparent"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        {isBrushing && brushStart !== null && brushEnd !== null && (
          <rect
            x={Math.min(brushStart, brushEnd)}
            width={Math.abs(brushEnd - brushStart)}
            height={boundsHeight}
            fill="rgba(154, 111, 176, 0.3)"
            pointerEvents={'none'}
          />
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          border: 'solid black 2px',
          padding: 3,
        }}
      >
        <button onClick={() => setDomain(dateDomain)}>Reset</button>
      </div>
    </div>
  );
};
