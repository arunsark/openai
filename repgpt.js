
const { Configuration, OpenAIApi } = require("openai");
const { getLocation, getRepScore, getRatings, getAggregatePageMetrics } = require("./repapi4gpt.js")


const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY})
const openai = new OpenAIApi(configuration)

const context = [{"role": "system", 
"content": "Assistant is an intelligent chatbot designed to help the store manager answer question related to their store. e.g. What's my rep score? What's my score? What's my Reputation score? etc."},
{"role": "system", "content": "Don't make assumptions about what values to use with functions. Ask for clarification if a user request is ambiguous."}
]
// What's my Reputation Score? What's my RepScore? How many Google Reviews was added? How is my Publishing? How is my Listing Accuracy? etc."}

const availableFunctions = { "getLocation": getLocation, "getMetric": getMetric } 

async function runLocationConversation(locationID, messages, functionName) {
    messages.push(...context)
    let functionToCall = availableFunctions[functionName]
    if ( functionToCall !== undefined ) {
        let functionResponse = await functionToCall(locationID)        
        messages.push({role: "function", name:functionName, content: JSON.stringify(functionResponse)})
        const response2 = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages
        })
        return response2
    }
}

async function initConversation(prompt) {
    const messages =  [{"role": "system", "content": "Assistant is an intelligent chatbot designed to help the store/location manager find details about his location"}]
    messages.push({role: "user", content: prompt})
    let conversationResponse = {}
    conversationResponse.messages = messages
    const functions = [
        {
            name: "getLocation",
            description: "Find details of the location. A location is also referred as store.",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The location code or store code is alphanumeric code eg: 0053",
                    }
                },
                required: ["location"],
            }
        }
    ]
    // console.log('call gpt to getLocation')
    let response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        functions: functions,
        function_call: "auto"
    });

    const responseMessages = response.data.choices[0].message
    // console.log('call function?', responseMessages)
    conversationResponse.content = responseMessages.content

    if ( responseMessages.function_call !== undefined ) {
        // console.log('here')
        // console.log(conversationResponse)
        conversationResponse.locationID = JSON.parse(responseMessages.function_call?.arguments).location
        if ( conversationResponse.locationID !== null ) {
           conversationResponse.function_call = responseMessages.function_call
        }
       conversationResponse. messages.push(
        {
            "role": responseMessages["role"],"name": responseMessages["function_call"]["name"],
            "content": responseMessages["function_call"]["arguments"],
        })
        // console.log('here2')
        // console.log(conversationResponse)
    }

    return conversationResponse
}

async function findLocationDetails(prompt) {
    let locationID = null
    try {
        let response = await initConversation(prompt)
        let content = response.content        
        if ( response.function_call !== undefined && response.function_call.name === "getLocation" ) {
            locationID = JSON.parse(response.function_call?.arguments).location
            if ( locationID !== null ) {
               let functionName = response.function_call.name
               response = await runLocationConversation(locationID, response.messages, functionName)
               content = response.data.choices[0].message.content
            }
        }
        console.log('location', locationID)
        return {locationID: locationID, message: content}
    } catch(err) {
        console.log(err)
    }
}

function getMetric(metric, range, locationID) {
    // if ( range !== undefined ) {
    //     console.log('range', range)
    // }

    if ( metric.match(/rep.* score/ig) || metric.match(/score/ig) )
        return getRepScore(locationID, range)
    else if ( metric.match(/rating.*/ig) ) 
        return getRatings(locationID, range)
    else if ( metric.match(/page.* view.*/ig) )
        return getAggregatePageMetrics(locationID, range)
    else
        return {error: "Metric not found"}
}

async function doConversation(prompt, locationID, messages) {
    if ( locationID == null ) {
        // console.log('locationID is null')
        return await findLocationDetails(prompt);
    }
    messages.push(...context)
    messages.push({role: "user", content: prompt})    
    let conversationResponse = {}
    conversationResponse.messages = messages    
    const functions = [
        {
            name: "getMetric",
            description: "Find out what users wants to find for his location",
            parameters: {
                type: "object",
                properties: {
                    metric: {
                        type: "string",
                        description: "The metric eg. score, reputation score, rep score, google reviews, publishing, listing accuracy etc.",
                    },
                    range: {
                        type: "string",
                        description: "The range of the metric eg. last 30 days, last 7 days, last 90 days, previous month, previous quarter, previous year, current quarter, current month, current year etc."
                    }
                },
                required: ["metric"],
            }
        }
    ]
    // console.log('call gpt to getLocation')
    let response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        functions: functions,
        function_call: "auto"
    });
    const responseMessages = response.data.choices[0].message
    // console.log('call function?', responseMessages)
    conversationResponse.content = responseMessages.content
    let content = conversationResponse.content        

    if ( responseMessages.function_call !== undefined ) {
        //console.log('here')
        //console.log(conversationResponse)
        conversationResponse.metric = JSON.parse(responseMessages.function_call?.arguments).metric
        conversationResponse.range = JSON.parse(responseMessages.function_call?.arguments).range
        if ( conversationResponse.metric !== null ) {
           conversationResponse.function_call = responseMessages.function_call
        }
        // console.log('here2')
        // console.log(conversationResponse)
    }
    let functionName = conversationResponse.function_call?.name
    let functionToCall = availableFunctions[functionName]
    if ( functionToCall !== undefined && functionName === "getMetric" ) {
        //console.log('here3', conversationResponse)
        let functionResponse = await functionToCall(conversationResponse.metric, conversationResponse.range, locationID)
        messages.push({"role": responseMessages["role"],"name": responseMessages["function_call"]["name"],
                "content": responseMessages["function_call"]["arguments"],
            })
        console.log(JSON.stringify(functionResponse))
        messages.push({role: "function", name:functionName, content: JSON.stringify(functionResponse)})
        // console.log(messages)
        const response2 = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages
        })
        //console.log(response2)
        content = response2.data.choices[0].message.content
        // console.log(content)
    }
    return {message: content}
}


module.exports = { findLocationDetails, doConversation }



