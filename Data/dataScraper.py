import json

f = open('Data/data.json')

data = json.load(f)

countries = set()

def getEntryCountries(data_entry):
    countries_per_data = data_entry['clist'].split(',')
    return [country.split(':')[0].strip() for country in countries_per_data]

for data_entry in data:
    countries_per_data = getEntryCountries(data_entry)
    countries.update(countries_per_data)

country_to_imdb_codes = {}

for data_entry in data:
    countries_per_data = getEntryCountries(data_entry)
    for country in countries_per_data:
        if country not in country_to_imdb_codes:
            country_to_imdb_codes[country] = []
        country_to_imdb_codes[country].append(data_entry['id'])

# Serializing json
json_object = json.dumps(country_to_imdb_codes, indent=4)
 
# Writing to json
with open("Data/country_to_content.json", "w") as outfile:
    outfile.write(json_object)