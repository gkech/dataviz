// Select the SVG container
const genderSvg = d3.select("#genderChart")
  .append("svg")
  .attr("width", 600)
  .attr("height", 400);

// Set the margins and dimensions of the chart
const genderMargin = { top: 20, right: 20, bottom: 50, left: 50 };
const genderWidth = +genderSvg.attr("width") - genderMargin.left - genderMargin.right;
const genderHeight = +genderSvg.attr("height") - genderMargin.top - genderMargin.bottom;

// Create a group element and translate it to incorporate the margins
const genderGroup = genderSvg.append("g")
  .attr("transform", `translate(${genderMargin.left}, ${genderMargin.top})`);

// Define the x and y scales
const genderX = d3.scaleLinear().range([0, genderWidth]);
const genderY = d3.scaleLinear().range([genderHeight, 0]);

// Define the line generators
const genderLineMale = d3.line()
  .x(d => genderX(d.year))
  .y(d => genderY(d.maleCount));

const genderLineFemale = d3.line()
  .x(d => genderX(d.year))
  .y(d => genderY(d.femaleCount));

const yearCountMap = new Map(); 

// Function to process the loaded data
function processData(d) {
  // Parse the numeric values
  d.year = +d.year;
  d.count = +d.count;

  if (!yearCountMap.has(d.year)) {
    yearCountMap.set(d.year, {maleCount: 0, femaleCount: 0});
  }

  if (d.sex === 'Male') {
    yearCountMap.get(d.year).maleCount += d.count;
  } else if (d.sex === 'Female') {
    yearCountMap.get(d.year).femaleCount += d.count;
  }

  return d;
}

// Load the data from the CSV file
d3.csv("../pages/gender/data.csv", processData).then(data => {

  // Define the tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #000")
    .style("padding", "5px");

  // Initial chart rendering
  updateChart(data, "all");

  // Handle category filter change event
  const categoryFilter = document.getElementById("category-filter");
  categoryFilter.addEventListener("change", () => {
    const selectedCategory = categoryFilter.value;
    updateChart(data, selectedCategory);
  });

  // Function to draw the chart
  function drawChart(data) {
    // Clear existing chart elements
    genderGroup.selectAll(".line").remove();
    genderGroup.selectAll(".axis").remove();

    // Draw the male line
    genderGroup.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", genderLineMale)
    .on("mouseover", function(d) {
        genderGroup.on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];  // get the x position of the mouse
            const year = Math.round(genderX.invert(mouseX));  // convert this position to a year
            const counts = yearCountMap.get(year).maleCount;  // get the counts for this year

            if (typeof counts === 'undefined') return;

            console.log("Year: " + year + "<br/>Male Count: " + counts)
            tooltip.html("Year: " + year + "<br/>Male Count: " + counts)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY) + "px")
              .style("visibility", "visible");
          }).on("mouseout", function() {
            tooltip.style("visibility", "hidden");
          });
    })

    // Draw the female line
    genderGroup.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "pink")
    .attr("stroke-width", 2)
    .attr("d", genderLineFemale)
    .on("mouseover", function(d) {
        genderGroup.on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];  // get the x position of the mouse
            const year = Math.round(genderX.invert(mouseX));  // convert this position to a year
            const counts = yearCountMap.get(year).femaleCount;  // get the counts for this year

            if (typeof counts === 'undefined') return;

            console.log("Year: " + year + "<br/>Female Count: " + counts)
            tooltip.html("Year: " + year + "<br/>Female Count: " + counts)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px")
              .style("visibility", "visible");
          }).on("mouseout", function() {
            tooltip.style("visibility", "hidden");
          });
            })


    // Add the x-axis
    genderGroup.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${genderHeight})`)
      .call(d3.axisBottom(genderX).tickFormat(d3.format("")));

    // Add the y-axis
    genderGroup.append("g")
      .attr("class", "axis y-axis")
      .call(d3.axisLeft(genderY));

    // Add the x-axis label
    genderGroup.append("text")
      .attr("class", "axis-label")
      .attr("x", genderWidth / 2)
      .attr("y", genderHeight + 40)
      .style("text-anchor", "middle")
      .text("Year");  

    // Add the y-axis label
    genderGroup.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - genderMargin.left)
      .attr("x", 0 - (genderHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of Laureates");

    // Add the legend
    const legend = genderGroup.selectAll('.legend')
      .data(['Male', 'Female'])
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legend.append('rect')
      .attr('x', 10) // Position at the beginning of the x axis
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => (i === 0) ? "steelblue" : "pink");
    
    legend.append('text')
      .attr('x', 30) // Position after the rectangle
      .attr('y', 5)
      .attr('dy', '.35em')
      .style('text-anchor', 'start') // Align text to the start of the element
      .style('font-size', '14px') // Adjust the font size here
      .text(d => d);
  }

  // Function to update the chart
  function updateChart(data, selectedCategory) {
    let filteredData = [];
    if (selectedCategory === "all") {
      filteredData = data;
    } else {
      filteredData = data.filter(d => d.category === selectedCategory);
    }

    // Group the filtered data by year and sex
    const grouped = d3.group(filteredData, d => d.year);
    const genderData = Array.from(grouped, ([key, value]) => ({
      year: key,
      maleCount: d3.sum(value.filter(d => d.sex === 'Male'), d => d.count),
      femaleCount: d3.sum(value.filter(d => d.sex === 'Female'), d => d.count)
    }));

    // Update the x and y scales to the new data
    genderX.domain(d3.extent(genderData, d => d.year));
    genderY.domain([0, d3.max(genderData, d => Math.max(d.maleCount, d.femaleCount))]);

    drawChart(genderData);
  }
});
