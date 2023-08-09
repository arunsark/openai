const { getRepScoreApi, getLocationApi, getRatingsApi, getAggregatePageMetricsApi } = require("./util.js")
const { convertRange } = require("./converters.js")

const DEFAULT_RANGE = 'Last30Days';

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

const normalizeRange = (range) => { 
    if ( range === undefined ) {
        return DEFAULT_RANGE
    } else {
        return convertRange(range)
    }
}

const getRepScore = async (locationID, range) => {
    let resp = await getRepScoreApi(locationID, normalizeRange(range))
    if ( resp === null ) {
        return {error: "Score not found"}
    }
    resp.time_period = normalizeRange(range)
    return resp
}

const getRatings = async (locationID, range) => {
    let resp = await getRatingsApi(locationID, normalizeRange(range))
    if ( resp === null ) {
        return {error: "Ratings not found"}
    }
    resp.time_period = normalizeRange(range)
    return resp
}

const getAggregatePageMetrics = async (locationID, range, sourceID) => {
    if ( sourceID === undefined ) 
        sourceID = "GOOGLE_PLACES"
    let resp = await getAggregatePageMetricsApi(locationID, normalizeRange(range), sourceID)
    if ( resp === null ) {
        return {error: "Aggregate Page Metrics not found"}
    }
    return resp.map((item) => {return {date: item.date, views: item["m.page:views"]}})
}

module.exports = { getRepScore, getLocation, getRatings, getAggregatePageMetrics }