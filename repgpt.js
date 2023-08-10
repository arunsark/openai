
const { Configuration, OpenAIApi } = require("openai");
const { getLocation, getRepScore, getRatings, getAggregatePageMetrics } = require("./repapi4gpt.js")


const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY})
const openai = new OpenAIApi(configuration)

const context = [
    {"role": "system", "content": "Assistant is an intelligent chatbot designed to help the store manager answer question related to their store. e.g. What's my rep score? What's my score? What's my Reputation score? etc."},
    {"role": "system", "content": "Don't make assumptions about what values to use with functions. Ask for clarification if a user request is ambiguous."},
    {"role": "system", "content": "Assistant is an intelligent chatbot designed to help the store/location manager find details about his location"}
]
const availableFunctions = { "getLocation": getLocation, "getMetric": getMetric } 

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
    },
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
];

function getMetric(metric, range, locationID) {
    if ( metric.match(/rep.* score/ig) || metric.match(/score/ig) )
        return getRepScore(locationID, range)
    else if ( metric.match(/.*rating.*/ig) ) 
        return getRatings(locationID, range)
    else if ( metric.match(/page.* view.*/ig) )
        return getAggregatePageMetrics(locationID, range)
    else
        return {error: "Metric not found"}
}

const startConversation = async function(messages) {
//    console.log('call gpt to getChatCompletion')
    let response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        functions: functions,
        function_call: "auto"
    });
    
    let gptMsg = response.data.choices[0].message
  //  console.log('gptMsg', JSON.stringify(gptMsg));
    return gptMsg;
}

const followupConversation = async function(messages) {
    const response2 = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages
    });
    return response2.data.choices[0].message.content;
}

const executeFunction = async function(functionName, functionToCall, functionParameters, locationID) {
    let response = {}
    if ( functionName == "getMetric") {
        let metric = functionParameters.metric
        let range = functionParameters.range
        response.functionResponse = await functionToCall(metric, range, locationID);
        response.locationID = locationID
    }
    if ( functionName == "getLocation") {
        response.locationID = functionParameters.location
        response.functionResponse = await functionToCall(response.locationID);
    }
    return response
}

async function doConversation(prompt, locationID, messages) {
    messages.push(...context)
    messages.push({role: "user", content: prompt})    

    let response = await startConversation(messages)
    let content = response.content

    if ( response.function_call !== undefined && availableFunctions[response.function_call.name] !== undefined ) {
        let functionResponse = await executeFunction(response.function_call.name, availableFunctions[response.function_call.name], JSON.parse(response.function_call.arguments), locationID)
//        console.log('functionResponse', JSON.stringify(functionResponse))
        messages.push({role: response.role, name: response.function_call.name, content: response.function_call.arguments})
        messages.push({role: "function", name: response.function_call.name, content: JSON.stringify(functionResponse.functionResponse)})
        locationID = functionResponse.locationID
        content = await followupConversation(messages)
    }
    return {message: content, location: locationID};
    // let conversationResponse = {}
    // conversationResponse.messages = messages    
    // console.log('call gpt to getChatCompletion')
    // let response = await openai.createChatCompletion({
    //     model: "gpt-3.5-turbo",
    //     messages: messages,
    //     functions: functions,
    //     function_call: "auto"
    // });
    // const responseMessages = response.data.choices[0].message
    // console.log('call function?', responseMessages)
    // let content = responseMessages.content      
    // let functionName = responseMessages.function_call?.name
    // let functionToCall = availableFunctions[functionName]
    // console.log('functionToCall', functionToCall)
    // console.log('functionName', functionName)
    // if ( functionToCall !== undefined ) {
        
    //     let functionResponse = {}

    //     if ( functionName == "getMetric") {
    //         conversationResponse.metric = JSON.parse(responseMessages.function_call?.arguments).metric
    //         conversationResponse.range = JSON.parse(responseMessages.function_call?.arguments).range
    //         if ( conversationResponse.metric !== null ) {
    //             conversationResponse.function_call = responseMessages.function_call
    //         }
    //         functionResponse = await functionToCall(conversationResponse.metric, conversationResponse.range, locationID);
    //     } else if ( functionName == "getLocation") {
    //         conversationResponse.locationID = JSON.parse(responseMessages.function_call?.arguments).location
    //         if ( conversationResponse.locationID !== null ) {
    //            conversationResponse.function_call = responseMessages.function_call
    //         }
    //         functionResponse = await functionToCall(conversationResponse.locationID);
    //         locationID = conversationResponse.locationID
    //     }
    //     console.log('here3', conversationResponse)
    //     console.log('here4', functionResponse)
            
    //     messages.push({"role": responseMessages["role"],"name": responseMessages["function_call"]["name"],
    //             "content": responseMessages["function_call"]["arguments"],
    //         })
    //     console.log(JSON.stringify(functionResponse))
    //     messages.push({role: "function", name:functionName, content: JSON.stringify(functionResponse)})
    //     // console.log(messages)
    //     const response2 = await openai.createChatCompletion({
    //         model: "gpt-3.5-turbo",
    //         messages: messages
    //     })
    //     //console.log(response2)
    //     content = response2.data.choices[0].message.content
    //     // console.log(content)
    // }
    // return {message: content, location: locationID}
}



module.exports = { doConversation }


/*
async function doConversation(prompt, locationID, messages) {
    messages.push(...context)
    messages.push({role: "user", content: prompt})    
    let conversationResponse = {}
    conversationResponse.messages = messages    
    console.log('call gpt to getChatCompletion')
    let response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        functions: functions,
        function_call: "auto"
    });
    const responseMessages = response.data.choices[0].message
    console.log('call function?', responseMessages)
    let content = responseMessages.content      
    let functionName = responseMessages.function_call?.name
    let functionToCall = availableFunctions[functionName]
    console.log('functionToCall', functionToCall)
    console.log('functionName', functionName)
    if ( functionToCall !== undefined ) {
        
        let functionResponse = {}

        if ( functionName == "getMetric") {
            conversationResponse.metric = JSON.parse(responseMessages.function_call?.arguments).metric
            conversationResponse.range = JSON.parse(responseMessages.function_call?.arguments).range
            if ( conversationResponse.metric !== null ) {
                conversationResponse.function_call = responseMessages.function_call
            }
            functionResponse = await functionToCall(conversationResponse.metric, conversationResponse.range, locationID);
        } else if ( functionName == "getLocation") {
            conversationResponse.locationID = JSON.parse(responseMessages.function_call?.arguments).location
            if ( conversationResponse.locationID !== null ) {
               conversationResponse.function_call = responseMessages.function_call
            }
            functionResponse = await functionToCall(conversationResponse.locationID);
            locationID = conversationResponse.locationID
        }
        console.log('here3', conversationResponse)
        console.log('here4', functionResponse)
            
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
    return {message: content, location: locationID}
}

*/

