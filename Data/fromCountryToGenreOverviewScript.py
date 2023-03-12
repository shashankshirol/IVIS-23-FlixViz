import json

f = open('Data/data_netflix.json')

data = json.load(f)

dataParsed = {}

for data_entry in data:
    countries_per_data = [country.split(":")[0].strip() for country in data_entry['clist'].split(',')]
    for country in countries_per_data:
        if country not in dataParsed:
            dataParsed[country] = dict()
        #now I need to extract all the genres
        genres_per_data = [entry.strip() for entry in data_entry['genre'].split('|')]
        for genre in genres_per_data:
            if len(genre) <2:
                continue
            if genre not in dataParsed[country]:
                dataParsed[country][genre] = 0
            dataParsed[country][genre] = dataParsed[country][genre] + 1
#I need to sort the genres per country by the number of movies
for country in dataParsed:
    dataParsed[country] = dict(sorted(dataParsed[country].items(), key=lambda item: item[1], reverse=True))

# Serializing json
json_object = json.dumps(dataParsed, indent=4)
 
# Writing to json
with open("Data/countryToGenreOverview.json", "w") as outfile:
    outfile.write(json_object)