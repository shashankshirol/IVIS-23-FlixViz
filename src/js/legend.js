function createLegendForColorScale(initialColor, finalColor, w,h){
    let svglegend = d3.select(".legend")
    let container = svglegend.append("g")
    container.attr("width", w)
        .attr("height", h)
        .raise()
    let defs = container.append("defs");

    //Append a linearGradient element to the defs and give it a unique id
    let linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    //Horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
        
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", initialColor); //light blue

    //Set the color for the end (100%)
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", finalColor); 

    //Draw the rectangle and fill with gradient
    svglegend.append("rect")
        .attr("width", w)
        .attr("height", h)
        .style("fill", "url(#linear-gradient)");

    svglegend
        .style("opacity", 0.8)
        .style("overflow", "visible")
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("left", "40%")
        .attr("width", w)
        .attr("height", h) 
    
    svglegend.append("text").attr("fill", "white").attr("x", 3*w/8).attr("y", 3 * h / 4).html("No. of Titles")
    svglegend.append("text").attr("fill", "white").attr("x", -50).attr("y", 3 * h / 4).html(minTitlesNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
    svglegend.append("text").attr("fill", "red").attr("x", w+10).attr("y", 3*h/4).html(maxTitlesNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
}