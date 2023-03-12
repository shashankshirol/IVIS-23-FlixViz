function highlightCountry(passedCountry) {
    passedCountry
        .raise()
        .style("stroke", "#FFFDD0")
        .style("stroke-width", 2)
}

function highlightCountryWithColorAndStroke(passedCountry, color, stroke) {
    passedCountry
        .raise()
        .style("stroke", color)
        .style("stroke-width", stroke)
}

function unhilightCountry(id) {
    g.selectAll("path")
        .each(function (d) {
            if (d != undefined && d.id != id) {
                unhighlightCountry(d3.select(this))
            }
        })
}

function unhilightAllCountriesExcept(passedCountry) {
    g.selectAll("path")
        .each(function (d) {
            if (d != undefined && d.id != passedCountry.id) {
                unhighlightCountry(d3.select(this))
            }
        })
}

function unhighlightAllCountries() {
    g.selectAll("path")
        .each(function (d) {
            unhighlightCountry(d3.select(this))
        })
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


function findCenter(markers) {
    if(markers.length > 1){
        let biggestArrayLength = 0
        let biggestArrayIndex = 0
        for(let i = 0; i < markers.length; i++) {
            if(markers[i].length > biggestArrayLength) {
                biggestArrayLength = markers[i].length
                biggestArrayIndex = i
            }
        }
        markers = markers[biggestArrayIndex]
    }
    let flattened = markers.flat()
    markers = Object.entries(markers)
    let lat = 0;
    let lng = 0;
    
    for(let i = 0; i < flattened.length; i++) {
        lat += flattened[i][0];
        lng += flattened[i][1];
    }

    lat /= flattened.length;
    lng /= flattened.length;
    return {lat: lat, lng: lng}
}

function connectTwoCountries(country1, country2){
    let country1Center = findCenter(country1.geometry.coordinates)
    let country2Center = findCenter(country2.geometry.coordinates)
    let link = {type: "LineString", coordinates: [[country1Center.lat, country1Center.lng], [country2Center.lat, country2Center.lng]]}
        g.append("path")
            .attr("d", path(link))
            .attr("id", "link_"+ country1.id + "_" + country2.id)
            .attr("class", "link")
            .style("fill", "none")
            .style("stroke", "orange")
            .style("stroke-width", 3)
            .style("stroke-linejoin", "round")
            .style("stroke-linecap", "round")
            .style("opacity", 0.9)
            .style("pointer-events", "none")
            .style("stroke-dasharray", "10,5")
            .raise()
}

function remove_specific_connection(id0, id1){
    d3.select("#link_" + id0+ "_" +id1 ).remove()
}

function remove_all_connections(){
    d3.selectAll(".link").remove()
}

var clickedCountryCode = ""

function generateCountryDetails(country_code) {

    // Removing existing SVGs
    d3.select("#clickData").selectAll("svg").remove()
    d3.select("#clickData").selectAll("h1").remove()
    d3.select("#clickData").select("#dropdown_container").remove()

    //Hiding Search bar
    d3.select("#country-form").style("visibility", "hidden")

    //Enable Overflow Attribute
    d3.select("#clickData").style("overflow", "auto")
    
    
    let outer_top_titles = d3.select("#clickData").append("div").attr("id", "top_titles").lower()
    outer_top_titles.append("h5").attr("class", "h3 text-muted").attr("id", "movie-header").text(`Top Titles in ${getCountryName(country_code)} based on Filter values`)
    outer_top_titles.append("div").attr("id", "movieRow").attr("class", "row_posters").attr("onscroll", "getScrollVal()")

    let outer_scatter_div = d3.select("#clickData").append("div").attr("id", "scatter_titles").lower()

    let outer_modal_div = d3.select("#clickData").append("div").attr("id", "myModal").attr("class", "modal").lower()

    // Scatter Plot DOM elements
    let scatter_plot_window = outer_scatter_div.append("div").attr("id", "scatterplotWindow").attr("class", "visualWindow")
    let scatterplot_div = scatter_plot_window.append("div").attr("class", "scatterPlot")
    scatterplot_div.append("div").attr("id", "svgPlot").style("display", "block").style("margin", "auto")


    let scatterplot_filters = scatterplot_div.append("div").attr("class", "filters").attr("id", "filter")
    scatterplot_filters.html(`
    <div class="wrapper d-flex flex-column">
            <div class="search-input">
              <a href="" target="_blank" hidden></a>
              <input type="text" placeholder="Search for Genres">
              <div class="autocom-box">
              </div>
                <div class="icon"><i class="fas fa-search"></i></div>
            </div>
            <div class="genreFilter" id="genreFilter"></div>
    </div>
    <div style="text-align: center" id="year"></div>
    <div style="text-align: center" id="votes"></div>
    <div style="text-align: center" id="rating"></div>
    <button class="pill" id="resetFilters">Reset Filters</button>
    `)


    // Modal DOM elements
    outer_modal_div.append("div").attr("class", "modal-content").html(`
    <div class="modal-header">
        <h2 id="title">Modal Header</h2>
        <span class="close">&times;</span>
    </div>
    <div id="modalBody" class="modal-body">
        <div id="modalBodyInfo"></div>
        <div class="dfg">
        <div id="svgPlotForce"></div>
        <div id="modalGenres"> </div>
    </div>
    `)

    setup_modal() // Setting up modal



    d3.select(".buttonDiv").style("text-align", "center")
    generate_scatter_plot(country_code)
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
        if (!wasDivExpanded) {
            d3.select("#expandCollapeDiv").text("Click to collapse")
            sideDiv.transition().duration(500).style("width", "100%").style("opacity", 1)
            generateCountryDetails(clickedCountryCode)
            wasDivExpanded = true
        } else {
            d3.select("#expandCollapeDiv").text("Click to expand")
            sideDiv.transition().duration(500).style("width", "35%").style("opacity", 0.9)

            // Generate the sidebar again
            unhighlightAllCountries()
            remove_all_connections()
            d3.select("#clickData").attr("class", "d-flex flex-column justify-content-around align-items-center").style("text-align", "center")
            d3.select("#clickData").style("overflow", "hidden")

            d3.select("#scatter_titles").remove() // Clearing the Scatter Plot
            d3.select("#myModal").remove() // Clearing the Modal
            d3.select("#movieRow").remove() // Clearing the MovieRow
            d3.select("#movie-header").remove() // Clearing Movie Header

            d3.select("#clickData").append("div").attr("id", "dropdown_container").lower()
            d3.select("#dropdown_container").append("div").attr("id", "dropdown_container_title")
            d3.select("#clickData").append("h1").lower()
            d3.select("#country-form").style("visibility", "visible")

            currentSubGroups = []
            fillSideDivWithBarChart([clickedCountryCode])
            wasDivExpanded = false
        } 
    })

    function checkIfCountryIsInLink(id){
        if(d3.selectAll(".link") != undefined){
            let allConnectedIds = d3.selectAll(".link").nodes().map((c) => {
                return c.id.split("_")[2]
            })

            return allConnectedIds.includes(id)
        }
        return false
    }

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
                (d3.select(this).node() != currentCountry.node() && !checkIfCountryIsInLink(d.id))){
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
        } else if(countryName.includes("United States")){
            countryName = "United States"
        } else if(countryName.includes("Korea")){
            countryName = "South Korea"
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
        d3.select("#hoveredCountryLegendScatter").text(countryName)
        d3.select("#totalTitles").text(countryName + " has "+country_total_tiles + " available on Netflix")
    
        alreadyOver = true
    }
    
    function mouseLeave(d) {
        
        tooltip.selectAll("svg").remove()
        if(currentCountry == undefined || 
            (d3.select(this).node() != currentCountry.node() && !checkIfCountryIsInLink(d.id))){       
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

    function clicked(d) {
        
        clickedCountryCode = countriesData[d.id]["alpha-2"]
        if(countryCodeList.includes(clickedCountryCode)){
            if(tooltipVisibilityStatusComparedToClik){
                tooltipVisibilityStatusComparedToClik = false
                tooltip.transition().duration(500).style("visibility", tooltipVisibilityStatusComparedToClik ? "visible" : "hidden")
            }
            
            const [[x0, y0], [x1, y1]] = path.bounds(d);
            d3.event.stopPropagation();
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
                    .translate(width / 3, height / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                d3.mouse(d3.event.target, svg.node())
            )
            
            unhighlightAllCountries()
            remove_all_connections()

            if(currentCountry != null){
                unhighlightCountry(currentCountry)
            }

            highlightCountry(d3.select(this))
            
            currentCountry = d3.select(this)
            sideDiv.transition().duration(750).style("width", "35%").style("opacity", 0.9).style("pointer-events", "auto");
            let countryName = countriesData[d.id]["name"]
            if (countryName.includes("United Kingdom")){
                countryName = "United Kingdom" //otherwise it will be United Kingdom of Great Britain and Northern Ireland and it will be too long
            }
            currentSubGroups = []
            fillSideDivWithBarChart([clickedCountryCode])
            
        }
    }
    
    const allValuesNumberContent = []
    for (let i = 0; i < countryCodeList.length; i++){
        allValuesNumberContent.push(countriesToOverviewInfo[countryCodeList[i]]["tvids"])
    }
    allValuesNumberContent.sort()
    window.minTitlesNumber = allValuesNumberContent[0]
    window.maxTitlesNumber = allValuesNumberContent[allValuesNumberContent.length-1]
    const range = d3.quantize(d3.interpolateHcl("#FFCCCB", "#E50914"), 37)

    const colorScaler = d3.scaleOrdinal()
        .domain(allValuesNumberContent)
        .range(range);
    

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
