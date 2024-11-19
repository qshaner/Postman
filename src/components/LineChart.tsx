import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MARGIN = { top: 30, right: 30, bottom: 80, left: 80 };

type DataPoint = { x: string; y: number };

type LineChartProps = {
  width: number;
  height: number;
  data: DataPoint[];
  title: string;
};

export const LineChart = ({ width, height, data, title }: LineChartProps) => {
  
  // bounds = area inside the graph axis = calculated by subtracting the margins
  const axesRef = useRef(null);
  const svgRef = useRef<SVGSVGElement>(null); 
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

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

  const [domain, setDomain] = useState<[Date, Date]>(dateDomain);

  const xScale = d3.scaleTime().domain(domain).range([0, boundsWidth]);

    // Build the line
    const lineBuilder = d3
    .line<DataPoint>()
    .x((d) => xScale(customTimeParser(d.x))+MARGIN.left)
    .y((d) => yScale(d.y));
  const linePath = lineBuilder(data);

  if (!linePath) {
    return null;
  }


   // Brushing and zooming effect
   useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Create a brush
    const brush = d3
      .brushX()
      .extent([
        [MARGIN.left, MARGIN.top],
        [MARGIN.left + boundsWidth, MARGIN.top + boundsHeight],
      ])
      .on("end", (event) => {
        if (!event.selection) return; // Ignore empty selections

        const [x0, x1] = event.selection.map((d) => xScale.invert(d - MARGIN.left));

        // Update the domain with the brushed range
        setDomain([x0, x1]);

        svg.append('defs').append("svg:clipPath")
        .attr("id", "clip")
        .append('svg:rect')
        .attr('width', width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0)

        // Clear the brush area
        svg.select(".brush").call(brush.move, null);
      });

    // Attach brush to the SVG
    svg
      .select<SVGGElement>(".brush")
      .call(brush)
      .call((g) => g.select(".overlay").style("cursor", "crosshair")).append("g").attr("clip-path", "url(#clip)");
  }, [xScale, boundsWidth, boundsHeight]);

 // Render axes whenever domain changes
 useEffect(() => {
    const svg = d3.select(axesRef.current);
    svg.selectAll("*").remove();

    // X Axis
    const xAxisGenerator = d3.axisBottom(xScale);
    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, ${boundsHeight + MARGIN.top})`)
      .call(xAxisGenerator);

    // Y Axis
    const yAxisGenerator = d3.axisLeft(yScale);
    svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
      .call(yAxisGenerator);

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", MARGIN.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(title);
  }, [xScale, yScale, boundsHeight, width]);


  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={width} height={height}>
        {/* Line Path */}
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          <path
            d={linePath || ""}
            opacity={1}
            stroke="#9a6fb0"
            fill="none"
            strokeWidth={2}
            clipPath={"url(#clip)"}
          />
        </g>
        {/* Axes */}
        <g ref={axesRef} />
        {/* Brushing Overlay */}
        <g className="brush" />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          padding: 3,
        }}
      >
        <button onClick={() => setDomain(dateDomain)}>Reset</button>
      </div>
    </div>
  );
};
