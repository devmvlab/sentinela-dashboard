import { useEffect, useState, useMemo } from "react";
import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
	getDocs,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useSentinelaData } from "../utils/SentinelaDataContext";

/* =========================
   HELPERS
========================= */

function getStartDate(period) {
	const now = new Date();

	if (period === "today") {
		now.setHours(0, 0, 0, 0);
		return now;
	}

	const daysMap = {
		"7d": 7,
		"30d": 30,
	};

	const days = daysMap[period] || 7;
	return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/* =========================
   HOOK
========================= */

export function useIncidents({
	period = "today",
	onlyEmergency = false,
	realtime = false,
}) {
	const [incidents, setIncidents] = useState([]);
	const [incidentHistory, setIncidentHistory] = useState([]);
	const [loadingIncidents, setLoadingIncidents] = useState(true);
	const [loadingHistory, setLoadingHistory] = useState(true);
	const [lastUpdate, setLastUpdate] = useState(null);

	const startDate = useMemo(() => getStartDate(period), [period]);

	const { user } = useSentinelaData();

	/* =========================
	   INCIDENTS
	========================= */
	useEffect(() => {
		if (!user?.cityId) return;

		setLoadingIncidents(true);

		let q = query(
			collection(db, "incidents"),
			where("geoloc.cityId", "==", user.cityId),
			where("createdAt", ">=", startDate),
			where("status", "!=", "cancelled"),
			orderBy("createdAt", "desc"),
		);

		if (onlyEmergency) {
			q = query(q, where("isEmergency", "==", true));
		}

		if (realtime) {
			const unsub = onSnapshot(q, (snap) => {
				const docs = snap.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setIncidents(docs);
				setLastUpdate(new Date());
				setLoadingIncidents(false);
			});

			return unsub;
		}

		getDocs(q).then((snap) => {
			const docs = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setIncidents(docs);
			setLastUpdate(new Date());
			setLoadingIncidents(false);
		});
	}, [user, startDate, onlyEmergency, realtime]);

	/* =========================
	   INCIDENT HISTORY
	========================= */
	useEffect(() => {
		if (!user?.cityId) return;

		setLoadingHistory(true);

		const q = query(
			collection(db, "incident_history"),
			where("cityId", "==", user.cityId),
			where("createdAt", ">=", startDate),
			orderBy("createdAt", "desc"),
		);

		if (realtime) {
			const unsub = onSnapshot(q, (snap) => {
				const docs = snap.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));

				setIncidentHistory(docs);
				setLoadingHistory(false);
			});

			return unsub;
		}

		getDocs(q).then((snap) => {
			const docs = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setIncidentHistory(docs);
			setLoadingHistory(false);
		});
	}, [user, startDate, realtime]);

	/* =========================
	   LOADING FINAL
	========================= */
	const loading = loadingIncidents || loadingHistory;

	return {
		incidents,
		incidentHistory,
		loading,
		lastUpdate,
	};
}
