const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

exports.sendPushNotification = onCall(async (request) => {

   if (!request.auth) {
    throw new Error("Usuário não autenticado");
  }

  const uid = request.auth.uid;

  const { title, message } = request.data;

  const userDoc = await admin.firestore()
    .collection("users")
    .doc(uid)
    .get();

  const user = userDoc.data();

  const cityId = user.cityId;
  const topic = `sentinela_${cityId}`;

  const payload = {
    data: {
      title: title,
      body: message
    },
    topic
  };

  await admin.messaging().send(payload);

  return {
    success: true
  };

});