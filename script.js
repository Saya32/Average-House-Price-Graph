// set the dimensions and margins of the graph
var margin = {top: 10, right: 200, bottom: 50, left: 90},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv("https://raw.githubusercontent.com/Saya32/Average-House-Price-Graph/main/updated_data.csv", function(data) {

    // List of regions (extracted from the data)
    var allRegions = Object.keys(data[0]).slice(1); // Excluding the 'year' column so that only regions and countries are selected

    // Add the options to the button
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(allRegions)
        .enter()
        .append('option')
        .text(function(d) { return d; })
        .attr("value", function(d) { return d; });

    // A color scale: one color for each region
    var myColor = d3.scaleOrdinal()
        .domain(allRegions)
        .range(d3.schemeSet2);

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.year; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(12));
 svg.append("text")
    .attr("x", width/2)
    .attr("y", height + 40)
    .style("text-anchor", "middle")
    .text("Year");
  

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d3.max(allRegions, function(region) { return +d[region]; }); })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Average all dwelling Price");
 
    // Initialising line with first region of the list
    var line = svg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(+d[allRegions[0]]); })
        )
        .attr("stroke", function() { return myColor(allRegions[0]); })
        .style("stroke-width", 4)
        .style("fill", "none").on('mouseover', mouseover).on('mousemove', mousemove).on('mouseout', mouseout);
  
  // This allows to find the closest X index of the mouse:
var bisect = d3.bisector(function(d) { return d.year; }).left;
var selectedRegion = allRegions[0];
// Create the circle that travels along the curve of chart
var focus = svg
  .append('g')
  .append('circle')
    .style("fill", "blue")
    .attr("stroke", "black")
    .attr('r', 4)
    .style("opacity", 0);

// Create the text that travels along the curve of chart
var focusText = svg
  .append('g')
  .append('text')
    .style("opacity", 0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle");
  
    
    // Function to handle mouseover event
function mouseover() {
  focus.style("opacity", 6);
  focusText.style("opacity", 6);
}

function mousemove() {
  var x0 = x.invert(d3.mouse(this)[0]);
  var i = bisect(data, x0, 1),
      selectedData = data[i]
  focus
    .attr("cx", x(selectedData.year))
    .attr("cy", y(+selectedData[selectedRegion]))

  focusText
    .html(`Year: ${selectedData.year} - Value: ${selectedData[selectedRegion]}`)
    .attr("x", x(selectedData.year))
    .attr("y", y(+selectedData[selectedRegion]))
}

// Function to handle mouseout event
function mouseout() {
  focus.style("opacity", 0);
  focusText.style("opacity", 0);
}
  
    // Function to update the chart
    function update(selectedRegion) {
        // Update the line with selected region's data
        line
            .datum(data)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(+d[selectedRegion]); })
            )
            .attr("stroke", function() { return myColor(selectedRegion); });
    }
  
    // When the button is changed, update the chart with selected region
    d3.select("#selectButton").on("change", function() {
        selectedRegion = d3.select(this).property("value");
        update(selectedRegion);
    });
  
});