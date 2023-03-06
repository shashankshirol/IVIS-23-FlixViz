function highlightCountry(passedCountry) {
    passedCountry
        .raise()
        .style("stroke", "#FFFDD0")
        .style("stroke-width", 2)
}

function unhighlightCountry(passedCountry){
    passedCountry
        .lower()
        .style("opacity", .8)
        .style("stroke", "grey")
        .style("stroke-width", .5)
}

function unselectCountry(passedCountry) {
    if(passedCountry != null){
        unhighlightCountry(passedCountry)
    }
    sideDiv.transition().duration(500).style("opacity", 0).style("width", "0%").style("pointer-events", "none")
    currentCountry = null
    tooltipVisibilityStatusComparedToClik = true
}

function main_handler(neighbouringCountriesData, countriesToOverviewInfo, countriesData, data){
    const countries = topojson.feature(data, data.objects.countries)
    const projection = d3
                        .geoNaturalEarth1()
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

    function mouseOver(d) {

        if(!alreadyOver){
            let countryCodeName = countriesData[d.id]["alpha-2"]

            if(countryCodeList.includes(countryCodeName)){
                let x = countriesToOverviewInfo[countryCodeName]["tmovs"]
                let y = countriesToOverviewInfo[countryCodeName]["tseries"]
                generateScatterChartInElement(listOfDimensionsMoviesVsSeries,x,y, tooltip) 
            } else {
                tooltip.selectAll("svg").remove()
            }
        }

        if(currentCountry == undefined || 
                d3.select(this).node() != currentCountry.node()){
            d3.select(this)
                .raise()
                .style("opacity", 1)
                .style("z-index", 100)
                .style("stroke", "#FFFDD0")
                .style("stroke-width", 0.7)
        }
        let countryName = countriesData[d.id]["name"]
        if (countryName.includes("United Kingdom")){
            countryName = "United Kingdom" //otherwise it will be United Kingdom of Great Britain and Northern Ireland and it will be too long
        }
        let country_total_tiles = "No data available"

        if(countryCodeList.includes(countriesData[d.id]["alpha-2"])){
            country_total_tiles = countriesToOverviewInfo[countriesData[d.id]["alpha-2"]]["tvids"] + " total titles"
        }
        tooltip
            .transition()
            .duration(500)
            .style("opacity", 0.8)
            .style("visibility", tooltipVisibilityStatusComparedToClik ? "visible" : "hidden")

        d3.select("#nation").text(countryName).style("font-size", "18px").style("font-weight", "bold")
        d3.select("#totalTitles").text(country_total_tiles)
    
        alreadyOver = true
    }
    
    function mouseLeave(d) {
        tooltip.selectAll("svg").remove()
        if(currentCountry == null || d3.select(this).node() != currentCountry.node()){

            if(d3.select(this) != currentCountry){
                d3.select(this).lower()
            }
            d3.select(this)
                .lower()
                .style("opacity", .8)
                .style("stroke", "grey")
                .style("stroke-width", .5)
        }
        tooltip.transition().duration(500).style("visibility", "hidden")
        alreadyOver = false
    }

    //I need a function that will be called when I click on a country and will zoom in on it, please help me with this
    function clicked(d) {

        let clickedCountryCode = countriesData[d.id]["alpha-2"]
        if(countryCodeList.includes(clickedCountryCode)){
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
                unhighlightCountry(currentCountry)
            }

            highlightCountry(d3.select(this))
            
            currentCountry = d3.select(this)
            sideDiv.transition().duration(750).style("width", "45%").style("opacity", 0.9).style("pointer-events", "auto");
            let countryName = countriesData[d.id]["name"]
            if (countryName.includes("United Kingdom")){
                countryName = "United Kingdom" //otherwise it will be United Kingdom of Great Britain and Northern Ireland and it will be too long
            }
            currentSubGroups= []
            fillSideDivWithBarChart([clickedCountryCode])
        }
    }
    
    const allValuesNumberContent = []
    for (let i = 0; i < countryCodeList.length; i++){
        allValuesNumberContent.push(countriesToOverviewInfo[countryCodeList[i]]["tvids"])
    }
    allValuesNumberContent.sort()
    let minTitlesNumber = allValuesNumberContent[0]
    let maxTitlesNumber = allValuesNumberContent[allValuesNumberContent.length-1]
    const range = d3.quantize(d3.interpolateHcl("#FFCCCB", "#E50914"), 37)

    const colorScaler = d3.scaleOrdinal()
        .domain(allValuesNumberContent)
        .range(range);
    


    //I need to create a legend for the color scale

    createLegendForColorScale("#FFCCCB", "#E50914",300, 25)

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
}