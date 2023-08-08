const { getRepScoreApi, getLocationApi } = require("./util.js")

const getLocation = async (locationID) => {
    let resp = await getLocationApi(locationID)
    if ( resp === null ) {
        return {error: "Location not found"}
    }
    let location = {}
    location.name = resp.places[0].officeName
    location.streetAddress = resp.places[0].address.streetAddress1
    location.locality = resp.places[0].address.locality
    location.region = resp.places[0].address.region
    return location
}

const getRepScore = async (locationID) => {
    let resp = await getLocationApi(locationID)
    if ( resp === null ) {
        return {error: "Location not found"}
    }
    let location = {}
    location.name = resp.places[0].officeName
    location.streetAddress = resp.places[0].address.streetAddress1
    location.locality = resp.places[0].address.locality
    location.region = resp.places[0].address.region
    return location
}

module.exports = { getRepScore, getLocation }