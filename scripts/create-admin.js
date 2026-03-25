/**
 * Script para criar usuário ADMIN (Prefeitura)
 * Protegido por senha mestra
 * Firebase Auth + Firestore
 */

require("dotenv").config();
const admin = require("firebase-admin");
const readline = require("readline-sync");
const fs = require("fs");

// ----------------------------
// Validação da senha do script
// ----------------------------
if (!process.env.ADMIN_SCRIPT_PASSWORD) {
	console.error("❌ ADMIN_SCRIPT_PASSWORD não definido no .env");
	process.exit(1);
}

const inputPassword = readline.question("Senha do script: ", {
	hideEchoBack: true,
});

if (inputPassword !== process.env.ADMIN_SCRIPT_PASSWORD) {
	console.error("❌ Senha incorreta");
	process.exit(1);
}

// ----------------------------
// Inicialização Firebase Admin
// ----------------------------

const path =
  process.env.ENV === "DEV"
    ? "./serviceAccountKeyDev.json"
    : "./serviceAccountKey.json";

const serviceAccount = JSON.parse(
  fs.readFileSync(path, "utf8")
);

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ----------------------------
// Entrada de dados
// ----------------------------
console.log("\n📍 Cadastro de Prefeitura (ADMIN)\n");

const displayName = readline.question("Nome da prefeitura (displayName): ");
const email = readline.questionEMail("Email institucional: ");
const password = readline.question("Senha do admin: ", {
	hideEchoBack: true,
});

const cityId = readline.question("City ID (ex: curitiba_pr): ");

const role = readline.question("Role (ex: ADMIN, SANEAMENTO): ", {
	defaultInput: "ADMIN",
});

const latitude = parseFloat(readline.question("Latitude (ex: -25.44123): "));

const longitude = parseFloat(readline.question("Longitude (ex: -49.28231): "));

// ----------------------------
// Criação do ADMIN
// ----------------------------
async function createAdmin() {
	try {
		// 1. Criar usuário no Auth
		const userRecord = await admin.auth().createUser({
			email,
			password,
			displayName,
			emailVerified: true,
		});

		// 2. Criar documento principal do usuário
		await db.collection("users").doc(userRecord.uid).set({
			cityId,
			coordinates: {
				latitude,
				longitude,
			},
			displayName,
			email,
			isAdmin: true,
			role: role,
			createdAt: admin.firestore.FieldValue.serverTimestamp(),
		});

		// 3. Criar subcollection settings/default (inicial)
		await db
			.collection("users")
			.doc(userRecord.uid)
			.collection("settings")
			.doc("default")
			.set({
				incidentTypes: [],
				updatedAt: admin.firestore.FieldValue.serverTimestamp(),
			});

		console.log("\n✅ Prefeitura ADMIN criada com sucesso!");
		console.log("UID:", userRecord.uid);
		console.log("City ID:", cityId);
	} catch (error) {
		console.error("\n❌ Erro ao criar ADMIN:");
		console.error(error.message);
	} finally {
		process.exit(0);
	}
}

createAdmin();
