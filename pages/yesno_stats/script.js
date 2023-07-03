function drawYesNoPublications() {
  // set the dimensions and margins of the graph
  const margin = { top: 70, right: 10, bottom: 90, left: 100 },
    width = 500 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select("#my_dataviz_yes")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Read the data from CSV
  d3.csv("../pages/yesno_stats/dataset.csv").then(function (data) {
    // Convert string values to numbers
    data.forEach(function (d) {
      d.yes_count = +d.yes_count;
      d.no_count = +d.no_count;
    });

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array.from(new Set(data.map((d) => d.decade)));
    const myVars = Array.from(new Set(data.map((d) => d.category)));

    // Build X scales and axis
    const x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.05);
    svg
      .append("g")
      .style("font-size", 15)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("dx", "-0.8em")
      .attr("dy", "-0.2em");

    // Build Y scales and axis
    const y = d3.scaleBand().range([height, 0]).domain(myVars).padding(0.05);
    svg
      .append("g")
      .style("font-size", 15)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain")
      .remove();

    // Build color scale
    const myColor = d3
      .scaleSequential()
      // https://github.com/d3/d3-scale-chromatic
      //.interpolator( d3.interpolateBlues)
      .interpolator(d3.interpolate( '#cbf1f5', '#046e78'))
      .domain([0, 4]);

    // Create a tooltip
    const tooltip = d3
      .select("#my_dataviz_yes")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("position", "absolute")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    // Three functions that change the tooltip when the user hovers / moves / leaves a cell
    const mouseover = function (event, d) {
      tooltip.style("opacity", 1);
      d3.select(this).style("stroke", "black").style("opacity", 1);
    };
    const mousemove = function (event, d) {
      const total = d.yes_count + d.no_count;
      const yesRatio = ((d.yes_count / total) * 100).toFixed(2);
      tooltip
        //.html("The exact value of<br>this cell is: " + d.no_count + "/" + d.yes_count)
        .html(
          "Nobel Winning Papers: " +
            d.yes_count +
            "<br>" +
            "Nobel Candidate Papers: " +
            d.no_count +
            "<br>" +
            "Award Ratio: " +
            yesRatio +
            "%"
        )
        // We need this in order to show the tooltip next to the dot
        .style("left", event.pageX + 10 + "px") // Offset the tooltip position by 10 pixels to the right
        .style("top", event.pageY + 10 + "px"); // Offset the tooltip position by 10 pixels downwards
    };
    const mouseleave = function (event, d) {
      tooltip.style("opacity", 0);
      d3.select(this).style("stroke", "none").style("opacity", 0.8);
    };

    // Add the squares
    svg
      .selectAll()
      .data(data, function (d) {
        return d.decade + ":" + d.category;
      })
      .join("rect")
      .attr("x", function (d) {
        return x(d.decade);
      })
      .attr("y", function (d) {
        return y(d.category);
      })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        const total = d.yes_count + d.no_count;
        const yesRatio = ((d.yes_count / total) * 100).toFixed(2);
        return myColor(yesRatio);
      })
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    // Add title to the graph
    // svg
    //   .append("text")
    //   .attr("x", 0)
    //   .attr("y", -50)
    //   .attr("text-anchor", "left")
    //   .style("font-size", "22px")
    //   .text("Test Title");

    // // Add subtitle to the graph
    // svg
    //   .append("text")
    //   .attr("x", 0)
    //   .attr("y", -20)
    //   .attr("text-anchor", "left")
    //   .style("font-size", "14px")
    //   .style("fill", "grey")
    //   .style("max-width", 400)
    //   .text("Test Subtitle");
  });
}

drawYesNoPublications();
