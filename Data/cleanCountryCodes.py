import json

with open('countriesCodesParsed.json', 'r') as f:
  data = json.load(f)

to_save = {}
for k, v in data.items():
  to_save[k] = {'alpha-2': v['alpha-2'], "name": v["name"]}

with open("out.json", "w") as outfile:
    json.dump(to_save, outfile)