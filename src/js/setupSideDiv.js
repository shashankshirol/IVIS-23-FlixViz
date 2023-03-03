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