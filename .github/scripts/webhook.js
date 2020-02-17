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
*
*/
let REPOSITORY = CONTEXT.event.repository;
/**
* Set Workflow trigger data
*/
let EVENT_NAME =  CONTEXT.event_name;
let EVENT_PAYLOAD;
if(EVENT_NAME === "repository_dispatch") {
  EVENT_PAYLOAD =  CONTEXT.event.client_payload;
} else {
  EVENT_PAYLOAD = CONTEXT.event[EVENT_NAME] ? CONTEXT.event[EVENT_NAME] : CONTEXT.event;
}
/**
* Set Current JOB
*/
let CURRENT_JOB = {
   name: process.env.JOB_NAME,
   status: process.env.JOB_STATUS,
   conclusion: process.env.JOB_STATUS,
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
   if (process.env.JOB_PAYLOAD) {
      PAYLOAD = JSON.parse(process.env.JOB_PAYLOAD);
   }
} catch(error) {
   console.log(error);
};
/**
* Set Webhook payload
*/
let webhook_payload = {
   webhook_id: WEBHOOK_ID,
   run_id: RUN_ID,
   repository: REPOSITORY,
   event_name: EVENT_NAME, 
   event_payload: EVENT_PAYLOAD,
   context: CONTEXT,
   payload: PAYLOAD,
   started_at: new Date(),
   completed_at: null
};

db.collection("webhooks")
    .doc(WEBHOOK_ID)
    .get()
    .then(querySnapshot => {
      const webhook = querySnapshot.data();
      let jobs = NEXT_JOB ? [CURRENT_JOB, NEXT_JOB] : [CURRENT_JOB];
      if (webhook && webhook.run_id === RUN_ID) {
        const LAST_JOB = webhook.jobs.find(job => job.status === "in_progress");
        CURRENT_JOB = { ...CURRENT_JOB, started_at: LAST_JOB ? LAST_JOB.started_at : null };
        jobs = NEXT_JOB ? [CURRENT_JOB, NEXT_JOB] : [CURRENT_JOB];
        jobs = webhook.jobs ? [...webhook.jobs.filter(job => job.status !== "in_progress"), ...jobs] : [...jobs];
        if (webhook.started_at) {
            webhook_payload.started_at = webhook.started_at;
        }
        if (!NEXT_JOB){
            webhook_payload.completed_at = new Date();
        }
      } else {
         sendNotification(CONTEXT.workflow, EVENT_NAME);
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


sendNotification = (workflow, event_name) => {
    let messaging = admin.messaging();
    db.collection("users")
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                doc.data();
                messaging.sendToDevice(doc.data().fcmToken, {
                    notification: {
                        title: event_name,
                        body: "Workflow " + workflow + " est en cours d'exécution"
                    }
                });
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
};
