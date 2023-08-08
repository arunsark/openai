
const axios = require('axios')

const headers = { 'x-api-key': 'd348333fa3c5cfce8b88a3cb802e62ac', 'Content-Type': 'application/json' }


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
        const { status, data} = await axios.post(payload.url, payload.data, {headers: {'x-api-key': 'd348333fa3c5cfce8b88a3cb802e62ac','Content-Type': 'application/json'} });
        
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
        params: {from:"2023-07-01", to:"2023-07-31", locationIDs: payload.location}
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

const getLocations = async (data) => {
    let payload = buildPostPayload(data)
    payload.url = 'https://api.reputation.com/v3/locations-search'
    console.log(payload)
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

const getRepScore = async (payload) => {
    const data = await getSummary(payload)
    return {score: data.summary?.overall?.score}
}

exports.getLocationApi = getLocation
exports.getRepScoreApi = getRepScore
//module.exports = { getRepScore, getLocations, filterMainLocation, getLocation }
