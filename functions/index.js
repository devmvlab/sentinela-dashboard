const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall } = require("firebase-functions/v2/https");
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

  // Busca TODOS usuários da cidade
  const usersSnapshot = await admin.firestore()
    .collection("users")
    .where("cityId", "==", cityId)
    .get();

  if (usersSnapshot.empty) {
    return { success: false, message: "Nenhum usuário encontrado" };
  }

  // Monta lista de mensagens
  const uniqueTokens = new Set();

    usersSnapshot.forEach(doc => {
      const user = doc.data();

      if (user.tokens && Array.isArray(user.tokens)) {
        user.tokens.forEach(token => {
          if (token && token.startsWith("ExponentPushToken")) {
            uniqueTokens.add(token);
          }
        });
      }
    });

  const messages = Array.from(uniqueTokens).map(token => ({
    to: token,
    sound: "default",
    title,
    body: message
  }));

  if (messages.length === 0) {
    return { success: false, message: "Nenhum token válido" };
  }

  // Expo aceita até 100 por request → precisamos dividir
  const chunkSize = 100;
  const chunks = [];

  for (let i = 0; i < messages.length; i += chunkSize) {
    chunks.push(messages.slice(i, i + chunkSize));
  }

  // Envia todos os lotes
  const results = [];

  for (const chunk of chunks) {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(chunk)
    });

    const result = await response.json();
    results.push(result);
  }

  return {
    success: true,
    totalUsers: messages.length,
    batches: chunks.length,
    expoResponse: results
  };
});