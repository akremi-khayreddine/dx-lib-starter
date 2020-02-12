const https = require('https')
  
let RUN_ID = process.env.RUN_ID;
let TRIGGER = process.env.TRIGGER;
let TRIGGER_ID = process.env.TRIGGER_ID;
let OUTPUT = process.env.OUTPUT ? process.env.OUTPUT : null;
let OUTPUT_ID = process.env.OUTPUT_ID ? process.env.OUTPUT_ID : null;
let WORKFLOW_ID = process.env.WORKFLOW_ID;
let WEBHOOK_URL = "https://us-central1-locatus-test.cloudfunctions.net/checkSuite";
let JOB = process.env.JOB;

const payload = "{'run_id': '"+RUN_ID+"', 'trigger': '"+TRIGGER+"', 'trigger_id': '"+TRIGGER_ID+"', 'output': '"+OUTPUT+"', 'output_id': '"+OUTPUT_ID+"', 'repository': '"+WORKFLOW_ID+"', 'job': "+JOB+"}";

const data =  "\"data\": \"" + payload + "\"";

console.log(data);

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
