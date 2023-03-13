let currentCountry = null
let hasAllZoomingEnded = false
let isItInCountryAvailabilityMode = false
const tooltip = generateTooltip()
let alreadyOver = false
//grouping of all the path of the countries that I have in svg
const svg = generateSvg()
const g = svg.append("g")
svg.call(zoom)
const sideDiv = setupSideDiv() 
let neighbourCountriesSelected = []
let countryCodeList = []
let listOfDimensionsMoviesVsSeries = []
let currentlyHighlightedCountries = []

