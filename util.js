
const axios = require('axios')

const headers = { 'x-api-key': process.env.X_API_KEY, 'Content-Type': 'application/json' }


const buildPostPayload = (data) => {
    let payload = {}
    payload.config = {}
    payload.config = {headers: headers}
    payload.data = data
    return payload
}

const buildGetPayload = () => {
    let payload = {}
    payload.config = {}
    payload.config = {headers: headers}
    return payload
}

const post = async (payload) => {
    try {
        const { status, data} = await axios.post(payload.url, payload.data, {headers: {'x-api-key': process.env.X_API_KEY,'Content-Type': 'application/json'} });
        
        if ( status == 200 ) {
            return data
        }
    } catch(error) {
        console.log("Failed", error)
    }
    return null
}

const get = async (payload) => {
    try {
        const { status, data} = await axios.get(payload.url, payload.config);
        if ( status == 200 ) {
            return data
        }
    } catch(error) {
        console.log("Failed", error)
    }
    return null
}

async function getSummary(payload) {
//    console.log("getSummary", payload)
    const config = {
        headers: {'x-api-key': 'd348333fa3c5cfce8b88a3cb802e62ac'},
        params: {locationIDs: payload.location, range: payload.range}
    }
    try {
        const { status, data } = await axios.get('https://api.reputation.com/v3/summary', config);
        if ( status == 200 ) {
            return data
        }
    } catch(error) {
        console.log("Failed", error)
    }
    return null
}

async function getAggregatePageMetricsApi(payload) {
    // console.log("getAggregatePageMetrics", payload)
     const config = {
         headers: {'x-api-key': 'd348333fa3c5cfce8b88a3cb802e62ac'},
         params: payload
     }
     try {
         const { status, data } = await axios.get('https://api.reputation.com/v3/aggregate-page-metrics', config);
         if ( status == 200 ) {
             return data
         }
     } catch(error) {
         console.log("Failed", error)
     }
     return null
 }

const getLocations = async (data) => {
    let payload = buildPostPayload(data)
    payload.url = 'https://api.reputation.com/v3/locations-search'
    // console.log(payload)
    const resp = await post(payload)
    return resp    
}

const getLocation = async (locationID) => {
    let payload = buildGetPayload()
    payload.url = 'https://api.reputation.com/v3/locations/' + locationID
    const resp = await get(payload)
    return resp
}


const filterMainLocation = (locations, zipCode) => {
    let filteredLocations = locations.filter((location) => {
        let places = location.places.filter((place) => place.address.postalCode == zipCode)
        if ( places.length > 0 )
            return true
        else
            return false
    })
    return filteredLocations.length > 0 ? filteredLocations[0] : null
}

const getRepScore = async (locationID, range) => {
    const data = await getSummary({location: locationID, range: range})
    return {score: data.summary?.overall?.score}
}

const getRatings = async (locationID, range) => {
    const data = await getSummary({location: locationID, range: range})
    return {rating: data.summary?.overall?.rating}
}

const getAggregatePageMetrics = async (locationID, range, sourceID) => {
    const data = await getAggregatePageMetricsApi({locationIDs: locationID, range: range, sourceIDs: sourceID})
    return data
}

exports.getLocationApi = getLocation
exports.getRepScoreApi = getRepScore
exports.getRatingsApi = getRatings
exports.getAggregatePageMetricsApi = getAggregatePageMetrics
