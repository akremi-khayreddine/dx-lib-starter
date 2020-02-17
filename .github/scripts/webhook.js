const admin = require('firebase-admin');  
var serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locatus-test.firebaseio.com"
});

const db = admin.firestore();
/**
* Github context
*/
let CONTEXT = JSON.parse(process.env.GITHUB_CONTEXT);
/**
* Get run id
*/
let RUN_ID = CONTEXT.run_id;
/**
* Set WEBHOOK_ID
*/
let WEBHOOK_ID = CONTEXT.event.repository.name + "-" + CONTEXT.workflow;
/**
* Set Workflow trigger data
*/
let TRIGGER;
if(CONTEXT.event_name === "repository_dispatch") {
  TRIGGER =  CONTEXT.event.client_payload;
} else {
  TRIGGER = CONTEXT.event[CONTEXT.event_name];
}
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
   webhook_id: WEBHOOK_ID,
   job: JOB,
   context: CONTEXT,
   payload: JOB_PAYLOAD
};

console.log(payload);

db.collection("webhooks")
    .doc(WEBHOOK_ID)
    .get()
    .then(querySnapshot => {
      const webhook = querySnapshot.data();
      let jobs = [];
      if (webhook && webhook.run_id === RUN_ID) {
        jobs = webhook.jobs ? [...webhook.jobs, JOB] : [JOB];
      } else {
        jobs = [JOB];
      }
      console.log(jobs);
     }).catch((error) => {
      console.log(error);
     });
