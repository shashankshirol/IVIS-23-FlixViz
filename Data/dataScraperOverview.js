async function getJSON(path) {
    return await fetch(path).then(response => response.json());
}

let data = {
    "movies": {"most":{"country": "", "amount": 0}, "least":{"country": "", "amount": 10000}, "average": 0},
    "series": {"most":{"country": "", "amount": 0}, "least":{"country": "", "amount": 10000}, "average": 0}
};


getJSON("../Data/country_to_content.json").then(countryToContent => {
    getJSON("../Data/code_to_movie_data.json").then(codeToContent => {
        //I now need to find the country with the most and least movies and series, please help me with this
        let totalSumMovies = 0;
        let totalSumSeries = 0;
        for(let country in countryToContent){
            let movies = 0;
            let series = 0;
            for(let code of countryToContent[country]){
                if(codeToContent[code]["vtype"] == "movie"){
                    movies += 1;
                    totalSumMovies += 1;
                }else{
                    series += 1;
                    totalSumSeries += 1;
                }
            }
            
            if(movies > data["movies"]["most"]["amount"]){
                data["movies"]["most"]["country"] = country;
                data["movies"]["most"]["amount"] = movies;
            }
            if(series > data["series"]["most"]["amount"]){
                data["series"]["most"]["country"] = country;
                data["series"]["most"]["amount"] = series;
            }
            if(movies < data["movies"]["least"]["amount"]){
                data["movies"]["least"]["country"] = country;
                data["movies"]["least"]["amount"] = movies;
            }
            if(series < data["series"]["least"]["amount"]){
                data["series"]["least"]["country"] = country;
                data["series"]["least"]["amount"] = series;
            }
        }

        data["movies"]["average"] = totalSumMovies / Object.keys(countryToContent).length;;
        data["series"]["average"] = totalSumSeries / Object.keys(countryToContent).length;

    });
});

const dictstring = JSON.stringify(data);

var fs = require('fs');
fs.writeFile("MinMaxData.json", dictstring, function(err, result) {
    if(err) console.log('error', err);
});