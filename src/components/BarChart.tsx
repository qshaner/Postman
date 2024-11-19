import * as d3 from "d3";
import { useRef, useEffect } from "react";

const MARGIN = { top: 30, right: 30, bottom: 80, left: 80 };

type DataPoint = { x: string; y: number };

type BarChartProps = {
  width: number;
  height: number;
  data: DataPoint[];
  title: string;
};

export const BarChart = ({ title, width, height, data }:BarChartProps) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svgHeight = height + MARGIN.bottom; // Dynamically adjust SVG height to keep X Axis rendered properly

    const svg = d3.select(svgRef.current).attr("height", svgHeight);
    svg.selectAll("*").remove(); // Clear previous render

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.x))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y)])
      .nice()
      .range([innerHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Axes
    g.append("g").call(d3.axisLeft(yScale));
    g.append("g")
  .call(d3.axisBottom(xScale))
  .attr("transform", `translate(0,${innerHeight})`)
  .selectAll("text")
  .style("text-anchor", "end") // Align text to the end for better appearance
  .attr("transform", "rotate(-45)") // Rotate the text labels
  .attr("dx", "-0.5em") // Adjust horizontal position
  .attr("dy", "0.1em"); // Adjust vertical position

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.x))
      .attr("y", (d) => yScale(d.y))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.y))
      .attr("fill", "IndianRed")
      .on("mouseover", function() {d3.select(this).transition().duration(200).attr("fill", "crimson")})
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("fill", "IndianRed"); // Reset color on mouse out
      });

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", MARGIN.top / 2)
      .attr("text-anchor", "middle")
      .text(title)
      .style("font-size", "16px")
      .style("font-weight", "bold");
  }, [data]);

  return <svg ref={svgRef} width={width} height={height} />;
};
