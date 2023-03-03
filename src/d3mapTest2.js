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
let tooltipVisibilityStatusComparedToClik = true


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
                .style("pointer-events", "none")
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

function tooltipWouldBeOutOfBoundBasedOnMousePos(element){
    let rect = element.getBoundingClientRect();
    let position_exiting = []
    if(d3.event.pageY < 30){
        position_exiting.push("top")
    }
    if(d3.event.pageX < 0){
        position_exiting.push("left")
    }
    if(d3.event.pageX + (rect.width-25) > window.innerWidth){
        position_exiting.push("right")
    }
    if(d3.event.pageY + (rect.height-25) > window.innerHeight){
        position_exiting.push("bottom")
    }
    return position_exiting
}

function moveTooltip(d) {

    let overflowingPositions = tooltipWouldBeOutOfBoundBasedOnMousePos(tooltip.node())

    tooltip.style("top",function(){
        if(overflowingPositions.includes("top")){
            return (tooltip.node().getBoundingClientRect().height+10)+"px";
        }else if(overflowingPositions.includes("bottom")){
            return window.innerHeight-(tooltip.node().getBoundingClientRect().height-10)+"px";
        } else{
            return (d3.event.pageY - 25) + "px"
        }
    })
    .style("left", function(d){
        if(overflowingPositions.includes("left")){
            return (tooltip.node().getBoundingClientRect().width+10)+"px";
        }else if(overflowingPositions.includes("right")){
            return window.innerWidth-(tooltip.node().getBoundingClientRect().width+10)+"px";
        } else{
            return (d3.event.pageX + 10) + "px"
        }
        
    })  
}

const svg = d3.select("body")
                .append("div")
                .attr("class", "map")
                .append("svg")
                .style("shape-rendering", "optimizeSpeed")
                .style("color-rendering", "optimizeSpeed")
                .attr("width", width)
                .attr("height", height)
                .on("mousemove", moveTooltip)
                .on("dragstart", moveTooltip)
                .on("click", reset)


const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", zoomed);

          
svg.call(zoom)

function generateScatterChartInTooltip(data,x,y) {
    // Step 1
        
        let margin = {top: 10, right: 30, bottom: 30, left: 60}
        let scatterWidth = 250 - margin.left - margin.right
        let scatterHeight = 150 - margin.top - margin.bottom

        // Step 3
        let scatterSvg = tooltip.append("svg")
            .attr("width", scatterWidth + margin.left + margin.right)
            .attr("height", scatterHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
        scatterSvg
              .append("rect")
                .attr("x",0)
                .attr("y",0)
                .attr("height", scatterHeight)
                .attr("width", scatterWidth)
                .style("fill", "EBEBEB")
        // Step 4 
        let xScale = d3.scaleLinear().domain([2000, 3000]).range([0, scatterWidth]),
            yScale = d3.scaleLinear().domain([3000, 6500]).range([scatterHeight, 0]);
            
        //Add x axis
        scatterSvg.append("g")
            .attr("transform", "translate(0," + scatterHeight + ")")
            .call(d3.axisBottom(xScale).tickSize(-scatterHeight*1.3).ticks(5))
            .select(".domain")
            .remove();

        //Add y axis
        scatterSvg.append("g")
            .call(d3.axisLeft(yScale).tickSize(-scatterWidth*1.3).ticks(7))
            .select(".domain").remove();

        scatterSvg.selectAll(".tick line").attr("stroke", "white")
        //X axis label:
        scatterSvg.append("text")
            .attr("text-anchor", "end")
            .attr("x", scatterWidth/2 + margin.left)
            .attr("y", scatterHeight + margin.top + 20)
            .text("Series");

        // Y axis label:
        scatterSvg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top - scatterHeight/2 + 20)
            .text("Movies")
        
        
        
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
          .filter(function(d){
                if(d[1] == x && d[0] == y){
                    return true
                }
                return false
          }).raise()
        
        
}

function unselectCountry() {
    if(currentCountry != null){
        currentCountry
        .style("z-index", 0)
        .style("opacity", .8)
        .style("stroke", "grey")
        .style("stroke-width", .5)
    }
    sideDiv.transition().duration(500).style("opacity", 0).style("width", "0%").style("pointer-events", "none")
    currentCountry = null
    tooltipVisibilityStatusComparedToClik = true
}


function zoomed() {
    const { transform } = d3.event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);

}

function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

function reset() {

    svg.transition()
        .duration(500)
        .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4

    unselectCountry()
}

let alreadyOver = false

//grouping of all the path of the countries that I have in svg
const g = svg.append("g")

//now I need to get the data from the json file, please help me with this
let countryCodeList = []
let listOfDimensionsMoviesVsSeries = []
$.getJSON("../Data/countries.json", function (data) { 
    $.each(data, function (key, val) {
        countryCodeList.push(key)
        listOfDimensionsMoviesVsSeries.push([val["tseries"], val["tmovs"]])
    });
});


getJSON("../Data/countries.json").then(countriesToOverviewInfo => {
    getJSON("../Data/countriesCodesParsed.json").then(countriesData => {
        getJSON("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(data => {
            const countries = topojson.feature(data, data.objects.countries)
            const projection = d3
                                .geoEquirectangular()
                                .center([0, 0]) // set centre
                                .scale([width/(2*Math.PI)]) // scale to fit group width
                                .translate([width/2,height/2]) // ensure centred in group
                            ;
            window.path = d3.geoPath().projection(projection) //This is a geopath that we need to create using d3

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


                    if(countryCodeList.includes(countryCodeName)){
                        new Promise((resolve, reject) => {
                            let x = countriesToOverviewInfo[countryCodeName]["tmovs"]
                            let y = countriesToOverviewInfo[countryCodeName]["tseries"]
                            generateScatterChartInTooltip(listOfDimensionsMoviesVsSeries,x,y)
                        })
                    } else {
                        tooltip.selectAll("svg").remove()
                    }
                }


                d3.select(this)
                    .raise()
                    .transition()
                    .duration(150)
                    .style("opacity", 1)
                    .style("z-index", 100)
                    .style("stroke", "#FFFDD0")
                    .style("stroke-width", 0.7)
                    
                let countryName = countriesData[d.id]["name"]
                let country_total_tiles = "No data available"

                if(countryCodeList.includes(countriesData[d.id]["alpha-2"])){
                    country_total_tiles = countriesToOverviewInfo[countriesData[d.id]["alpha-2"]]["tvids"] + " total titles"
                }

                tooltip.transition().duration(500)
                    .style("opacity", 0.8)
                    .style("visibility", tooltipVisibilityStatusComparedToClik ? "visible" : "hidden")

                d3.select("#nation").text(countryName).style("font-size", "18px").style("font-weight", "bold")
                d3.select("#totalTitles").text(country_total_tiles)
            
                alreadyOver = true
            }
            
            const mouseLeave = function(d) {
                tooltip.selectAll("svg").remove()
                if(currentCountry == null || d3.select(this).node() != currentCountry.node() ){

                    if(d3.select(this) != currentCountry){
                        d3.select(this).lower()
                    }
                    d3.select(this)
                    .lower()
                    .transition()
                    .duration(150)
                    .style("opacity", .8)
                    .style("stroke", "grey")
                    .style("stroke-width", .5)
                }

                tooltip.transition().duration(500).style("visibility", "hidden")
                alreadyOver = false
            }

            //I need a function that will be called when I click on a country and will zoom in on it, please help me with this
            window.clicked = function clicked(d) {
                if(countryCodeList.includes(countriesData[d.id]["alpha-2"])){
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
                            .style("stroke-width", .5)
                    }

                    d3.select(this)
                        .raise()
                        .style("stroke", "#FFFDD0")
                        .style("stroke-width", 2)

                    currentCountry = d3.select(this)
                    
                    sideDiv.transition().duration(750).style("width", "45%").style("opacity", 0.9).style("pointer-events", "auto")

                }


            }
            const allValuesNumberContent = []
            for (let i = 0; i < countryCodeList.length; i++){
                allValuesNumberContent.push(countriesToOverviewInfo[countryCodeList[i]]["tvids"])
            }
            allValuesNumberContent.sort()
            const range = d3.quantize(d3.interpolateHcl("#FFCCCB", "#E50914"), 37)

            const colorScaler = d3.scaleOrdinal()
                .domain(allValuesNumberContent)
                .range(range);
            
            
            
            g.selectAll("path")
                .data(countries.features)
                .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", path) //This is a geopath that we previously created using d3
                .style("fill", function (d) {
                    if(countriesData[d.id] != undefined && countryCodeList.includes(countriesData[d.id]["alpha-2"])){
                            return colorScaler(countriesToOverviewInfo[countriesData[d.id]["alpha-2"]]["tvids"])
                    }
                    return "rgb(211, 211, 211)"
                    
                })
                .style("z-index", 0)
                .style("opacity", .8)
                .style("stroke", "grey")
                .style("stroke-width", .5)
                .on("click", clicked)
                .on("mouseover", mouseOver )
                .on("mouseleave", mouseLeave )
                
        })
    })
})
