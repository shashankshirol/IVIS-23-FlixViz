import json

f = open('src/data/data.json')

data = json.load(f)

code_to_movie_data = {}

for data_entry in data:
    code_to_movie_data[data_entry['id']] = data_entry
    
 
# Serializing json
json_object = json.dumps(code_to_movie_data, indent=4)
 
# Writing to json
with open("src/data/code_to_movie_data.json", "w") as outfile:
    outfile.write(json_object)

f = open('src/data/country_to_content.json')

data2 = json.load(f)

country_content_codes = data2["United States"][10]

print(country_content_codes)