let margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
let svg = d3
  .selectAll("#svgPlot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

d3.json("../Data/data_netflix.json", function (error, data) {
  if (error) throw error;
  let countryData = data.filter(d => d.clist.includes("Japan"))
  data = countryData
  table(data)
  // Define the x and y scales
  let x = d3.scaleLinear().domain([0, 10]).range([0, width]);
  let ymax;
  let y = d3
    .scaleLinear()
    .domain([0, ymax = d3.max(data, (d) => d["votes"]) + 100000])
    .range([height, 0]);
  let xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  let clip = svg
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);
  function mouseover(){
    d3.select(this).style("fill", "#FB0C0C").attr("stroke", "black").attr("stroke-width", 1.5).transition()
    .duration('100')
    .attr("r", 8)
    .style("opacity", 0.7);
  }
  function mouseout(){
    d3.select(this).style("fill", "black").transition()
    .duration('200')
    .attr("r", 6).style("opacity", 0.5);
  }
  let yAxis = svg.append("g").call(d3.axisLeft(y));;
  let brush = d3
    .brush() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart)

    let idleTimeout;


  // Create the scatter variable: where both the circles and the brush take place
  let scatter = svg.append("g").attr("clip-path", "url(#clip)");
scatter
 .append("g")
   .attr("class", "brush")
   .call(brush);
 // Add circles
 scatter
 .selectAll("circle")
 .data(data)
 .enter()
 .append("circle")
   .attr("cx", function (d) { return x(d["imdb_rating"]); } )
   .attr("cy", function (d) { return y(d["votes"]); } )
   .attr("r", 6)
   .style("opacity", 0.5)
   .attr("pointer-events", "all")
   .on("mouseover", mouseover)
   .on("mouseout", mouseout)

// Add the brushing


  function idled() { idleTimeout = null; }
 
  function updateChart() {
    let s = d3.event.selection;
    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!s) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      x.domain([ 0,10])
      y.domain([0, ymax])
      data = countryData
    } else { 
        data = data.filter(d => {
            xVals =  [s[0][0], s[1][0]].map(x.invert, x)
            yVals = [s[1][1], s[0][1]].map(y.invert, y)
            if(d["imdb_rating"]< xVals[1] && d["imdb_rating"]> xVals[0] && d["votes"]< yVals[1] && d["votes"]> yVals[0])
            return d
        })
        x.domain([s[0][0], s[1][0]].map(x.invert, x));
        y.domain([s[1][1], s[0][1]].map(y.invert, y));
        scatter.select(".brush").call(brush.move, null);
        
     // This remove the grey brush area as soon as the selection has been done
    }
    table(data)
    // Update axis and circle position
    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    yAxis.transition().duration(1000).call(d3.axisLeft(y));
    scatter
      .selectAll("circle")
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d["imdb_rating"]);
      })
      .attr("cy", function (d) {
        return y(d["votes"]);
      })
  }
});
