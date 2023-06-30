// set the dimensions and margins of the graph
var margin = { top: 50, right: 60, bottom: 50, left: 60 },
  width = 600 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("../pages/years2win/data.csv")
  .then(function (data) {
    // Define color scale for Nobel categories
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    data.forEach(function (d) {
      d.prize_year = parseInt(d.prize_year);
      d.pub_year = parseInt(d.pub_year);
      d.years_to_win = d.prize_year - d.pub_year;
    });

    // Add X axis
    var x = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return d.prize_year;
        })
      )
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add X axis label
    svg
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .style("text-anchor", "middle")
      .text("Nobel Prize Year");

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return d.years_to_win;
        })
      )
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Add Y axis label
    svg
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .style("text-anchor", "middle")
      .text("Years Between Prize Year and Publication Year");

    // A tooltip
    var tooltip = d3
      .select("#my_dataviz")
      .append("div")
      .style("opacity", 0)
      .attr("class", "y2w-tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("position", "absolute")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");

    // Handle mouseover event
    var mouseover = function (d) {
      tooltip.transition().duration(1).style("opacity", 1);
      d3.select(this).style("stroke", "red").style("stroke-width", 4).style("opacity", 1);
    };

    // Handle mousemove event
    var mousemove = function (event, d) {
      tooltip
        .html(
          "Nobel Prize Category: " +
            d.category +
            "<br>" +
            "Prize Winning Paper DOI: " +
            d.doi +
            "<br>" +
            "Prize Laureate: " +
            d.laureate_name +
            "<br>" +
            "Years to Win: " +
            d.years_to_win +
            "<br>" +
            "Publication Year: " +
            d.pub_year +
            "<br>" +
            "Prize Year: " +
            d.prize_year
        )
        // We need this in order to show the tooltip next to the dot
        .style("left", event.pageX + 10 + "px") // Offset the tooltip position by 10 pixels to the right
        .style("top", event.pageY + 10 + "px"); // Offset the tooltip position by 10 pixels downwards
    };

    // Handle mouseleave event
    var mouseleave = function (event, d) {
      tooltip.transition().duration(1).style("opacity", 0);
      d3.select(this).style("stroke", "grey").style("stroke-width", 1).style("opacity", 1);
    };

    svg
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.prize_year);
      })
      .attr("cy", function (d) {
        return y(d.years_to_win);
      })
      .attr("r", 9)
      .style("fill", function (d) {
        return colorScale(d.category);
      })
      .style("opacity", 1)
      .style("stroke", "grey")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    d3.select("#category-filter").on("change", function () {
      var selectedCategory = this.value.toLowerCase();
      filterData(selectedCategory);
    });

    function filterData(category) {
      var filteredData =
        category === "all"
          ? data
          : data.filter(function (d) {
              return d.category === category;
            });

      svg.selectAll("circle").remove();

      svg
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(d.prize_year);
        })
        .attr("cy", function (d) {
          return y(d.years_to_win);
        })
        .attr("r", 9)
        .style("fill", function (d) {
          return colorScale(d.category);
        })
        .style("opacity", 1)
        .style("stroke", "grey")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    }

    // Create color legend
    var legendContainer = d3.select("#legend");
    var categories = Array.from(
      new Set(
        data.map(function (d) {
          return d.category;
        })
      )
    );

    legendContainer
      .append("div")
      .attr("class", "y2w-legend-title")
      .text("Legend");

    var legendItems = legendContainer
      .selectAll(".y2w-legend-item")
      .data(categories)
      .enter()
      .append("div")
      .attr("class", "y2w-legend-item");

    legendItems
      .append("div")
      .attr("class", "y2w-legend-color")
      .style("background-color", function (d) {
        return colorScale(d);
      });

    legendItems.append("span").text(function (d) {
      return d;
    });
  })
  .catch(function (error) {
    console.log(error);
  });
