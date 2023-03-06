let wasDivExpanded = false
function mydropDown(countries_arr) {
    d3.select("#dropdown_container_title").text("Select up to 2 countries to compare to the currently selected")
    //I first empty the dropdown
    d3.select("#dropdown_container").selectAll("select").remove();
    
    let dropDown = d3.select("#dropdown_container")
      .append("select")
      .attr("class", "selection")
      .attr("name", "country-list")

    countries_arr = countries_arr.filter(entry => !currentSubGroups.includes(entry.value))
    countries_arr = [{key: "Select a country", value: "None"}, ...countries_arr]
    
    dropDown.selectAll("option")
      .data(countries_arr)
      .enter()
      .append("option")
      .attr("value", (d) => d.key)
      .text(function(d){ 
        return d.key.charAt(0).toUpperCase() + d.key.slice(1)
    })
    
    dropDown
      .on("change", function(d) {
        let selectedOption = d3.select(this).property("value")

        let result = countries_arr.filter(entry => 
            entry.key == selectedOption
        )[0].value
        
        fillSideDivWithBarChart([result])
      })


}

function setupSideDiv(){
    return d3.select("body")
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
                    <div id="dropdown_container"><div id="dropdown_container_title"></div></div>
                    <div class="buttonDiv">
                        <button type="button" id="expandCollapeDiv">Go to Details</button>
                    </div>
                    <div id="scatterPlotSideDiv"></div>`)
            .style("text-align", "center")
}

let currentSubGroups = []

function createLegend(svgSideBar, colorfunction, keys, width, height, swapped){
    // Add one dot in the legend for each name.

    svgSideBar.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", width - 100)
        .attr("cy", function(d,i){ return height/5  + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return colorfunction(d)})
        .on("mouseover", function(d){
            d3.select(this).attr("r", 10)
            svgSideBar.selectAll("rect")
                .filter(function(rectData){
                    return rectData.key != d
                })
                .style("opacity", 0.2)
                
        })
        .on("mouseleave", function(d){
            d3.select(this).attr("r", 7)
            svgSideBar.selectAll("rect").style("opacity", 1)
        })
        .on("click", function(d){
            //I want to remove the country from the list of countries to compare
            let initial_to_not_remove = currentSubGroups[0]
            let initial_size = currentSubGroups.length
            currentSubGroups = currentSubGroups.filter(function(country){
                return country != d || country == initial_to_not_remove
            })

            if(initial_size != currentSubGroups.length){
                if(currentSubGroups.length == 1){
                    fillSideDivWithBarChart([])
                }else{
                    fillSideDivWithBarChart(currentSubGroups)
                }
                
            }
        })

    // Add one dot in the legend for each name.
    svgSideBar.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", width-85)
        .attr("y", function(d,i){ return height/4.5 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return colorfunction(d)})
        .text(function(d){
            if(swapped[d].toLowerCase() == "united states of america"){
                return "Usa";
            }else if(swapped[d].toLowerCase() == "korea, republic of (south korea)"){
                return "South Korea";
            }else{
                return swapped[d].charAt(0).toUpperCase() + swapped[d].slice(1);
            }
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}


function fillSideDivWithScatterPlot(countryCode){

}

function fillSideDivWithBarChart(countryCode){
    getJSON("../../Data/countries.json").then(countriesToOverviewInfo => {
        
        let x = countriesToOverviewInfo[countryCode[0]]["tmovs"]
        let y = countriesToOverviewInfo[countryCode[0]]["tseries"]
        console.log(x, y)
        generateScatterChartInElement(listOfDimensionsMoviesVsSeries, x, y, d3.select("#scatterPlotSideDiv"))

        if(currentSubGroups.length + countryCode.length < 4){
            currentSubGroups = currentSubGroups.concat(countryCode)
        }

        let margin = {top: 5, right: 25, bottom: 110, left: 70}
        let width_bar = 500 - margin.left - margin.right
        let height_bar = 350 - margin.top - margin.bottom;
        d3.select("#clickData").selectAll("svg").remove()
        // append the svg object to the body of the page
        let svgDivBarChart = d3.select("#clickData")
        .append("svg")
            .attr("width", width_bar + margin.left + margin.right)
            .attr("height", height_bar + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const getXMostPopularGenres = (countryToGenre, countryCode, x) => {
            return Object.keys(countryToGenre[countryCode]).map((key) => [key, countryToGenre[countryCode][key]]).slice(0,x);
        }

        const swapKeyValue = (object) =>
        Object.entries(object).reduce((swapped, [key, value]) => (
            { ...swapped, [value]: key }
        ), {});

        getJSON("../../Data/countryToGenreOverview.json").then(countryToGenre => {
            getJSON("../../Data/country_to_code.json").then(countryname_to_code => {     

                let reference_country = currentSubGroups[0]
                let ten_best_genres = {}
                ten_best_genres[reference_country] = getXMostPopularGenres(countryToGenre, reference_country, 10)

                let subgroup_except_reference = currentSubGroups.slice(1,currentSubGroups.length);

                for(let country in subgroup_except_reference){
                    let ten_best_genres_subcountry = getXMostPopularGenres(countryToGenre, subgroup_except_reference[country], 10)
                    let ten_best_genres_only_titles = ten_best_genres[reference_country].map((genre) => genre[0])
                    ten_best_genres[subgroup_except_reference[country]] = ten_best_genres_subcountry.filter((genre) => ten_best_genres_only_titles.includes(genre[0]))           
                }

                //When referencing the reference graph, the different nation are the subgroups, and the different genres are the groups
                let x = d3.scaleBand()
                        .range([ 0, width_bar ])
                        .domain(ten_best_genres[reference_country].map(function(d) { return d[0]; }))
                        .padding(0.2);

                svgDivBarChart.append("g")
                        .attr("id", "sidebarchart")
                        .attr("transform", "translate(0," + height_bar + ")")
                        .call(d3.axisBottom(x))
                        .selectAll("text")
                            .attr("transform", "translate(-10,0)rotate(-45)")
                            .style("text-anchor", "end");

                //Somehow remaps the data to the new domain
                let xSubgroup = d3.scaleBand()
                    .domain(currentSubGroups)
                    .range([0, x.bandwidth()])
                    .padding([0.05])
                
                // Add Y axis
                let y = d3.scaleLinear()
                .domain([0, 2500])
                .range([ height_bar, 0]);

                svgDivBarChart.append("g")
                .call(d3.axisLeft(y));

                let color = d3.scaleOrdinal()
                    .domain(currentSubGroups)
                    .range(['#e41a1c','#377eb8','#4daf4a'])


                // Bars
                svgDivBarChart.append("g")
                    .selectAll("g")
                    // Enter in data = loop group per group
                    .data(ten_best_genres[reference_country])
                    .enter()
                    .append("g")
                    .attr("transform", function(d) {return "translate(" + x(d[0]) + ",0)"; })
                    .selectAll("rect")
                    .data(function(d) { 
                        return currentSubGroups.map(function(key) {
                            let genreEntry = ten_best_genres[key].filter((entry) => entry[0] == d[0])[0] 
                            let val = genreEntry == undefined ? 0 : genreEntry[1]
                            return {key: key, value: val}; }); 
                    })
                    .enter().append("rect")
                    .attr("x", function(d) { return xSubgroup(d.key); })
                    .attr("y", function(d) { return y(0); })
                    .attr("width", xSubgroup.bandwidth())
                    .attr("height", function(d) { return height_bar - y(0); })
                    .attr("fill", function(d) { return color(d.key); });

                //Adding axis labels
                svgDivBarChart.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", width_bar/2)
                    .attr("y", height_bar + margin.top + 85)
                    .text("Genres");
                
                svgDivBarChart.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("y", -margin.left+10) 
                    .attr("x", -50)
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    .text("number of titles");

                svgDivBarChart.selectAll("rect")
                    .on("mouseover", function(d) {
                        let bar = d3.select(this); // Alternatively, d3.select(nodes[i]);
                        let label = d3.select(this.parentNode).selectAll('.label').data([d]);

                        label.enter()
                            .append('text')
                            .attr('class', 'label')
                            .merge(label)
                            .text( d.value )
                            .style('display', null)
                            .style('font', '10px sans-serif' )
                            .attr('text-anchor', 'middle')
                            .attr('x', +bar.attr('x') + ( +bar.attr('width') / 2 ))
                            .attr('y', +bar.attr('y') - 6 );

                        d3.select(this).style("fill", d3.rgb(color(d.key)).darker(2));
                    })
                    .on("mouseleave", function(d) {
                        d3.select(this.parentNode)
                            .select('.label')
                            .style('display', 'none');

                        d3.select(this).style("fill", color(d.key));
                    })
                    .transition()
                    .duration(500)
                    .attr("y", function(d) { return y(d.value); })
                    .attr("height", function(d) { return height_bar - y(d.value); })
                    .delay(function(d,i){return(i*100)})
                    
                let swapped = swapKeyValue(countryname_to_code)
                mydropDown(Object.keys(countryToGenre).map(function(key) {return {key: swapped[key], value: key}}));
                sideDiv.select("h1").text(function() {
                    if(swapped[currentSubGroups[0]].toLowerCase() == "united states of america"){
                        return "USA";
                    }else if(swapped[currentSubGroups[0]].toLowerCase() == "korea, republic of (south korea)"){
                        return "South Korea";
                    }else{
                        return swapped[currentSubGroups[0]].charAt(0).toUpperCase() + swapped[currentSubGroups[0]].slice(1);
                    }
                })
                createLegend(svgDivBarChart, color, currentSubGroups,width_bar, height_bar, swapped)
            })        
        })
    })
}

