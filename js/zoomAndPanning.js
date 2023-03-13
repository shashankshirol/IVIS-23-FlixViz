const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .translateExtent([[0, 0], [width, height]])
  .on("zoom", zoomed);


function zoomed() {

    if((currentCountry != undefined && (d3.event?.sourceEvent?.type === "mousemove" || Math.sign(d3.event?.sourceEvent?.deltaY) > 0)) || currentCountry == undefined){
        unhighlightAllCountries()
        remove_all_connections()
        unselectCountry(currentCountry)
    }
    if(isItInCountryAvailabilityMode && (d3.event?.sourceEvent?.type === "mousemove" || Math.sign(d3.event?.sourceEvent?.deltaY) < 0)){
        unhighlightAllCountries()
        remove_all_connections()
        isItInCountryAvailabilityMode = false
    }
    const { transform } = d3.event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);

}

function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

async function transitionBack(){
    await svg.transition()
        .duration(500)
        .call( zoom.transform, d3.zoomIdentity );
    isItInCountryAvailabilityMode = false
    tooltipVisibilityStatusComparedToClik = true
}

function reset() {

    remove_all_connections()
    unhighlightAllCountries()
    unselectCountry(currentCountry)

     // updated for d3 v4
    transitionBack()
}