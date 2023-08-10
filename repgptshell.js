// import chalk from 'chalk';
// import prompts from 'prompts';
//const prompt = require('prompt-sync')({sigint: true});
const prompts = require('prompts');
const chalk = require('chalk')

const { findLocationDetails, doConversation } = require('./repgpt.js');
const { convertRange } = require('./converters.js');
let locationID = null

//let qtn = prompt('Which location do you manage? ')
// findLocationDetails(qtn).then((response) => {
//     console.log(response.message)
// })


// doConversation('Provide my rep score please?', '0053', []).then((response) => {
//     console.log('SUCCESS', response)
// }).catch((err) => {
//     console.log(err)
// })




//prompts.inject([ '@terkelg', ['#ff0000', '#0000ff'] ]);

const gpt = async () => {
    const onCancel = prompt => {
        console.log(chalk.bgGreen.white.bold('Thank you for using RepGPT!'));
        return false;
    }

    const response = await prompts([
        {
          type: 'text',
          name: 'userInput',
          message: `How can I help today?`
        }], { onCancel });
    return response
}

const runPrompt = async () => {
    let userResponse = true 
    while ( userResponse ) {
        userResponse = await gpt();
        // console.log(userResponse)
        if ( userResponse === false || Object.keys(userResponse).length === 0 )
            break;
    
        try {
            const gptRepsonse = await doConversation(userResponse.userInput, locationID, []);
            if ( locationID === null )
                locationID = gptRepsonse.locationID
            console.log(chalk.bgBlue.yellowBright.underline.bold(gptRepsonse.message));
        } catch(err) {
            console.log(err)
        }
        userResponse = true
    }
}
console.log(chalk.bgBlue.white.bold('=========================================================='))
console.log(chalk.bgHex('#DEADED').underline.bold('Welcome to RepGT!'))
console.log(chalk.bgBlue.white.bold('=========================================================='))
runPrompt()
const runDebugPrompt = async () => {
    let gptResponse = await doConversation('Provide my ratings in current quarter?', '0053', []);
    console.log(chalk.bgBlue.yellowBright.underline.bold(JSON.stringify(gptResponse)));

    gptResponse = await doConversation('Provide my ratings for today?', '0053', []);
    console.log(chalk.bgBlue.yellowBright.underline.bold(JSON.stringify(gptResponse)));

    gptResponse = await doConversation('Provide my ratings for yesterday?', '0053', []);
    console.log(chalk.bgBlue.yellowBright.underline.bold(JSON.stringify(gptResponse)));

    gptResponse = await doConversation('what are my current month ratings?', '0053', []);
    console.log(chalk.bgBlue.yellowBright.underline.bold(JSON.stringify(gptResponse)));

    gptResponse = await doConversation('Current year what are my ratings?', '0053', []);
    console.log(chalk.bgBlue.yellowBright.underline.bold(JSON.stringify(gptResponse)));

    gptResponse = await doConversation('what about previous  year what are my ratings?', '0053', []);
    console.log(chalk.bgBlue.yellowBright.underline.bold(JSON.stringify(gptResponse)));

}
//runDebugPrompt()
//console.log(convertRange('last 3 days'));





