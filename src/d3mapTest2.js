async function getJSON(path) {
    return await fetch(path).then(response => response.json());
}

let currentCountry = null
let wasDivExpanded = false
const width = window.innerWidth
const height = window.innerHeight
//make an array of colors out of colorOrdinalScale for the map, but colors should be strings, please help


const sideDiv  = d3.select("body")
        .append("div")
        .attr("id", "clickData")
        .style("position", "absolute")
        .style("top", "0px")
        .style("right", "0px")
        .style("width", "45%")
        .style("height", "100%")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "center")
        .style("background-color", "white")
        .style("z-index", 1000)
        .style("opacity", 0)
        .style("pointer-events", "none")
        .html(`<h1> Click on a country to see its content availability </h1> 
                <div class="buttonDiv">
                    <button type="button" id="expandCollapeDiv">Go to Details</button>
                </div>`)
        .style("text-align", "center")


let colorOrdinalScale = [
    "#295026",
    "#2A5428",
    "#2B582A",
    "#2C5C2D",
    "#2F6030",
    "#316433",
    "#336837",
    "#356C3A",
    "#38703E",
    "#3A7442",
    "#3C7746",
    "#3E7B4A",
    "#417F4E",
    "#438352",
    "#458756",
    "#488B5A",
    "#4A8F5F",
    "#4C9263",
    "#4F9668",
    "#519A6C",
    "#589F6E",
    "#5FA370",
    "#66A873",
    "#6DAC76",
    "#74B179",
    "#7BB57C",
    "#85BA82",
    "#8FBE8A",
    "#99C291",
    "#A2C798",
    "#ABCB9F",
    "#B4CFA7",
    "#BDD4AE",
    "#C5D8B5",
    "#CDDCBD",
    "#D4E0C4",
    "#DBE4CC",
    "#E2E8D3",
    "#E8ECDB"
]


colorOrdinalScale = colorOrdinalScale.reverse()
tooltipVisibilityStatusComparedToClik = true


function generateTooltip(){
    return d3.select("body")
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
}

const tooltip = generateTooltip()

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

function generateScatterChartInTooltip(data,x,y) {
    // Step 1
        
        let margin = {top: 10, right: 30, bottom: 30, left: 60}
        let scatterWidth = 200 - margin.left - margin.right
        let scatterHeight = 150 - margin.top - margin.bottom

        // Step 3
        let scatterSvg = tooltip.append("svg")
            .attr("width", scatterWidth + margin.left + margin.right)
            .attr("height", scatterHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

        // Step 4 
        let xScale = d3.scaleLinear().domain([2000, 3000]).range([0, scatterWidth]),
            yScale = d3.scaleLinear().domain([3000, 6500]).range([scatterHeight, 0]);
            
        //Add x axis
        scatterSvg.append("g")
            .attr("transform", "translate(0," + scatterHeight + ")")
            .call(d3.axisBottom(xScale));;

        //Add y axis
        scatterSvg.append("g")
            .call(d3.axisLeft(yScale));

        // Step 5
        // Title
        scatterSvg.append('text')
        .attr('x', 100/2 + 100)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 20)
        
        
        
        scatterSvg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return xScale(d[0]); } )
          .attr("cy", function (d) { return yScale(d[1]); } )
          .attr("r", function(d){
                if(d[1] == x && d[0] == y){
                    return 6
                }
                return 3
          })
          .style("z-index", function(d){
                if(d[1] == x && d[0] == y){
                    return -1
                }
                return 0
          })
          .style("fill", function(d){
                if(d[1] == x && d[0] == y){
                    return "#FF0000"
                }
                return "#69b3a2"
          })
          .style()
        
        
}

function unselectCountry() {
    if(currentCountry != null){
        currentCountry
        .style("z-index", 0)
        .style("opacity", .8)
        .style("stroke", "grey")
        .style("stroke-width", .7)
    }
    sideDiv.transition().duration(500).style("opacity", 0).style("width", "0%").style("pointer-events", "none")
    currentCountry = null
    tooltipVisibilityStatusComparedToClik = true
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

    unselectCountry()
}

let alreadyOver = false

const projection = d3.geoMercator().scale(180).translate([width/2, height/2]) //This is a projection that we need to create using d3
const path = d3.geoPath(projection) //This is a geopath that we need to create using d3

//grouping of all the path of the countries that I have in svg
const g = svg.append("g")

//now I need to get the data from the json file, please help me with this

getJSON("../EDA/countries.json").then(countriesToOverviewInfo => {
    let listOfDimensionsMoviesVsSeries = []
    for(let entry in countriesToOverviewInfo){
        listOfDimensionsMoviesVsSeries.push([countriesToOverviewInfo[entry]["tseries"], countriesToOverviewInfo[entry]["tmovs"]])
    }
    getJSON("../Data/country_to_content.json").then(countryToContentList => {
        getJSON("../Data/countriesCodesParsed.json").then(countriesData => {
            getJSON("../Data/code_to_movie_data.json").then(fromCodeToContent => {
                getJSON("https://unpkg.com/world-atlas@1/world/110m.json").then(data => {

                    d3.select("#expandCollapeDiv").on("click", () => {
                        if(!wasDivExpanded){
                            d3.select("#expandCollapeDiv").text("Click to collapse")
                            sideDiv.transition().duration(500).style("width","100%").style("opacity", 1)
                            wasDivExpanded = true
                        }else{
                            d3.select("#expandCollapeDiv").text("Click to expand")
                            sideDiv.transition().duration(500).style("width","45%").style("opacity", 0.9)
                            wasDivExpanded = false
                        }

                        
                    })

                    const mouseOver = function(d) {

                        if(!alreadyOver){
                            let countryCodeName = countriesData[d.id]["alpha-2"]
                            //I now need to iterate over every single movie and series in the netflix data of this country and check how many are series and how many are movies
                            if(countryCodeName in countryToContentList){
                                new Promise((resolve, reject) => { 
                                    let movies = 0
                                    let series = 0
        
                                    for(let i=0; i < countryToContentList[countryCodeName].length; i++){
                                        if(fromCodeToContent[countryToContentList[countryCodeName][i]]["vtype"] == "movie"){
                                            movies++
                                        }else{
                                            series++
                                        }
                                    }
                                    resolve([{"type": "movies", "value": movies}, {"type": "series", "value": series}])
                                }).then((contentInfo) => {
                                    let x = countriesToOverviewInfo[countryCodeName]["tmovs"]
                                    let y = countriesToOverviewInfo[countryCodeName]["tseries"]
                                    console.log(x,y)
                                    generateScatterChartInTooltip(listOfDimensionsMoviesVsSeries,x,y)
                                })
                            }else{
                                tooltip.selectAll("svg").remove()
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

                        if(countryToContentList[countriesData[d.id]["alpha-2"]] != undefined){
                            countryData = countryToContentList[countriesData[d.id]["alpha-2"]].length + " total titles"
                        }

                        tooltip.transition().duration(500)
                            .style("opacity", 0.8)
                            .style("visibility", tooltipVisibilityStatusComparedToClik ? "visible" : "hidden")
    
                        d3.select("#nation").text(countryName).style("font-size", "18px").style("font-weight", "bold")
                        d3.select("#totalTitles").text(countryData)
                    
                        alreadyOver = true
                    }
                    
                    const mouseLeave = function(d) {
                        tooltip.selectAll("svg").remove()
                        if(currentCountry == null || d3.select(this).node() != currentCountry.node() ){
                            d3.select(this)
                            .transition()
                            .duration(150)
                            .style("opacity", .8)
                            .style("stroke", "grey")
                            .style("stroke-width", .7)
                        }

                        tooltip.transition().duration(500).style("visibility", "hidden")
                        alreadyOver = false
                    }


                    //I need a function that will be called when I click on a country and will zoom in on it, please help me with this
                    function clicked(d) {
                        if(countryToContentList[countriesData[d.id]["alpha-2"]] != undefined){
                            if(tooltipVisibilityStatusComparedToClik){
                                tooltipVisibilityStatusComparedToClik = false
                                //I now need to do an animation for the tooltio, it has to move to the right and have the same height as the side div
                                tooltip.transition().duration(500).style("visibility", tooltipVisibilityStatusComparedToClik ? "visible" : "hidden")
                            }

                            const [[x0, y0], [x1, y1]] = path.bounds(d);
                            d3.event.stopPropagation();
                            svg.transition().duration(750).call(
                                zoom.transform,
                                d3.zoomIdentity
                                    .translate(width / 4, height / 2)
                                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                                d3.mouse(d3.event.target, svg.node())
                            );
                            //I want to edit the style of the country that I clicked on
                            if(currentCountry != null){
                                currentCountry
                                    .style("opacity", 0.8)
                                    .style("stroke", "grey")
                                    .style("stroke-width", 0.7)
                            }
        
                            d3.select(this)
                                .raise()
                                .style("stroke", "black")
                                .style("stroke-width", 2)
        
                            currentCountry = d3.select(this)
        
                            sideDiv.transition().duration(750).style("width", "45%").style("opacity", 0.9).style("pointer-events", "auto")
                        }


                    }

                    //Need to find min len and max len of the netflixData
                    let min = 100000
                    let max = 0

                    for(let country in countryToContentList){
                        if(countryToContentList[country].length > max){
                            max = countryToContentList[country].length
                        }
                        if(countryToContentList[country].length < min){
                            min = countryToContentList[country].length
                        }
                    }
                    
                    const domain = [min, max]
                    const colorScaler = d3.scaleOrdinal()
                        .domain(domain)
                        .range(colorOrdinalScale);

                    const countries = topojson.feature(data, data.objects.countries)
                    
                    g.selectAll("path")
                        .data(countries.features)
                        .enter()
                        .append("path")
                        .attr("class", "country")
                        .attr("d", path) //This is a geopath that we previously created using d3
                        .style("fill", function (d) {
                            if(countriesData[d.id] != undefined){
                                if(countryToContentList[countriesData[d.id]["alpha-2"]] == undefined){
                                    return "rgb(211, 211, 211)"
                                } else {
                                    return colorScaler(countryToContentList[countriesData[d.id]["alpha-2"]].length)
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
                    
                    

                    //I need to add a div in front of the map that will be static on the right side of the screen, partially covering the map, please help me with this
                    //it is not a tooltip, it is a div that will contain a bar chart
                        
                })
            })
        })
    })
})
