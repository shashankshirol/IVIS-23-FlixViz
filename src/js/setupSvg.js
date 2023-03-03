const width = window.innerWidth
const height = window.innerHeight
function generateSvg(){
    return d3.select("body")
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
}
