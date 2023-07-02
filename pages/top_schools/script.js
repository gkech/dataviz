d3.csv("../pages/top_schools/data.csv").then(function(data) {
    const margin = { top: 50, right: 20, bottom: 40, left: 180 };
    const containerWidth = window.innerWidth * 0.3; // Chart container width
    const containerHeight = window.innerHeight * 0.35; // chart container height
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const barHeight = 15;

    let aggregatedData = [];

    const drawChart = (data) => {
        const chartHeight = data.length * barHeight;

        let maxCount = d3.max(data, d => d.count);
        let desiredTicks = 10;
        let step = Math.ceil(maxCount / desiredTicks);
        let tickValues = Array.from({length: desiredTicks}, (_, i) => i * step);

        const x = d3.scaleLinear()
            .domain([0, maxCount])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(data.map(d => d.organization))
            .range([chartHeight, 0]) // Reverse the range to position the bars from top to bottom
            .padding(0.1);

        const chartContainer = d3.select("#top-schools-chart")
            .style("overflow-y", "scroll") // Enable vertical scrolling
            .style("max-height", `${containerHeight}px`) // Max height for the chart container
            .style("width", `${containerWidth}px`); // Width for the chart container

        chartContainer.selectAll("svg").remove();

        const svg = chartContainer.append("svg")
            .attr("width", containerWidth)
            .attr("height", chartHeight + margin.top + margin.bottom) // Adjust the SVG height to include the top margin
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", d => y(d.organization))
            .attr("width", d => Math.max(1, x(d.count))) // Set a minimum width for the bars
            .attr("height", y.bandwidth())
            .attr("fill", "#c9b371");

        // Append text elements to display the count of each bar
        svg.selectAll(".count-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "count-label")
            .attr("x", d => x(d.count) + 5) // Adjust the position of the count label
            .attr("y", d => y(d.organization) + y.bandwidth() / 2 + 4) // Adjust the position of the count label
            .text(d => d.count);

        const xAxis = svg.append("g")
            .attr("class", "x-axis")
            .call(d3.axisTop(x).tickValues(tickValues).tickFormat(d3.format("d"))) // Set the number of ticks and format as integers
            .attr("transform", `translate(0, 0)`); // Move the x-axis to the top of the chart

        // Make x-axis line and labels visible
        xAxis.select(".domain").attr("stroke", "#000");
        xAxis.selectAll(".tick line").attr("stroke", "#000");
        xAxis.selectAll("text").style("font-size", "12px");

        const yAxis = svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y))
            .selectAll(".tick text")  // select all the y axis labels
            .call(function(t) {
                t.each(function(d) {
                    d3.select(this)
                        .text(function(d) { return d.length > 25 ? d.slice(0, 25) + "..." : d; }) // trim the label if it's too long
                        .append("title")  // append a title tag to the label
                        .text(d);  // set the title text to the full label text
                });
            });

        // Adjust the width of the y-axis ticks
        yAxis.selectAll("line").style("stroke-width", "2px");
        yAxis.selectAll("path").style("stroke-width", "2px");
        yAxis.selectAll("text").style("font-size", "12px");

        // Adjust the width of the y-axis tick marks
        yAxis.selectAll(".tick line").style("stroke-width", "2px");
    };

    const updateChart = () => {
        const selectedCategory = d3.select("#category-filter").property("value");

        if (selectedCategory === "all") {
            aggregatedData = Array.from(d3.group(data, d => d.organization), ([organization, values]) => ({
                organization: organization,
                count: d3.sum(values, d => +d.count)
            }));
        } else {
            const filteredData = data.filter(d => d.category === selectedCategory);
            aggregatedData = Array.from(d3.group(filteredData, d => d.organization), ([organization, values]) => ({
                organization: organization,
                count: d3.sum(values, d => +d.count)
            }));
        }

        aggregatedData = aggregatedData.filter(d => d.count > 0);

        // Sort the aggregatedData array in descending order based on the count
        aggregatedData.sort((a, b) => a.count - b.count);

        drawChart(aggregatedData);
    };

    // Add change event listener to the category filter dropdown
    d3.select("#category-filter").on("change", updateChart);

    // Initial chart rendering
    updateChart();
});
