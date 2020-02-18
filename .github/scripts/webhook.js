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
let WEBHOOK_PAYLOAD = {
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

/**
* To exit node process
* If we do not exit this script will contenu running forever
*/
let notificationComplete = false;
let doc_saved = false;

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
            WEBHOOK_PAYLOAD.started_at = webhook.started_at;
        }
        if (!NEXT_JOB){
            WEBHOOK_PAYLOAD.completed_at = new Date();
        }
      } else {
         sendNotification(EVENT_NAME, CONTEXT.workflow);
      }
      WEBHOOK_PAYLOAD = { ...WEBHOOK_PAYLOAD, jobs };
      saveDoc(WEBHOOK_ID, WEBHOOK_PAYLOAD);
     }).catch((error) => {
      console.log(error);
     });

/**
* Save Firebase doc
*/
saveDoc = (id, payload) => {
  db.collection("webhooks")
    .doc(id)
    .set(payload)
    .then(result => {
      console.log("Success !");
      doc_saved = true;
      if (notificationComplete) {
        process.exit(0);
      }
    })
    .catch(error => {
      console.log("Failed");
      doc_saved = true;
      if (notificationComplete) {
        process.exit(1);
      }
    });
};

/**
* Send notification
*/
sendNotification = (title, workflow) => {
  let messaging = admin.messaging();
  db.collection("users")
    .get()
    .then(querySnapshot => {
      const tokens = querySnapshot.docs
        .filter(doc => doc.data().fcmToken)
        .map(doc => doc.data().fcmToken);
      messaging
        .sendToDevice(tokens, {
          notification: {
            title,
            body: "Workflow " + workflow + " est en cours d'exécution"
          }
        })
        .then(result => {
          console.log("Notification sent");
          notificationComplete = true;
          if (doc_saved) {
            process.exit(0);
          }
        })
        .catch(error => {
          notificationComplete = true;
          if (doc_saved) {
            process.exit(0);
          }
          console.log("Error notification not sent");
        });
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });
};
