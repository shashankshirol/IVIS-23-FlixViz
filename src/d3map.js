const tooltip = d3.select("#tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("z-index", 1);

alreadyOver = false

let mouseOver = function(d) {
    if(!alreadyOver){
        d3.select(this)
        .transition()
        .duration(250)
        .style("opacity", 1)
        .style("stroke", "black")
    }


    d.total = data.get(d.id) || 0;

    tooltip
        .style("opacity", 0.8)
        .style("visibility", "visible")
        .html(d.id + ": " + d3.format(",.2r")(d.total))
        .style("left", (d3.event.pageX + 25) + "px")  
        .style("top", (d3.event.pageY - 25) + "px");

    alreadyOver = true
}

let mouseLeave = function(d) {
    alreadyOver = false
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", .7)
        .style("stroke", "none")

    tooltip
        .style("visibility", "hidden")
        .style("opacity", 0)
        .style("left", 0 + "px")  
        .style("top", 0 + "px");
}


var margin = {top: 20, right: 10, bottom: 40, left: 100}


var svg = d3.select("svg")
    .style("z-index", 0)
    .style("height", "100%")
    .append("g")
    //.attr("transform","translate(" + margin.left + "," + margin.top + ")");

var width = 1920 - margin.left - margin.right
var height = 1080 - margin.top - margin.bottom

var projection = d3.geoMercator()
    .scale(70)
    .center([0,20])
    .translate([width / 2 - margin.left, height / 2]);

var domain = [100000000, 500000000]
var labels = ["< 100 M", "100 M - 500 M", "> 500 M"]
var range = ["#E50914","#CC0812", "#B20710"]
var colorScale = d3.scaleThreshold()
    .domain(domain)
    .range(range);

var promises = []
var data = d3.map();

promises.push(d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"))

promises.push(
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv",
    function(d) { 
        data.set(d.code, +d.pop); 
    })
)

myDataPromises = Promise.all(promises).then(function(my_data) {    
    var topo = my_data[0]
     // do some stuff


svg.append("g")
     .selectAll("path")
     .data(topo.features)
     .enter()
     .append("path")
     .attr("class", "topo")
    .attr("d", d3.geoPath().projection(projection))
       // set the color of each country
    .attr("fill", function (d) {
         d.total = data.get(d.id) || 0;
         return colorScale(d.total);
       })
    .style("opacity", .7)
    .on("mouseover", mouseOver )
    .on("mouseleave", mouseLeave )

var legend_x = width - margin.left
var legend_y = height - 30
    
svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + legend_x + "," + legend_y+")");

var legend = d3.legendColor()
    .labels(labels)
    .title("Population")
    .scale(colorScale)
   
   
svg.select(".legend")
   .call(legend);



svg.append("g")
  .style("opacity", 1)
  .attr("id", "annotation")
  .call(makeAnnotations)

});