async function getJSON(path) {
    return await fetch(path).then(response => response.json());
}

function getCountryobject(country_features, id) {
    for (let i = 0; i < country_features.length; i++) {
        if (country_features[i].id == id) {
            return country_features[i]
        }
    }
}



function fillDataList(list_, datalist_id) {
    $("#search-field datalist").remove();
    $("#search-field").attr("list", datalist_id)

    let container = document.getElementById('search-field'),
    i = 0,
    len = list_.length,
    dl = document.createElement('datalist');

    dl.id = datalist_id;
    for (; i < len; i += 1) {
        let option = document.createElement('option');
        option.value = list_[i];
        dl.appendChild(option);
    }
    container.appendChild(dl);
}

$("#country-form").submit(function() {
    search($("#search-field").get(0));
    return false;
});

//Map Country name to IDs
getJSON("../Data/CName_to_id.json").then(data => {
    getJSON("../Data/data_netflix.json").then(netflix_data => {

        // Prep Countries
        let countryList = []
        let Cname_id = {}
        for (const country in data) {
            countryList.push(country)
            Cname_id[country] = data[country]
        }
        let unavail_countries = ["Hong Kong", "Singapore"]
        for (const c of unavail_countries) {
            let idx = countryList.indexOf(c)
            countryList.splice(idx, 1)
        }

        // Prep Titles
        let titleList = []
        let titleCntry = {}
        for (let i = 0; i < netflix_data.length; i++) {
            titleList.push(netflix_data[i].title)
            titleCntry[netflix_data[i].title] = netflix_data[i].clist
        }

        fillDataList(countryList, 'countrylist');

        $("#title_search_cb").change(function () {
            if ($("#title_search_cb").is(":checked")) {
                console.log("Checkbox is Checked")
                $('#search-field').attr('placeholder', 'Search Title');
                fillDataList(titleList, 'titlelist');
            }
            else {
                console.log("Unchecked")
                $('#search-field').attr('placeholder', 'Search Country');
                fillDataList(countryList, 'countrylist');
            }
        });

        getJSON("../Data/countriesCodesParsed.json").then(countriesData => {
            getJSON("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(data => {
                const country_features = topojson.feature(data, data.objects.countries).features

                $("#search-cnt").click(function () {

                    if (!$("#title_search_cb").is(":checked")) {
                        let id = Cname_id[$("#search-field").val()]
                        let clickedCountryCode = countriesData[id]["alpha-2"]
                        let feature = getCountryobject(country_features, id)
                        const [[x0, y0], [x1, y1]] = path.bounds(feature);
                        svg.transition().duration(750).call(
                            zoom.transform,
                            d3.zoomIdentity
                                .translate(width / 4, height / 2)
                                .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                        );

                        if (currentCountry != null) {
                            unhighlightCountry(currentCountry)
                        }
                        unhighlightAllCountries()
                        remove_all_connections()
                        if (tooltipVisibilityStatusComparedToClik) {
                            tooltipVisibilityStatusComparedToClik = false
                            tooltip.transition().duration(500).style("visibility", tooltipVisibilityStatusComparedToClik ? "visible" : "hidden")
                        }

                        g.selectAll("path")
                            .each(function (d) {
                                if (d != undefined && d.id == id) {
                                    highlightCountry(d3.select(this))
                                    currentCountry = d3.select(this)
                                    sideDiv.transition().duration(750).style("width", "45%").style("opacity", 0.9).style("pointer-events", "auto");
                                    currentSubGroups = []
                                    fillSideDivWithBarChart([clickedCountryCode])
                                }
                            })
                    }
                    else {
                        // Add code to highlight countries here
                        let content = $("#search-field").val()
                        console.log(content)
                        console.log(titleCntry[content])
                    }
                
                })
            });
        });
    });
});