async function getJSON(path) {
    return await fetch(path).then(response => response.json());
}

function getCountryobject(country_features, id) {
    for (var i = 0; i < country_features.length; i++) {
        if (country_features[i].id == id) {
            return country_features[i]
        }
    }
}


function fillDataList(clist) {
    var container = document.getElementById('search-field'),
    i = 0,
    len = clist.length,
    dl = document.createElement('datalist');

    dl.id = 'countrylist';
    for (; i < len; i += 1) {
        var option = document.createElement('option');
        option.value = clist[i];
        dl.appendChild(option);
    }
    container.appendChild(dl);
}

$("#country-form").submit(function() {
    search($("#search-field").get(0));
    return false;
});

//Map Country name to IDs
$.getJSON("../Data/CName_to_id.json", function (data) {
    let countryList = []
    let Cname_id = {}
    for (const country in data) {
        countryList.push(country)
        Cname_id[country] = data[country]
    }

    unavail_countries = ["Hong Kong", "Singapore"]
    for (const c of unavail_countries) {
        let idx = countryList.indexOf(c)
        countryList.splice(idx, 1)
    }
    fillDataList(countryList);

    getJSON("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(data => {
        const country_features = topojson.feature(data, data.objects.countries).features

        $("#search-cnt").click(function () {
            id = Cname_id[$("#search-field").val()]
            feature = getCountryobject(country_features, id)
            const [[x0, y0], [x1, y1]] = path.bounds(feature);
                svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity
                        .translate(width / 2, height / 2)
                        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                );
        });

    });
});