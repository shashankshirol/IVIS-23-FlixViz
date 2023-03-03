import json

with open('countriesCodesParsed.json', 'r') as f:
  data = json.load(f)

with open('countries.json', 'r') as f:
   country_data = json.load(f)

avail_country_codes = country_data.keys()

to_save = {}
for k, v in data.items():
  if v["alpha-2"] in avail_country_codes:
    to_save[v["name"]] = k

with open("CName_to_id.json", "w") as outfile:
    json.dump(to_save, outfile)