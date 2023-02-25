new svgMap({
    targetElementID: 'svgMap',
    minZoom: 1,
    maxZoom: 1,
    colorMax: "#E50914",
    colorMin: "#EAC7C7",
    data: {
      data: {
        tvids: {
          name: 'Total Titles',
          format: '{0}',
          thousandSeparator: ',',
          thresholdMax: 18000,
          thresholdMin: 1000
        },
        tmovs: {
            name: 'Movies',
            format: '{0}',
            thousandSeparator: ',',
            thresholdMax: 18000,
            thresholdMin: 100
        },
        tseries: {
            name: 'Series',
            format: '{0}',
            thousandSeparator: ',',
            thresholdMax: 18000,
            thresholdMin: 100
        },
      },
      applyData: 'tvids',
      values: {
        AR: {
            tvids: 6188,
            tseries: 2248,
            tmovs: 3940
        },
        AU: {
            tvids: 6266,
            tseries: 2370,
            tmovs: 3896
        },
        BE: {
            tvids: 6544,
            tseries: 2317,
            tmovs: 4227
        },
        BR: {
            tvids: 6323,
            tseries: 2246,
            tmovs: 4077
        },
        CA: {
            tvids: 6165,
            tseries: 2281,
            tmovs: 3884
        },
        CO: {
            tvids: 5977,
            tseries: 2240,
            tmovs: 3737
        },
        CZ: {
            tvids: 8552,
            tseries: 2307,
            tmovs: 6245
        },
        FR: {
            tvids: 6537,
            tseries: 2309,
            tmovs: 4228
        },
        DE: {
            tvids: 7615,
            tseries: 2354,
            tmovs: 5261
        },
        GR: {
            tvids: 6963,
            tseries: 2245,
            tmovs: 4718
        },
        HK: {
            tvids: 6291,
            tseries: 2399,
            tmovs: 3892
        },
        HU: {
            tvids: 6873,
            tseries: 2297,
            tmovs: 4576
        },
        IS: {
            tvids: 7074,
            tseries: 2282,
            tmovs: 4792
        },
        IN: {
            tvids: 6071,
            tseries: 2483,
            tmovs: 3588
        },
        IL: {
            tvids: 6128,
            tseries: 2292,
            tmovs: 3836
        },
        IT: {
            tvids: 6737,
            tseries: 2277,
            tmovs: 4460
        },
        JP: {
            tvids: 6567,
            tseries: 2521,
            tmovs: 4046
        },
        LT: {
            tvids: 7128,
            tseries: 2305,
            tmovs: 4823
        },
        MY: {
            tvids: 6427,
            tseries: 2622,
            tmovs: 3805
        },
        MX: {
            tvids: 6286,
            tseries: 2246,
            tmovs: 4040
        },
        NL: {
            tvids: 6563,
            tseries: 2270,
            tmovs: 4293
        },
        PH: {
            tvids: 6317,
            tseries: 2608,
            tmovs: 3709
        },
        PL: {
            tvids: 6474,
            tseries: 2241,
            tmovs: 4233
        },
        PT: {
            tvids: 6739,
            tseries: 2256,
            tmovs: 4483
        },
        RO: {
            tvids: 6590,
            tseries: 2260,
            tmovs: 4330
        },
        SG: {
            tvids: 6754,
            tseries: 2620,
            tmovs: 4134
        },
        SK: {
            tvids: 6707,
            tseries: 2306,
            tmovs: 4401
        },
        ZA: {
            tvids: 5893,
            tseries: 2389,
            tmovs: 3504
        },
        KR: {
            tvids: 5792,
            tseries: 2262,
            tmovs: 3530
        },
        ES: {
            tvids: 6988,
            tseries: 2279,
            tmovs: 4709
        },
        SE: {
            tvids: 6587,
            tseries: 2215,
            tmovs: 4372
        },
        CH: {
            tvids: 6369,
            tseries: 2399,
            tmovs: 3970
        },
        TH: {
            tvids: 6774,
            tseries: 2586,
            tmovs: 4188
        },
        TR: {
            tvids: 6004,
            tseries: 2245,
            tmovs: 3759
        },
        UA: {
            tvids: 5647,
            tseries: 2288,
            tmovs: 3359
        },
        GB: {
            tvids: 6420,
            tseries: 2448,
            tmovs: 3972
        },
        US: {
            tvids: 6019,
            tseries: 2314,
            tmovs: 3705
        }
      }
    }
});

document.getElementsByClassName("svgMap-map-image")[0].style.backgroundColor = "rgb(14, 17, 23)";

var country_codes = {}
$.getJSON("../Data/country_to_code.json", function (data) { 
    $.each(data, function (key, val) {
        country_codes[key.trim()] = val
    });
});

$(document).ready(function () { 
    $(".svgMap-map-image").click(function (evt) {
        console.log(evt.target.id);
        if (evt.target.id.startsWith("svgMap-map-country")) {
            $(".svgMap-tooltip").css("visibility", "hidden")
            zoom.to({
                element: document.getElementById(evt.target.id)
            });
            $(".svgMap-map-image").css("pointer-events", "none")
        }
    });
    $("#search-cnt").click(function () {
        id = "svgMap-map-country-"+country_codes[$("#search-field").val().toLowerCase()]
        elem_path = document.getElementById(id)
        if (elem_path) {
            $(".svgMap-tooltip").css("visibility", "hidden")
            zoom.to({
                element: document.getElementById(id)
            });
            $(".svgMap-map-image").css("pointer-events", "none")
        }
    });
});