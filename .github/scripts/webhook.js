const https = require('https'); 
const admin = require('firebase-admin');   

admin.initializeApp({
    apiKey: "AIzaSyAxREm93W0GQMgVr5R21BgEt-nno1IurQ0",
    authDomain: "locatus-test.firebaseapp.com",
    databaseURL: "https://locatus-test.firebaseio.com",
    projectId: "locatus-test",
    storageBucket: "locatus-test.appspot.com",
    messagingSenderId: "854825667857",
    appId: "1:854825667857:web:c18baf863e463899f050b0"
});
   
/**
* Github context
*/
let CONTEXT = JSON.parse(process.env.GITHUB_CONTEXT);
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
let OUTPUT_ID = "";
let OUTPUT = "";
if (process.env.RELEASE_ID) {
  OUTPUT = "release";
  OUTPUT_ID = process.env.RELEASE_ID;
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
db.collection("check_runs")
    .doc(WORKFLOW_ID)
    .get()
    .then(querySnapshot => {
      const run: any = querySnapshot.data();
      console.log(run);
     });
/**
* 
*/
let WEBHOOK_URL = "https://us-central1-locatus-test.cloudfunctions.net/checkSuite";
/**
*
*/
let JOB_NAME = process.env.JOB_NAME;
let JOB_STATUS = process.env.JOB_STATUS;
let JOB_TIME = new Date();
let NEXT_JOB = process.env.NEXT_JOB ? process.env.NEXT_JOB : "";
let JOB_PAYLOAD = process.env.JOB_PAYLOAD ? process.env.JOB_PAYLOAD : {};

let JOB = {
   name: JOB_NAME,
   status: JOB_STATUS,
   next: NEXT_JOB,
   completed_at: JOB_TIME
};

const payload = {
   run_id: RUN_ID,
   trigger: TRIGGER, 
   trigger_id: TRIGGER_ID, 
   repository: WORKFLOW_ID,
   job: JOB,
   context: CONTEXT,
   payload: JOB_PAYLOAD
};

const data =  JSON.stringify({data: payload });

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
