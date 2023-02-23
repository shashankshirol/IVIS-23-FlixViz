function getJSON(path) {
    return fetch(path).then(response => response.json());
}

let currentCountry = null

const width = window.innerWidth
const height = window.innerHeight


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
                .html(
                    `<div id="tooltipTitle"><p>Content availability</p></div>
                    <div id='nation'></div>
                    <div id='tipDiv'></div>
                    <div id='totalTitles'></div>`
                    );

function moveTooltip(d) {
    tooltip
        .style("left", (d3.event.pageX + 25) + "px")  
        .style("top", (d3.event.pageY - 25) + "px");
}

const svg = d3.select("body")
                .append("svg")
                .attr("class", "map")
                .attr("width", width)
                .attr("height", height)
                .on("mousemove", moveTooltip)
                .on("dragstart", moveTooltip)
                .on("click", reset)


const zoom = d3.zoom()
  .translateExtent([[0, 0], [width, height]])
  .scaleExtent([1, 8])
  .on("zoom", zoomed);

          
svg.call(zoom)
svg.on("click", reset);

function generatePieChartInTooltip(data) {
    let width = 100
    let height = 100
    let margin = 2
    let radius = Math.min(width,height)/2 - margin

    let color = d3.scaleOrdinal()
    .domain(data)
    .range(["#E50914", "#FF9900"])

    let pie = d3.pie()
        .value(function(d) {return d.value; })

    let arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

    let data_ready = pie(d3.entries(data))

    let tipSVG = d3.select("#tipDiv")
        .append("svg")
        .attr("width", 100)
        .attr("height", height);

    tipSVG.append("path")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
        .selectAll("path")
        .data(data_ready)
        .enter()
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", function(d,i){
            return color(i)
        })

    tooltip.select("svg")
        .data(data_ready)
        .enter()
        .append("text")
        .text(d => d.data.key + ": " + d.data.value)
        .attr("transform", d => "translate(" + arcGenerator.centroid(d) + ")")
        .style("text-anchor", "middle")
         .style("font-size", 8)

    }

function zoomed() {
    const {transform} = d3.event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
}

function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

function reset() {
   
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
        getJSON("../Data/code_to_movie_data.json").then(fromCodeToContent => {
            getJSON("https://unpkg.com/world-atlas@1/world/110m.json").then(data => {


                const mouseOver = function(d) {

                    if(!alreadyOver){
                        let countryCodeName = countriesData[d.id]["alpha-2"]
                        //I now need to iterate over every single movie and series in the netflix data of this country and check how many are series and how many are movies
                        if(countryCodeName in netflixData){
                            new Promise((resolve, reject) => { 
                                let movies = 0
                                let series = 0
    
                                for(let i=0; i < netflixData[countryCodeName].length; i++){
                                    if(fromCodeToContent[netflixData[countryCodeName][i]]["vtype"] == "movie"){
                                        movies++
                                    }else{
                                        series++
                                    }
                                }
                                resolve({"movies": movies, "series": series})
                            }).then((contentInfo) => {
                                //generatePieChartInTooltip(contentInfo)
                            })
                        }
                    }

                    d3.select(this)
                        .transition()
                        .duration(150)
                        .style("opacity", 1)
                        .style("z-index", 100)
                        .style("stroke", "black")
                        .style("stroke-width", 1.5)
                    let countryName = countriesData[d.id]["name"]
                    let countryData = "No data available"

                    if(netflixData[countriesData[d.id]["alpha-2"]] != undefined){
                        countryData = netflixData[countriesData[d.id]["alpha-2"]].length + " total titles"
                    }

                    tooltip
                        .style("opacity", 0.8)
                        .style("visibility", "visible")
                        
                    d3.select("#nation").text(countryName).style("font-size", "18px").style("font-weight", "bold")
                    d3.select("#totalTitles").text(countryData)
                
                    alreadyOver = true
                }
                
                const mouseLeave = function(d) {
                    if(currentCountry == null || d3.select(this).node() != currentCountry.node() ){
                        d3.select(this)
                        .transition()
                        .duration(150)
                        .style("z-index", 0)
                        .style("opacity", .8)
                        .style("stroke", "grey")
                        .style("stroke-width", .7)
                    }

                    tooltip.style("visibility", "hidden")
                    alreadyOver = false
                }

                //I need a function that will be called when I click on a country and will zoom in on it, please help me with this
                function clicked(d) {
                    
                    const [[x0, y0], [x1, y1]] = path.bounds(d);
                    d3.event.stopPropagation();
                    svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                    d3.mouse(d3.event.target, svg.node())
                    );
                    //I want to edit the style of the country that I clicked on
                    if(currentCountry != null){
                        currentCountry
                            .style("opacity", .8)
                            .style("stroke", "grey")
                            .style("stroke-width", .7)
                    }

                    d3.select(this)
                        .style("stroke", "black")
                        .style("stroke-width", 2)

                    currentCountry = d3.select(this)
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
                    .style("stroke", "grey")
                    .style("stroke-width", .7)
                    .on("click", clicked)
                    .on("mouseover", mouseOver )
                    .on("mouseleave", mouseLeave )

            })
        })
    })
})
