function drawDonut()
{
    margin = { top: 20, right: 10, bottom: 10, left: 40 },
    width = 230 - margin.left - margin.right,
    height = 230 - margin.top - margin.bottom;

    var svg = d3.select("#donut")
        .append('svg')
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);
    var g = svg.append('g')
    .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');
   

    var thickness = 30;
    var duration = 750;

    var radius = Math.min(width, height) / 2;

    classes= ['Female', 'Male']
    var color = d3.scaleOrdinal()
        .domain(classes)
        .range(['#dbaa5a','#659ea3']);
    
    
    d3.csv("/dataviz/pages/donut/male_female_satistics.csv")
    .then(function (data) {
       
        update_donut(data,'all')

        const select = document.getElementById("category-filter");
        select.addEventListener("change", function () {
          const selectedCategory = this.value;
          console.log("aaaaaaaaaaaaa ", selectedCategory)
          update_donut(data, selectedCategory);
        });

        
        function handleMouseOver(event, d) {
            var segmentValue = d.value;
            console.log(d.data.gender);

            d3.select(this)
            .style("opacity", 0.5);
    
            g.append("text")
            .attr("class", "value-text")
            .text(segmentValue )
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.5em');

            g.append("text")
            .attr("class", "name-text")
            .text(d.data.gender)
            .attr('text-anchor', 'middle')
            .attr('dy', '.6em');
        }

        function handleMouseOut() {
            d3.select(this)
                .style("opacity", 1);
            g.select(".value-text").remove();
            g.select(".name-text").remove();
        }


       
        function update_donut(data, selected_category){
            data.forEach(function(d){
                d[selected_category] = +d[selected_category];
                console.log(d[selected_category])
            });

            g.selectAll("g").remove();

            var arc = d3.arc()
            .innerRadius(radius - thickness)
            .outerRadius(radius);
                
            var pie = d3.pie()
            .sort(null)
            .value(function(d) { 
                return d[selected_category]; 
            })

            var selectedColumns = ["gender", selected_category];
            data = data.map(function(d) {
                var filteredObj = {};
                selectedColumns.forEach(function(column) {
                  filteredObj[column] = d[column];
                });
                return filteredObj;
              });

            
            
            g.selectAll('path')
            .data(pie(data))
            .enter()
            .append("g")
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d){
                return color(d.data["gender"])
            })
            .on("mouseover",handleMouseOver)
            .on("mouseout",handleMouseOut);

        

           
        }

        var legendItemSize = 12;
        var legendSpacing = 4;
        var xOffset = 0;
        var yOffset = +10;
        var legend = d3
            .select('#legend_donut')
            .append('svg')
            .selectAll('.legendItem')
            .data(classes);

        legend
            .enter()
            .append('rect')
            .attr('class', 'legendItem')
            .attr('width', legendItemSize)
            .attr('height', legendItemSize)
            .style('fill', d => color(d))
            .attr('transform',
                            (d, i) => {
                                var x = xOffset;
                                var y = yOffset + (legendItemSize + legendSpacing) * i;
                                return `translate(${x}, ${y})`;
                            });
            
            //Create legend labels
        legend
            .enter()
            .append('text')
            .attr('x', xOffset + legendItemSize + 5)
            .attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
            .text(d => d); 

            

    });

}
drawDonut();