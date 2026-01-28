import {
	doc,
	writeBatch,
	collection,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Atualiza o status da ocorrência e cria um histórico imutável
 */
export async function updateIncidentWithHistory({
	incident,
	newStatus,
	reason,
	user,
}) {
	const batch = writeBatch(db);

	const incidentRef = doc(db, "incidents", incident.id);
	const historyRef = doc(collection(db, "incident_history"));

	// Atualiza a ocorrência
	batch.update(incidentRef, {
		status: newStatus,
		responsible: user.displayName,
		updatedAt: serverTimestamp(),
	});

	// Cria histórico (sempre novo)
	batch.set(historyRef, {
		incidentId: incident.id,
		fromStatus: incident.status,
		toStatus: newStatus,
		reason: reason || null,
		createdBy: {
			id: user.uid,
			name: user.displayName,
		},
		createdAt: serverTimestamp(),
	});

	await batch.commit();
}
