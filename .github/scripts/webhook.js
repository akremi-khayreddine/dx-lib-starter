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
* Set Current JOB
*/
let JOB = {
   name: process.env.JOB_NAME,
   status: process.env.JOB_STATUS,
   next: process.env.NEXT_JOB,
   completed_at: new Date()
};
/**
* Set Webhook payload
*/
let webhook_payload = {
   webhook_id: WEBHOOK_ID,
   run_id: RUN_ID,
   trigger: TRIGGER, 
   context: CONTEXT,
   payload: process.env.JOB_PAYLOAD
};

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
      webhook_payload = { ...webhook_payload, jobs };
      console.log(webhook_payload);
     }).catch((error) => {
      console.log(error);
     });
