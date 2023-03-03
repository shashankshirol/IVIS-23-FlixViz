import json

f = open('Data/data_netflix.json')

data = json.load(f)

code_to_movie_data = {}

for data_entry in data:
    code_to_movie_data[data_entry['id']] = data_entry
    
 
# Serializing json
json_object = json.dumps(code_to_movie_data, indent=4)
 
# Writing to json
with open("Data/code_to_movie_data.json", "w") as outfile:
    outfile.write(json_object)
