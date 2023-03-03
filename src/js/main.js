async function getJSON(path) {
    return await fetch(path).then(response => response.json());
}

let currentCountry = null
let wasDivExpanded = false
let hasAllZoomingEnded = false
let tooltipVisibilityStatusComparedToClik = true
const tooltip = generateTooltip()
let alreadyOver = false
//grouping of all the path of the countries that I have in svg
const svg = generateSvg()
const g = svg.append("g")

const sideDiv = setupSideDiv() 

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

//now I need to get the data from the json file, please help me with this
let countryCodeList = []
let listOfDimensionsMoviesVsSeries = []
$.getJSON("../../Data/countries.json", function (data) { 
    $.each(data, function (key, val) {
        countryCodeList.push(key)
        listOfDimensionsMoviesVsSeries.push([val["tseries"], val["tmovs"]])
    });
});

getJSON("../../Data/neighbouringCountries.json").then(neighbouringCountriesData => {
    getJSON("../../Data/countries.json").then(countriesToOverviewInfo => {
        getJSON("../../Data/countriesCodesParsed.json").then(countriesData => {
            getJSON("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(data => {
                const countries = topojson.feature(data, data.objects.countries)
                const projection = d3
                                    .geoEquirectangular()
                                    .center([0, 0]) // set centre
                                    .scale([width/(2*Math.PI)]) // scale to fit group width
                                    .translate([width/2,height/2]) // ensure centred in group
                                ;
                const path = d3.geoPath().projection(projection) //This is a geopath that we need to create using d3

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

                function mouseOver(d) {
                    if(!alreadyOver){
                        let countryCodeName = countriesData[d.id]["alpha-2"]

                        if(countryCodeList.includes(countryCodeName)){
                            let x = countriesToOverviewInfo[countryCodeName]["tmovs"]
                            let y = countriesToOverviewInfo[countryCodeName]["tseries"]
                            generateScatterChartInTooltip(listOfDimensionsMoviesVsSeries,x,y) 
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
                    if (countryName.includes("United Kingdom")){
                        countryName = "United Kingdom" //otherwise it will be United Kingdom of Great Britain and Northern Ireland and it will be too long
                    }
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
                
                function mouseLeave(d) {
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
                function clicked(d) {
                    hasAllZoomingEnded = false
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
                        )
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
                        
                        sideDiv.transition().duration(750).style("width", "45%").style("opacity", 0.9).style("pointer-events", "auto");
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
})