/*
This is a sample for invoking Corticon decision service rules from a Node application.

How to use:
You need to define a file called payload.json containing the decision service request.
You can export the data from Corticon rule tester. To do so, open the ert file and choose the following menu option:
Rulesheet->RuleTest -> Data -> Input -> Export Request JSON

*/

// We import filesystem as we will read the payload from a file and write the results to a file
const fs = require('fs');

// We import the bundle you created with the Corticon command "Package Rules for Deployment" (on Project menu)
const decisionService = require('./decisionServiceBundle');

// Execute the decision service for this payload and place results in file
runDecisionService('payload.json', 'result.json');

async function runDecisionService(payloadFileName,resultFileName) {
    const payload = readPayload(payloadFileName);

    // This is where you specify various configuration attributes
    // Note: Errors are always logged no matter what configuration you specify
    // logLevel: 0: only error gets logged (default), 1: debugging info gets logged
    // logIsOn: when false, do not log. True by default, you can override dynamically to log data only for certain calls (for example by checking for a specific payload)
    // logPerfData: when true, will log performance data
    // logFunction: Used to implement your own logger.  When defined this function is called with a string message to log and an error level.
    const configuration = { logLevel: 0 };
    //const configuration = { logLevel: 1, logIsOn: isLogOnForThisPayload(body), logFunction: myLogger};
	
	/*
	*******************************************************
	Configuration Properties for Rule Messages
	*******************************************************
	/*const configuration = {
		logLevel: 0,
		ruleMessages: {
			logRuleMessages: false, // If true the rule messages will be logged to console
			executionProperties: {
						restrictInfoRuleMessages: true, // If true Restricts Info Rule Messages
						restrictWarningRuleMessages: true, // If true Restricts Warning Rule Messages
						restrictViolationRuleMessages: true, // If true Restricts Violation Rule Messages
						restrictResponseToRuleMessagesOnly: true, // If true the response returned has only rule messages
			},
		},

	};*/

    // Here we invoke the rules
    const result = await decisionService.execute(payload, configuration);
    /*
    // Here is how you can check if there were any errors executing the rules.
    // (if you needed to do some additional processing before sending the response back to the client)
    	if(result.corticon.status === 'error') {
			// you can access a description of the error like this:
			result.corticon.description
		}
    */

    // Write the result to a file.
    let data = JSON.stringify(result, null, 2);
    fs.writeFileSync(resultFileName, data);
}

function readPayload (fileName) {
    // Read the payload from the file system
    const rawData = fs.readFileSync(fileName);
    return JSON.parse(rawData);
}


/*
 This is a sample of the function where you can override dynamically when to log data.
 It is useful for tracing only certain calls (for example by checking for a specific payload)
 This function is optional.  When you pass a simple configuration without the logIsOn property you don't need
 to define this function.
 */
function isLogOnForThisPayload(payload) {
    let flag;
    try {
        if ( payload.Objects[0]['int1'] === 1 )
            flag = true;
        else
            flag = false;
    }
    catch ( e ) {
        console.log (`Error in isLogOnForThisPayload: ${e}\n`);
        flag = true;
    }

    console.log(`isLogOnForThisPayload: ${flag}\n`);
    return flag;
}

/*
Here is a sample custom logger.  Adapt to your own need.
logLevel:
    1: log error
    2: log debug data
 */
function myLogger(msg, logLevel) {
    if ( logLevel === 0 )
        console.error(`**CUSTOM ERROR LOGGER: ${msg}`);
    else
        console.info(`**CUSTOM DEBUG LOGGER: ${msg}`);
}
