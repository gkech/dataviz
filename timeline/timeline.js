const data = [
    { date: "2022-01-01", event: "Event 1" },
    { date: "2022-02-15", event: "Event 2" },
    { date: "2022-04-10", event: "Event 3" },
    // Add more events...
  ];
  
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  
  const svg = d3.select("#timeline")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  const parseDate = d3.timeParse("%Y-%m-%d");
  
  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });
  
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);
  
  const yScale = d3.scaleBand()
    .domain(data.map(d => d.event))
    .range([height, 0])
    .padding(0.1);
  
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);
  
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);
  
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.date))
    .attr("y", d => yScale(d.event))
    .attr("width", 10) // Adjust the width as needed
    .attr("height", yScale.bandwidth());
  