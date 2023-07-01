function main(){
var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

d3.csv("../age_groups.csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);
  console.log(keys)

  data.sort(function(a, b) { return b.total - a.total; });
  x.domain(data.map(function(d) { return d.age_group; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  z.domain(keys);

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.age_group); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())
    .on("mouseover", function(d) {
        // Show tooltip
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.8)
          .attr("stroke", "black");
    
        // Position and display the value
        const xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;
        const yPosition = parseFloat(d3.select(this).attr("y")) + 10;
    
        g.append("text")
          .attr("id", "tooltip")
          .attr("x", xPosition)
          .attr("y", yPosition)
          .attr("text-anchor", "middle")
          .attr("font-family", "sans-serif")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(d[1] - d[0]);
    })
    .on("mouseout", function() {
        // Hide tooltip
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("stroke", "none");
          d3.select("#tooltip").remove();
    });

  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Population");

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

    const select = document.getElementById("category-select");
    select.addEventListener ("change", function () {
        const selectedCategory = this.value;
        console.log(selectedCategory)
        if(selectedCategory === "all") keys = data.columns.slice(1);
        else keys = [selectedCategory]

        console.log(keys)
        g.selectAll("g").remove();
        
        g.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(data))
            .enter().append("g")
            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.data.age_group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .on("mouseover", function(d) {
                // Show tooltip
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style("opacity", 0.8)
                  .attr("stroke", "black");
            
                // Position and display the value
                const xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;
                const yPosition = parseFloat(d3.select(this).attr("y")) + 10;
            
                g.append("text")
                  .attr("id", "tooltip")
                  .attr("x", xPosition)
                  .attr("y", yPosition)
                  .attr("text-anchor", "middle")
                  .attr("font-family", "sans-serif")
                  .attr("font-size", "12px")
                  .attr("font-weight", "bold")
                  .text(d[1] - d[0]);
            })
            .on("mouseout", function() {
                // Hide tooltip
                d3.select(this)
                  .transition()
                  .duration(200)
                  .style("opacity", 1)
                  .attr("stroke", "none");
                  d3.select("#tooltip").remove();
            });

            g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
      
        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
          .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Count")
            
                
        // Update the bar plot with the filtered data
    });     
});
}
main()
