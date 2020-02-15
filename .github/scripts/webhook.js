const https = require('https')
   
/**
* Github context
*/
let CONTEXT = JSON.parse(process.env.CONTEXT);
/**
* Get run id
*/
let RUN_ID = CONTEXT.run_id;
/**
* If we pass a TRIGGER then use it else use Github event name
*/
let TRIGGER = process.env.TRIGGER ? process.env.TRIGGER : CONTEXT.event_name;
/**
* If we pass a TRIGGER_ID then use it else extract it from GITHUB context
*/
let TRIGGER_ID;
if(TRIGGER === "pull_request") {
  TRIGGER_ID = CONTEXT.event[CONTEXT.event_name].number;
} else if (TRIGGER === "repository_dispatch") {
  TRIGGER_ID = CONTEXT.event.client_payload.release ? CONTEXT.event.client_payload.release : CONTEXT.event.client_payload.version;
} else {
  TRIGGER_ID = CONTEXT.event[CONTEXT.event_name].id;
}
TRIGGER_ID = process.env.TRIGGER_ID ? process.env.TRIGGER_ID : TRIGGER_ID;
/**
* Get OUTPUT
*/
let OUTPUT_ID;
let OUTPUT;
if (process.env.RELEASE) {
  OUTPUT = "release";
  OUTPUT = process.env.RELEASE;
}
if (process.env.VERSION) {
  OUTPUT = "version";
  OUTPUT_ID = process.env.VERSION;
}
OUTPUT = process.env.OUTPUT ? process.env.OUTPUT : OUTPUT;
OUTPUT_ID = process.env.OUTPUT_ID ? process.env.OUTPUT_ID : OUTPUT_ID;
/**
* Set WORKFLOW_ID
*/
let WORKFLOW_ID = process.env.WORKFLOW_ID ? process.env.WORKFLOW_ID : CONTEXT.event.repository.name + "-" + CONTEXT.workflow;
/**
* 
*/
let WEBHOOK_URL = "https://us-central1-locatus-test.cloudfunctions.net/checkSuite";
/**
*
*/
let JOB = process.env.JOB;

const payload = "{'run_id': '"+RUN_ID+"', 'trigger': '"+TRIGGER+"', 'trigger_id': '"+TRIGGER_ID+"', 'output': '"+OUTPUT+"', 'output_id': '"+OUTPUT_ID+"', 'repository': '"+WORKFLOW_ID+"', 'job': "+JOB+"}";

const data =  "{\"data\": \"" + payload + "\"}";

const options = {
  hostname: 'us-central1-locatus-test.cloudfunctions.net',
  path: '/checkSuite',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', (d) => {
    process.stdout.write(d)
  })
})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()
