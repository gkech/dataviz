d3.csv("../pages/top_schools/data.csv").then(function(data) {
    const margin = { top: 50, right: 10, bottom: 40, left: 170 };
    const containerWidth = window.innerWidth * 0.3; // Chart container width
    const containerHeight = 280; // chart container height
    const width = 300;
    const height = containerHeight - margin.top - margin.bottom;
    const barHeight = 15;

    let aggregatedData = [];

const drawChart = (data, selectedCategory) => {
        // Check if the data array is empty and how a message instead of the chart
        if (selectedCategory == "Literature") {
            // Show a message instead of the chart
            d3.select("#top-schools-chart")
              .html('<div class="no-data-message">No data available for this category</div>')                
              .style("overflow-y", "hidden");
            return;
        }else{
            d3.select("#top-schools-chart")
            .html('')                
            .style("overflow-y", "hidden");
        }

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
            .style("width", '600px'); // Width for the chart container

        chartContainer.selectAll("svg").remove();

        const svg = chartContainer.append("svg")
            .attr("width", containerWidth)
            .attr("height", chartHeight + margin.top + margin.bottom) // Adjust the SVG height to include the top margin
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        
        // let barfill = "#407b87";
        let barfill = "#c19a6b";
        if (selectedCategory === 'Chemistry') {
            barfill = "#324c59";
        } else if (selectedCategory === 'Physics') {
            barfill = "#bc8435";
        } else if (selectedCategory === 'Medicine') {
            barfill = "#ebd991";
        } else if (selectedCategory === 'Economics') {
            barfill = "#659ea3";
        } else if (selectedCategory === 'Peace') {
            barfill = "#d6b068";
        } else if (selectedCategory === 'Literature') {
            barfill = "#a3cccb";
        }

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", d => y(d.organization))
            .attr("width", d => Math.max(1, x(d.count))) // Set a minimum width for the bars
            .attr("height", y.bandwidth())
            .attr("fill", barfill);

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

        drawChart(aggregatedData, selectedCategory);
    };

    // Add change event listener to the category filter dropdown
    d3.select("#category-filter").on("change", updateChart);

    // Initial chart rendering
    updateChart();
});
