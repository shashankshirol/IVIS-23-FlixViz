async function getJSON(path) {
    return await fetch(path).then(response => response.json());
}

//now I need to get the data from the json file, please help me with this

$.getJSON("../../Data/countries.json", function (data) { 
    $.each(data, function (key, val) {
        countryCodeList.push(key)
        listOfDimensionsMoviesVsSeries.push([val["tseries"], val["tmovs"]])
    });
});

getJSON("../../Data/neighbouringCountries.json").then(neighbouringCountriesData => {
    getJSON("../../Data/countries.json").then(countriesToOverviewInfo => {
        getJSON("../../Data/countriesCodesParsed.json").then(countriesData => {
            getJSON("https://unpkg.com/world-atlas@2.0.2/countries-110m.json").then(data => {
                main_handler(neighbouringCountriesData, countriesToOverviewInfo, countriesData, data)
            })
        })
    })
})
