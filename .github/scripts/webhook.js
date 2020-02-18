         /**
         *  Send Notifications to all users
         */
         let messaging = admin.messaging();
         db.collection("users")
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const user = doc.data();
               if (user.fcmToke) {
                   messaging.sendToDevice(user.fcmToken, {
                       notification: {
                           title: EVENT_NAME,
                           body: "Workflow " + CONTEXT.workflow + " est en cours d'exécution"
                       }
                   });
               }
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });
       /**
       *
       */
