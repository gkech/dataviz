function visualizeMap(valueToFilter) {
  const width = "800";
  const height = "500";

  const columnToFilter = "category";
  //    const valueToFilter = "Peace";
  let result = valueToFilter ?? "all";

  const svg = d3
    .select("#my_dataviz_map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3
    .select("#my_dataviz_map")
    .append("div")
    .style("border", "solid")
    .style("position", "absolute")
    .style("background-color", "white")
    .attr("class", "dim-tooltip")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("display", "none");

  const projection = d3
    .geoNaturalEarth1()
    .scale(150)
    .translate([width / 2, height / 1.9]);
  const pathGenerator = d3.geoPath().projection(projection);

  const g = svg.append("g");

  // Define the legend values
  const legendValues = [0, 5, 10, 20, 40];
  const legend = svg.append("g").attr("transform", `translate(20, 480)`);

  svg.call(
    d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    })
  );

  const countryName = {};
  const countrySize = {};

  const color_legend = d3.scaleThreshold();
  const color_legend_label = d3.scaleThreshold();

  //https://unpkg.com/world-atlas@1.1.4/world/50m.json'
  Promise.all([
    d3.tsv("https://unpkg.com/world-atlas@1.1.4/world/50m.tsv"),
    d3.json("../pages/map/json_file.json"),
    d3.csv("../pages/map/csv_category.csv"),
  ]).then(([tsvData, topoJsonData, csvData]) => {
    const countries = topojson.feature(
      topoJsonData,
      topoJsonData.objects.countries
    );

    tsvData.forEach((d) => {
      countryName[d.iso_n3] = d;
    });

    if (result !== "all") {
      // Filter rows based on the specific value in the column
      const filteredRows = csvData.filter(function (row) {
        return row[columnToFilter] === valueToFilter;
      });
      // Perform operations on the filtered rows
      filteredRows.forEach((row) => {
        countrySize[row.iso_n3] = row;
      });
    } else {
      topoJsonData.objects.countries.geometries.forEach((d) => {
        countrySize[d.id] = d;
      });
    }

    r = [0, 5, 10, 20, 40];
    color_legend
      .domain(r)
      .range(["#f0f9e8", "#bae4bc", "#7bccc4", "#43a2ca", "#0868ac"]);
    color_legend_label
      .domain(r)
      .range(["#f0f9e8", "#bae4bc", "#7bccc4", "#43a2ca", "#0868ac"]);

    g.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "dim-country")
      .attr("d", pathGenerator)
      .style("fill", (d) => {
        var id = countrySize[d.id];
        if (typeof id !== "undefined") {
          if (typeof countrySize[d.id].Size === "undefined") {
            return "#f0f9e8";
          } else {
            return color_legend(countrySize[d.id].Size);
          }
        } else {
          return "#f0f9e8";
        }
      })
      .style("stroke", "#9f9c97")
      .style("stroke-width", "0.3px")
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    const spacing = 40;
    // Create color legend rectangles
    const legendRects = legend
      .selectAll(".legend-rect")
      .data(color_legend_label.range())
      .enter()
      .append("rect")
      .attr("class", "legend-rect")
      .attr("x", (d, i) => i * spacing) // spacing between the legend items
      .attr("y", 0)
      .attr("width", spacing) // width of each legend item
      .attr("height", 20) // height of each legend item
      .style("fill", (d) => d);

    // Create legend labels
    const legendLabels = legend
      .selectAll(".legend-label")
      .data(legendValues)
      .enter()
      .append("text")
      .attr("class", "legend-label")
      .attr("x", (d, i) => i * spacing + 12) // positioning of the labels
      .attr("y", -5) // vertical positioning of the labels
      .attr("text-anchor", "middle")
      .text((d) => d);

    // Style the legend labels
    legendLabels
      .style("font-size", "13px")
      .style("fill", "black")
      .style("fill", "black")
      .style("font-weight", "bold");

    function showTooltip(event, d) {
      tooltip
        .style("display", "block")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");

      var name = countryName[d.id].name;
      var id = countrySize[d.id];
      if (typeof id !== "undefined") {
        var size = countrySize[d.id].Size;
      }
      if (typeof size === "undefined") {
        size = "0"; // Replace undefined with a zero
      }

      nobel = "Nobel Prize";
      if (greaterThanOne(size)) {
        nobel = "Nobel Prizes";
      }

      // tooltip.text(`${name}: ${size} ${nobel}`);
      tooltip.html("Country: " + name + "<br>" + "Won: " + size + " " + nobel);
    }

    function greaterThanOne(number) {
      return number > 1;
    }

    function hideTooltip() {
      d3.select(this).attr("fill", null); // Optional: Remove the highlight on mouseout
      tooltip.style("display", "none");
    }

    const select = document.getElementById("category-filter");
    select.addEventListener ("change", function () {
      updateMap(this.value);
    });

    function updateMap(valueToFilter) {
      svg.selectAll("path").remove();

      const columnToFilter = "category";
      //    const valueToFilter = "Peace";
      let result = valueToFilter ?? "all";


      if (result !== "all") {
        // Filter rows based on the specific value in the column
        const filteredRows = csvData.filter(function (row) {
          return row[columnToFilter] === valueToFilter;
        });
        // Perform operations on the filtered rows
        filteredRows.forEach((row) => {
          countrySize[row.iso_n3] = row;
        });
      } else {
        topoJsonData.objects.countries.geometries.forEach((d) => {
          countrySize[d.id] = d;
        });
      }

      g.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "dim-country")
      .attr("d", pathGenerator)
      .style("fill", (d) => {
        var id = countrySize[d.id];
        if (typeof id !== "undefined") {
          if (typeof countrySize[d.id].Size === "undefined") {
            return "#f0f9e8";
          } else {
            return color_legend(countrySize[d.id].Size);
          }
        } else {
          return "#f0f9e8";
        }
      })
      .style("stroke", "#9f9c97")
      .style("stroke-width", "0.3px")
      .on("mouseover", showTooltip)
      .on("mouseout", hideTooltip);

    }
  });
}

visualizeMap("all");
