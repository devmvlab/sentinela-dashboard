const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({ maxInstances: 10 });

exports.sendPushNotification = onCall(async (request) => {

  if (!request.auth) {
    throw new Error("Usuário não autenticado");
  }

  const { title, message, cityId } = request.data;

  if (!cityId) {
    throw new Error("cityId é obrigatório");
  }

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
    success: true,
    topic: topic
  };
});