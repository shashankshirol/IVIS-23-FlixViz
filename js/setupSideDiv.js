let wasDivExpanded = false

let last_bounding_box = []

function fixCnameFromdata(data){
    let Cname_id = {}
    for (let country in data) {
        let new_name = null

        if(country.includes("United Kingdom")){
            new_name = "United Kingdom"
        } else if(country.includes("Korea, Republic of")){
            new_name = "Korea, Republic of (south korea)"
        }else if(country.includes("Czech")){
            new_name = "czech republic"
        }
        if(new_name != null){
            Cname_id[new_name.toLowerCase()] = data[country]
        }else{
            Cname_id[country.toLowerCase()] = data[country]
        }
        
    }
    return Cname_id
}

function scaleFormula(x0, y0, x1, y1, w, h){
    return Math.min(2, (0.9 / Math.max((x1 - x0) / w, (y1 - y0) / h))/2)
}

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
        d3.select(".link").raise()
        let selectedOption = d3.select(this).property("value")

        let result = countries_arr.filter(entry => 
            entry.key == selectedOption
        )[0].value
        
        fillSideDivWithBarChart([result])
        if(currentSubGroups.length < 3){
        getJSON("../Data/CName_to_id.json").then(data => {
            let Cname_id = fixCnameFromdata(data)
            getJSON("../Data/country_to_code.json").then(country_to_countryCode => {
            //I need to connect the two countrie
                const swapKeyValue = (object) =>
                Object.entries(object).reduce((swapped, [key, value]) => (
                    { ...swapped, [value]: key }
                ), {});
                const countryCode_to_country = swapKeyValue(country_to_countryCode)
                getJSON("../../Data/countriesCodesParsed.json").then(countriesData => {
                    getJSON("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(data => {
                        const country_features = topojson.feature(data, data.objects.countries).features
                        let id0 = Cname_id[countryCode_to_country[currentSubGroups[0]]]
                        let id1 = Cname_id[countryCode_to_country[result]]
                        //let clickedCountryCode = countriesData[id]["alpha-2"]
                        let feature0 = getCountryobject(country_features, id0)
                        let feature1 = getCountryobject(country_features, id1)
                        connectTwoCountries(feature0, feature1)
                        //I need to check if the two countries are closer than the current zoom level
                        const [[x0_0, y0_0], [x1_0, y1_0]] = path.bounds(feature0);
                        const [[x0_1, y0_1], [x1_1, y1_1]] = path.bounds(feature1);

                        //need to find the bounding box of the two countries
                        let xs = [x0_0, x1_0, x0_1, x1_1]
                        let ys = [y0_0, y1_0, y0_1, y1_1]
                        let x0 = Math.min(...xs)
                        let x1 = Math.max(...xs)
                        let y0 = Math.min(...ys)
                        let y1 = Math.max(...ys)

                        //I need to get the max bounding box considering the current bounding box and the last one
                        if(last_bounding_box.length > 0){
                            let len = last_bounding_box.length
                            let xs = [x0, x1, last_bounding_box[len-1][0], last_bounding_box[len-1][2]]
                            let ys = [y0, y1, last_bounding_box[len-1][1], last_bounding_box[len-1][3]]
                            x0 = Math.min(...xs)
                            x1 = Math.max(...xs)
                            y0 = Math.min(...ys)
                            y1 = Math.max(...ys)
                        }
                        last_bounding_box.push([x0, y0, x1, y1, id1])
                        svg.transition().duration(750).call(
                            zoom.transform,
                            d3.zoomIdentity
                                .translate(width/4, height/2)
                                .scale(scaleFormula(x0, y0, x1, y1, width, height))
                                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                        );
                        
                        g.selectAll("path")
                            .each(function (di) {
                                if (di != undefined && di.id == id1) {
                                    highlightCountry(d3.select(this))
                                }
                        })

                        d3.selectAll(".link").raise()
                    })
                    
                    })
                })
            })
        }
        })
    
}

function setupSideDiv(){
    return d3.select("body")
            .append("div")
            .attr("id", "clickData")
            .attr("class", "d-flex flex-column justify-content-around align-items-center")
            .style("text-align", "center")
            .style("position", "absolute")
            .style("top", "0px")
            .style("right", "0px")
            .style("width", "35%")
            .style("height", "100%")
            .style("background-color", "white")
            .style("z-index", 1000)
            .style("opacity", 0)
            .style("pointer-events", "none")
            .html(`<h1> Click on a country to see its content availability </h1> 
                    <div id="dropdown_container"><div id="dropdown_container_title"></div></div>
                    <div class="buttonDiv">
                        <button class="btn btn-dark m-auto" type="button" id="expandCollapeDiv">Go to Details</button>
                    </div>
                    <div id="scatterPlotSideDiv"></div>`)
}

let currentSubGroups = []

function createLegend(svgSideBar, colorfunction, keys, w, h, swapped){
    // Add one dot in the legend for each name.
    
    //Create click to delete suggestion
    let toDeleteText = svgSideBar.selectAll("clickToRemove")
        .data(currentSubGroups.slice(1))
        .enter()
        .append("text")
        .attr("x", w-190)
        .attr("y",  function(d,i){ return h/4.8 + (i+1)*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "black")
        .attr("id", d => "toRemove"+d)
        .text("Click to remove")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "10px")
        .style("opacity", 0)

    svgSideBar.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
        .attr("cx", w-100)
        .attr("cy", function(d,i){ return h/5  + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return colorfunction(d)})
        .on("mouseover", function(d){
            
            d3.select(this).style("cursor", "pointer"); 
            d3.select(this).attr("r", 10)
            svgSideBar.selectAll("rect")
                .filter(function(rectData){
                    return rectData.key != d
                })
                .style("opacity", 0.2)
            toDeleteText.filter(di => di == d).style("opacity", 1)
            if(d != currentSubGroups[0]){
                getJSON("../Data/CName_to_id.json").then(data => {
                    let Cname_id = fixCnameFromdata(data)
                    getJSON("../Data/country_to_code.json").then(country_to_countryCode => {
                    //I need to connect the two countrie
                        const swapKeyValue = (object) =>
                        Object.entries(object).reduce((swapped, [key, value]) => (
                            { ...swapped, [value]: key }
                        ), {});
                        const countryCode_to_country = swapKeyValue(country_to_countryCode)
                        const code = Cname_id[countryCode_to_country[d]]
                        g.selectAll("path")
                            .each(function (di) {
                                if (di != undefined && di.id == code) {
                                    highlightCountryWithColorAndStroke(d3.select(this), colorfunction(d), 4)
                                }
                            })
                    })
                })
            }
        })
        .on("mouseleave", function(d){
            d3.select(this).attr("r", 7)
            svgSideBar.selectAll("rect").style("opacity", 1)
            toDeleteText.style("opacity", 0)
            if(d != currentSubGroups[0]){
                getJSON("../Data/CName_to_id.json").then(data => {
                    let Cname_id = fixCnameFromdata(data)
                    getJSON("../Data/country_to_code.json").then(country_to_countryCode => {
                    //I need to connect the two countrie
                        const swapKeyValue = (object) =>
                        Object.entries(object).reduce((swapped, [key, value]) => (
                            { ...swapped, [value]: key }
                        ), {});
                        const countryCode_to_country = swapKeyValue(country_to_countryCode)
                        const code = Cname_id[countryCode_to_country[d]]
                        g.selectAll("path")
                            .each(function (di) {
                                if (di != undefined && di.id == code) {
                                    unhighlightCountry(d3.select(this))
                                    highlightCountry(d3.select(this))
                                }
                            })
                    })
                })
            }
        })
        .on("click", function(d){
            //I want to remove the country from the list of countries to compare
            if(currentSubGroups.length > 1){
            let initial_to_not_remove = currentSubGroups[0]
            let initial_size = currentSubGroups.length
            currentSubGroups = currentSubGroups.filter(function(country){
                return country != d || country == initial_to_not_remove
            })
            fillSideDivWithBarChart([])
            //I need to remove the specific connection

            getJSON("../Data/CName_to_id.json").then(data => {
                let Cname_id = fixCnameFromdata(data)
            getJSON("../Data/country_to_code.json").then(country_to_countryCode => {
            //I need to connect the two countrie
                const swapKeyValue = (object) =>
                Object.entries(object).reduce((swapped, [key, value]) => (
                    { ...swapped, [value]: key }
                ), {});
                const countryCode_to_country = swapKeyValue(country_to_countryCode)
                getJSON("../../Data/countriesCodesParsed.json").then(countriesData => {
                    getJSON("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(data => {
                        
                        const country_features = topojson.feature(data, data.objects.countries).features
                        let id0 = Cname_id[countryCode_to_country[currentSubGroups[0]]]
                        let id1 = Cname_id[countryCode_to_country[d]]
                        last_bounding_box = last_bounding_box.filter(d => d[4] != id1)
                        //let clickedCountryCode = countriesData[id]["alpha-2"]
                        remove_specific_connection(id0, id1)
                        //I need to select the svg of the country
                        g.selectAll("path")
                            .each(function (dt) {
                                if (dt != undefined && dt.id == id1) {
                                    unhighlightCountry(d3.select(this))
                                }
                        })
                        //Now I need to recented the view selecting the other country
                        if(currentSubGroups.length == 2){
                            let id2 = Cname_id[countryCode_to_country[currentSubGroups[1]]]
                            //let clickedCountryCode = countriesData[id]["alpha-2"]
                            let feature0 = getCountryobject(country_features, id0)
                            let feature1 = getCountryobject(country_features, id2)
                            
                            const [[x0_0, y0_0], [x1_0, y1_0]] = path.bounds(feature0);
                            const [[x0_1, y0_1], [x1_1, y1_1]] = path.bounds(feature1);

                            //need to find the bounding box of the two countries
                            let xs = [x0_0, x1_0, x0_1, x1_1]
                            let ys = [y0_0, y1_0, y0_1, y1_1]
                            let x0 = Math.min(...xs)
                            let x1 = Math.max(...xs)
                            let y0 = Math.min(...ys)
                            let y1 = Math.max(...ys)

                            svg.transition().duration(750).call(
                                zoom.transform,
                                d3.zoomIdentity
                                    .translate(width/4, height/2)
                                    .scale(scaleFormula(x0, y0, x1, y1, width, height))
                                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                            );

                        }else if (currentSubGroups.length == 1){
                            let feature_last = getCountryobject(country_features, id0)
                            const [[x0, y0], [x1, y1]] = path.bounds(feature_last);
                            svg.transition().duration(750).call(
                                zoom.transform,
                                d3.zoomIdentity
                                    .translate(width / 4, height / 2)
                                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                            );
                        }
                    })
                })
            })})
        }
    })

    // Add one dot in the legend for each name.
    svgSideBar.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", w-85)
        .attr("y", function(d,i){ return h/4.5 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return colorfunction(d)})
        .attr("class", "legendText")
        .text(function(d){
            if(swapped[d].toLowerCase() == "united states of america"){
                return "United States";
            }else if(swapped[d].toLowerCase() == "korea, republic of (south korea)"){
                return "South Korea";
            }else{
                return swapped[d].charAt(0).toUpperCase() + swapped[d].slice(1);
            }
        })
        .attr("id", function(d){
            return d + "_label"
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")


}


function generateScatterChartInsideDiv(svgSideBar, data, color, positions, element) {
    // Step 1
        let margin = {top: 40, right: 40, bottom: 40, left: 60}
        const divWidth = window.innerWidth*0.25
        let scatterWidth = divWidth - margin.left - margin.right
        let scatterHeight = 200 - margin.top - margin.bottom

        // Step 3
        let scatterSvg = element.append("svg")
            .attr("width", scatterWidth + margin.left + margin.right + 60)
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
                .style("fill", "lightgrey")
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
            .attr("x", 3*scatterWidth/8 + margin.left)
            .attr("y", scatterHeight + 35)
            .text("Series");

        // Y axis label:
        scatterSvg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top - scatterHeight/3 + 30)
            .text("Movies")
          
        scatterSvg.append("g")
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .style("opacity", 0)
            .text(node => parseInt(parseInt(node[0]) + parseInt(node[1])) + " total titles")
            .attr("fond-size", "10px")
            .attr("class", "totalTitles")
            .attr("id", node => "#"+node[0].toString() + "_" + node[1].toString() + "_text")
            .attr("x", node => xScale(node[0]) + 12)
            .attr("y", node => yScale(node[1]) - 8)
            .exit()

        scatterSvg.append('g')
        .selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "scatterDots")
        .attr("cx", function (d) { return xScale(d[0]); } )
        .attr("cy", function (d) { return yScale(d[1]); } )
        .attr("r", function(d){
        for(let i = 0; i < positions.length; i++){
            if(positions[i][0] == d[1] && positions[i][1] == d[0]){
                return 6
            }
        }
        return 3
        })
        .style("fill", function(d){
        for(let i = 0; i < positions.length; i++){
            if(positions[i][0] == d[1] && positions[i][1] == d[0]){
                return color(positions[i][2])
            }
        }
        return "#69b3a2"
        })
        .style("stroke", function(d){
        for(let i = 0; i < positions.length; i++){
            if(positions[i][0] == d[1] && positions[i][1] == d[0]){
                return "#000000"
            }
        }
        return "#69b3a2"
        })
        .filter(function(d){
            for(let i = 0; i < positions.length; i++){
                if(positions[i][0] == d[1] && positions[i][1] == d[0]){
                    return true
                }
            }
            return false
        })
        .attr("id", d => d[0] + "_" + d[1] + "_circle")
        .on("mouseover", function(d){
            d3.select(this).style("cursor", "pointer"); 
            d3.select(this) 
            d3.select(this).attr("r", 9).style("stroke", "black")  
            
            scatterSvg.selectAll("circle")
                .filter(di => di[0] != d[0] && di[1] != d[1])
                .filter(".scatterDots")
                .style("opacity", 0.4)
                .each(function(di){
                    svgSideBar.selectAll("rect")
                        .filter(function(rectData){
                            for(let i = 0; i < positions.length; i++){
                                if(positions[i][0] == d[1] && positions[i][1] == d[0]){
                                    return rectData.key != positions[i][2]
                                }
                            }
                            return false
                        })
                    .style("opacity", 0.2)
                })

                scatterSvg.selectAll("text")
                    .filter(dit => dit != undefined ? dit[0] == d[0] && dit[1] == d[1] : false)
                    .style("opacity", 1)
                    .raise()
            
        }).on("mouseleave", function(d){
            d3.select(this).style("cursor", "default");
            d3.select(this).attr("r", 6).style("stroke", "black")
            scatterSvg.selectAll("circle").style("opacity", 1)
            svgSideBar.selectAll("rect").style("opacity", 1)
            d3.selectAll(".totalTitles").style("opacity", 0)
        }).raise()

        let dataEntries = currentSubGroups.concat(["others"])


        scatterSvg
            .selectAll("myLegend")
            .data(dataEntries)
            .enter()
                .append('g')
                .append("text")
                .attr('x', scatterWidth+17)
                .attr('y', (d,i) => 30+i*20)
                .style("font-weight", "bold")
                .text(d => d!="others"?getCountryName(d):"other countries")
                .style("fill", d => d!="others" ? color(d): "rgb(105, 179, 162)")
                .style("font-size", 11)

                
        scatterSvg.append('g')
            .selectAll("legendDots")
                .data(dataEntries)
                .enter()
                .append("circle")
                  .attr("class", "scatterLegendDots")
                  .attr("cx", scatterWidth+8 )
                  .attr("cy", (d,i) => 30+i*20 -5 )
                  .attr("r", function(d){
                    if(d!="others"){return 6}else{return 4}
                  })
                .style("fill", d => d!="others" ? color(d): "rgb(105, 179, 162)")
        
}

function fillSideDivWithBarChart(countryCode) {
    getJSON("../../Data/countries.json").then(countriesToOverviewInfo => {
        
        if (currentSubGroups.length + countryCode.length < 4) {
            d3.select("#clickData").selectAll("svg").remove()
            currentSubGroups = currentSubGroups.concat(countryCode)
            const divWidth = window.innerWidth*0.35

            let margin = {top: 5, right: 150, bottom: 110, left: 150}
            let width_bar = divWidth - margin.left - margin.right
            let height_bar = 320 - margin.top - margin.bottom;
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

            let color = d3.scaleOrdinal()
                .domain(currentSubGroups)
                .range(['#e41a1c','#377eb8','#4daf4a'])

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


                    svgDivBarChart.selectAll("rect")
                        .on("mouseover", function(d) {
                            d3.select(this).style("cursor", "pointer"); 
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

                    //let svgWidth = svgDivBarChart.node().getBoundingClientRect().width
                    //let svgHeight = svgDivBarChart.node().getBoundingClientRect().height
                    //Adding axis labels
                    
                    svgDivBarChart.append("text")
                        .attr("text-anchor", "end")
                        .attr("x", width_bar/2)
                        .attr("y", height_bar+100)
                        .text("Genres");
                    
                    svgDivBarChart.append("text")
                        .attr("class", "y label")
                        .attr("text-anchor", "end")
                        .attr("y", -50) 
                        .attr("x", -height_bar/3.5)
                        .attr("dy", ".75em")
                        .attr("transform", "rotate(-90)")
                        .text("Number of titles");
                })        
            })
            //For some reason I have to add it after the bar chart is created
            let positions = []
            for(let country in currentSubGroups){
                let x = countriesToOverviewInfo[currentSubGroups[country]]["tmovs"]
                let y = countriesToOverviewInfo[currentSubGroups[country]]["tseries"]
                positions.push([x,y,currentSubGroups[country]])
            }

            generateScatterChartInsideDiv(svgDivBarChart, listOfDimensionsMoviesVsSeries, color, positions, d3.select("#scatterPlotSideDiv"))
        }else{
            //Need to dispay an alert saying that the user already selected 3 countries
            alert("You already selected 3 countries")
        }
    })
}

