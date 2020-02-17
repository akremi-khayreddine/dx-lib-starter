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
  TRIGGER = CONTEXT.event[CONTEXT.event_name] ? CONTEXT.event[CONTEXT.event_name] : CONTEXT.event;
}
/**
* Set Current JOB
*/
let CURRENT_JOB = {
   name: process.env.JOB_NAME,
   status: process.env.JOB_STATUS,
   completed_at: new Date()
};
let NEXT_JOB = null;
if (process.env.NEXT_JOB) {
   NEXT_JOB = {
      name: process.env.NEXT_JOB,
      started_at: new Date(),
      status: "in_progress"
   };
}
/**
*
*/
let PAYLOAD = null;
try {
   PAYLOAD = JSON.parse(process.env.JOB_PAYLOAD);
} catch(error) {
   console.log(error);
};
/**
* Set Webhook payload
*/
let webhook_payload = {
   webhook_id: WEBHOOK_ID,
   run_id: RUN_ID,
   trigger: TRIGGER, 
   context: CONTEXT,
   payload: PAYLOAD
};

db.collection("webhooks")
    .doc(WEBHOOK_ID)
    .get()
    .then(querySnapshot => {
      const webhook = querySnapshot.data();
      let jobs = NEXT_JOB ? [CURRENT_JOB, NEXT_JOB] : [CURRENT_JOB];
      if (webhook && webhook.run_id === RUN_ID) {
        const LAST_JOB = jobs.find(job => job.status === "in_progress");
        CURRENT_JOB = { ...CURRENT_JOB, started_at: LAST_JOB ? LAST_JOB.started_at : null };
        jobs = [CURRENT_JOB, NEXT_JOB];
        jobs = webhook.jobs ? [...webhook.jobs.filter(job => job.status !== "in_progress"), ...jobs] : [...jobs];
      }
      webhook_payload = { ...webhook_payload, jobs };
      db.collection("webhooks")
        .doc(WEBHOOK_ID)
        .set(webhook_payload)
        .then(result => {
          console.log("Success !");
        })
        .catch(error => {
          console.log("Failed");
        });
     }).catch((error) => {
      console.log(error);
     });
