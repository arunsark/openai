const { Configuration, OpenAIApi } = require("openai");
const { getRepScore, getLocations, filterMainLocation, getLocation } = require("./util.js");

const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY})

const openai = new OpenAIApi(configuration);


const chatCompletion = async () => {
    try {
        res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "assistant", content: "Thali not at all tasty, no parking"}],
         });
      if ( res.data.choices === undefined ) {
        console.log("No response from GPT-3")
      } else {
        console.log(res.data.choices[0].message.content)
      }
    } catch(err) {
        if ( err.response ) {
            console.log(err.response.data)
        } else {
            console.log(err)
        }
      }
    };
  
//chatCompletion()
//getRepScore({location: "0053"}).then((res) => {console.log(res)})
let location = null
getLocations({"officeName": "PetSmart", "locality": "Sacramento", "region": "CA",  "postalCode": "95834"}).then((res) => {
    location = filterMainLocation(res.locations, "95834")
    console.log(location)
})

getLocation("0053").then((res) => console.log(res))

