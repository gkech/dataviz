function handleMouseOut() {
  var tooltip = d3.select(".tooltip");
  tooltip.transition()
    .duration(500)
    .style("opacity", 0);
}

function createChart() {
  d3.csv("dataset2.csv").then(function(data) {
    data.forEach(function(d) {
      d.unemployment = +d.unemployment;
    });

    var margin = { top: 100, right: 200, bottom: 200, left: 40 };
    var width = Math.min(800, window.innerWidth - margin.left - margin.right);
    var height = Math.min(600, window.innerHeight - margin.top - margin.bottom);

    var svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var originalData = data;
    var filteredData = [];

    var xScale = d3.scaleBand()
      .domain(originalData.map(function(d) { return d.country; }))
      .range([0, width])
      .padding(0.1);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return d.unemployment; })])
      .range([height, 0]);

      var colorScale = d3.scaleOrdinal()
      .domain(data.map(function(d) { return d.region; }))
      .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#FF5733", "#C70039", "#900C3F", "#581845", "#FFC300", "#DAF7A6", "#FF5733", "#C70039", "#900C3F", "#581845"]);    

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) { return xScale(d.country) + xScale.bandwidth() / 2; })
      .attr("cy", function(d) { return yScale(d.unemployment); })
      .attr("r", 8)
      .style("fill", function(d) { return colorScale(d.region); })
      .on("mouseover", function(event, d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html("Country: " + d.country + "<br/>Region: " + d.region)
          .style("left", (event.clientX + 10) + "px")
          .style("top", (event.clientY - 28) + "px");
      })
      .on("mouseout", handleMouseOut);

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-90)")
      .style("font-size", "12px");

    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    svg.append("text")
      .attr("x", (width / 2))
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("text-decoration", "underline")
      .text("Unemployment by Country");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Country");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("font-size", "16px")
      .text("Unemployment Rate");

    var legend = svg.selectAll(".legend")
      .data(colorScale.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend.append("rect")
      .attr("x", width + 10)
      .attr("y", 100)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", colorScale);

    legend.append("text")
      .attr("x", width + 40)
      .attr("y", 108)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return d; });
  }).catch(function(error) {
    console.log(error);
  });
}

createChart();