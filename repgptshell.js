
const prompt = require('prompt-sync')({sigint: true});
const { findLocationDetails, doConversation } = require('./repgpt.js')

let qtn = prompt('Which location do you manage? ')
// findLocationDetails(qtn).then((response) => {
//     console.log(response.message)
// })


doConversation('What is my Reputation Score?', '0055', []).then((response) => {
    console.log('SUCCESS', response)
}).catch((err) => {
    console.log(err)
})

