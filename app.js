const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

d3.json(url).then((data) => {
  const svgWidth = 900;
  const svgHeight = 600;
  const padding = 80;

  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d["Year"]) - 1, // Start 1 year less - better dot placement
      d3.max(data, (d) => d["Year"]) + 1, // End 1 year more - better dot placement
    ])
    .range([padding, svgWidth - padding]);

  const yScale = d3
    // D3’s time scales operate on JavaScript Date objects
    .scaleTime()
    .domain([
      d3.min(data, (d) => {
        // Convert time to miliseconds to create a new Date object
        return new Date(d["Seconds"] * 1000);
      }),
      d3.max(data, (d) => {
        return new Date(d["Seconds"] * 1000);
      }),
    ])
    .range([padding, svgHeight - padding]);

  const chartSVG = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const yAxisLabel = chartSVG
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("x", -300)
    .attr("y", 25)
    .attr("transform", "rotate(-90)")
    .text("Time in Minutes");

  const tooltip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const dots = chartSVG
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d) => xScale(d["Year"]))
    .attr("cy", (d) => {
      return yScale(new Date(d["Seconds"] * 1000));
    })
    .attr("r", 5)
    .attr("data-xvalue", (d) => d["Year"])
    .attr("data-yvalue", (d) => {
      return new Date(d["Seconds"] * 1000);
    })
    .attr("fill", (d) => {
      // Change color of dots depending on doping allegations
      if (d["Doping"] !== "") {
        return "orange";
      } else {
        return "lightgreen";
      }
    })
    .on("mouseover", (event, d) => {
      tooltip.transition().style("opacity", 1);
      tooltip.attr("data-year", d.Year);
      tooltip
        .html(
          d.Name +
            ": " +
            d.Nationality +
            "<br/>" +
            "Year: " +
            d.Year +
            ", Time: " +
            d.Time +
            "<br/><br/>" +
            (d.Doping !== "" ? d.Doping : "No doping allegations")
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 30 + "px");
    })
    .on("mouseout", (d) => {
      tooltip.transition().style("opacity", 0);
    });

  const xAxis = d3
    .axisBottom(xScale)
    // Avoids commas in years by reformatting tick labels
    .tickFormat(d3.format("d"));
  const yAxis = d3
    .axisLeft(yScale)
    // Reformats tick labels to Minutes:Seconds
    .tickFormat(d3.timeFormat("%M:%S"));

  chartSVG
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + (svgHeight - padding) + ")")
    .call(xAxis);
  chartSVG
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);
});
