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

 d3.json("../Data/data_netflix.json")
  .then(function(data) {
    const country = "India"
    const selections = {
      "year": ["year",1940, 2023, "Year"],
      "imdb_rating": ["imdb_rating",-0.1,10, "Imdb Rating"],
      "votes": ["votes",0, 3000000, "Votes"]
    } 
    let currX = selections.year
    let currY = selections.imdb_rating

    
    let orig_data = data;
    data = data.filter(d => d.clist.includes(country));
    fillTopTitles(data, country)


  // Define the x and y scales 
  let x = d3.scaleLinear().domain([currX[1], currX[2]]).range([0, width]);
  let y = d3
    .scaleLinear()
    .domain([currY[1], currY[2]])
    .range([height, 0]);
  let xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));



    svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+20)
    .attr("x", -margin.top)
    .text(currY[3])



    svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20)
    .text(currX[3])

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
    d3.select(this).style("fill", "black").attr("stroke", "white").attr("stroke-width", 1.5).transition()
    .duration('100')
    .attr("r", 8)
    .style("opacity", 0.7);
  }
  function mouseout(){
    d3.select(this).style("fill", "red").attr("stroke-width", 0).transition()
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
   .attr("cx", function (d) { return x(d[currX[0]]); } )
   .attr("cy", function (d) { return y(d[currY[0]]); } )
   .attr("r", 6)
   .style("opacity", 0.5)
   .style("fill", "#FB0C0C")
   .attr("pointer-events", "all")
   .on("mouseover", mouseover)
   .on("mouseout", mouseout)

  let idleTimeout;

  function idled() { idleTimeout = null; }
 
  function updateChart() {
    let s = d3.event.selection;
    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!s) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      x.domain([currX[1],currX[2]])
      y.domain([currY[1], currY[2]])
      data = orig_data
    } else {
        data = data.filter(d => {
            let xVals =  [s[0][0], s[1][0]].map(x.invert, x)
            let yVals = [s[1][1], s[0][1]].map(y.invert, y)
            if(d[currX[0]]< xVals[1] && d[currX[0]]> xVals[0] && d[currY[0]]< yVals[1] && d[currY[0]]> yVals[0])
            return d
        })
      
        x.domain([s[0][0], s[1][0]].map(x.invert, x));
        y.domain([s[1][1], s[0][1]].map(y.invert, y));
        scatter.select(".brush").call(brush.move, null);
     // This remove the grey brush area as soon as the selection has been done
    }
    fillTopTitles(data, country)
    // Update axis and circle position
    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    yAxis.transition().duration(1000).call(d3.axisLeft(y));
    scatter
      .selectAll("circle")
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return x(d[currX[0]]);
      })
      .attr("cy", function (d) {
        return y(d[currY[0]]);
      })
  }
})
.catch(function(error) {
  console.error(error)
});
