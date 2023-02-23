function getJSON(path) {
    return fetch(path).then(response => response.json());
}

const width = window.innerWidth
const height = window.innerHeight
let active = d3.select(null);

let tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style("position", "absolute")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("z-index", 1)



const svg = d3.select("body")
                .append("svg")
                .attr("class", "map")
                .attr("width", width)
                .attr("height", height)
                .on("mousemove", function(d) {
                    tooltip
                        .style("left", (d3.event.pageX + 25) + "px")  
                        .style("top", (d3.event.pageY - 25) + "px");
                })
                .on("click", reset)


const zoom = d3.zoom()
  .translateExtent([[0, 0], [width, height]])
  .scaleExtent([1, 8])
  .on("zoom", zoomed);

          
svg.call(zoom)
svg.on("click", reset);

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    g.attr("transform", d3.event.transform); // updated for d3 v4
}

function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);
  
    svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

let alreadyOver = false

const projection = d3.geoMercator().scale(180).translate([width/2, height/2]) //This is a projection that we need to create using d3
const path = d3.geoPath(projection) //This is a geopath that we need to create using d3

//grouping of all the path of the countries that I have in svg
const g = svg.append("g")

//now I need to get the data from the json file, please help me with this

getJSON("../Data/country_to_content.json").then(netflixData => {

    getJSON("../Data/countriesCodesParsed.json").then(countriesData => {

        getJSON("https://unpkg.com/world-atlas@1/world/110m.json").then(data => {


            const mouseOver = function(d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .style("opacity", 1)
                    .style("z-index", 100)
                    .style("stroke", "black")
                    .style("stroke-width", 100)
                let countryName = countriesData[d.id]["name"]
                let countryData = "No data available"

                if(netflixData[countriesData[d.id]["alpha-2"]] != undefined){
                    countryData = netflixData[countriesData[d.id]["alpha-2"]].length + " titles"
                }

                tooltip
                    .style("opacity", 0.8)
                    .style("visibility", "visible")
                    .html(countryName + "<br>" + countryData)
            
                alreadyOver = true
            }
            
            const mouseLeave = function(d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .style("z-index", 0)
                    .style("opacity", .8)
                    .style("stroke", "grey")
                    .style("stroke-width", .7)

                tooltip.style("visibility", "hidden")
            }

            //I need a function that will be called when I click on a country and will zoom in on it, please help me with this
            function clicked(d) {
                if (active.node() === this) return reset();
                active.classed("active", false);
                active = d3.select(this).classed("active", true);
              
                let bounds = path.bounds(d),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
                    translate = [width / 2 - scale * x, height / 2 - scale * y];
              

                svg.transition()
                    .duration(750)
                    .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) ); // updated for d3 v4
              }

            //Need to find min len and max len of the netflixData
            let min = 100000
            let max = 0
            
            for(let country in netflixData){
                if(netflixData[country].length > max){
                    max = netflixData[country].length
                }
                if(netflixData[country].length < min){
                    min = netflixData[country].length
                }
            }

            const domain = [min, max]
            //const labels = ["< 100 M", "100 M - 500 M", "> 500 M"]
            const range = ["#ff0a16","#a00a11", "#850b11"]
            const colorScaler = d3.scaleOrdinal()
                .domain(domain)
                .range(range);

            const countries = topojson.feature(data, data.objects.countries)
            
            g.selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", path) //This is a geopath that we previously created using d3
                .style("fill", function (d) {
                    if(countriesData[d.id] != undefined){
                        if(netflixData[countriesData[d.id]["alpha-2"]] == undefined){
                            return "rgb(211, 211, 211)"
                        } else {
                            return colorScaler(netflixData[countriesData[d.id]["alpha-2"]].length)
                        }
                    }else{
                        return "rgb(211, 211, 211)"
                    }
                    
                })
                .style("z-index", 0)
                .style("opacity", .8)
                .on("click", clicked)
                .on("mouseover", mouseOver )
                .on("mouseleave", mouseLeave )


        })
    })
})


//We need to create a projection from the , different projections are available in d3, we will use geoMercator, because it best fits our needs
