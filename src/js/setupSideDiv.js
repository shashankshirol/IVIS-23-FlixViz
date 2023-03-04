let wasDivExpanded = false
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
                    <div class="buttonDiv">
                        <button type="button" id="expandCollapeDiv">Go to Details</button>
                    </div>`)
            .style("text-align", "center")
}

function fillSideDivWithBarChart(countryCode){
    let margin = {top: 5, right: 25, bottom: 110, left: 70}
    let width_bar = 300 - margin.left - margin.right
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

    getJSON("../../Data/countryToGenreOverview.json").then(countryToGenre => {
        let ten_best_genres = getXMostPopularGenres(countryToGenre, countryCode, 10)
        let x = d3.scaleBand()
                .range([ 0, width_bar ])
                .domain(ten_best_genres.map(function(d) { return d[0]; }))
                .padding(0.2);

        svgDivBarChart.append("g")
                .attr("id", "sidebarchart")
                .attr("transform", "translate(0," + height_bar + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");

        // Add Y axis
        let y = d3.scaleLinear()
        .domain([0, 2500])
        .range([ height_bar, 0]);

        svgDivBarChart.append("g")
        .call(d3.axisLeft(y));

        // Bars
        svgDivBarChart.selectAll("mybar")
        .data(ten_best_genres)
        .enter()
        .append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height_bar - y(d[1]); })
            .attr("fill", "#69b3a2")

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

    })
}