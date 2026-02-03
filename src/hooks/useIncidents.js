import { useEffect, useState, useMemo, useRef } from "react";
import {
	collection,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	getDocs,
	getCountFromServer,
	onSnapshot,
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
	status = "all",
	category = "",
	type = "",
	emergency = "",
	startDate = null,
	endDate = null,
	period = "today",
	page = 0,
	pageSize = 10,
	cityId,
	realtime = false,
} = {}) {
	const { user } = useSentinelaData();

	/* =========================
	   STATE
	========================= */
	const [incidents, setIncidents] = useState([]);
	const [incidentHistory, setIncidentHistory] = useState([]);
	const [loadingIncidents, setLoadingIncidents] = useState(true);
	const [loadingHistory, setLoadingHistory] = useState(true);
	const [total, setTotal] = useState(0);
	const [lastUpdate, setLastUpdate] = useState(null);

	const pageCursors = useRef({});

	const incidentStartDate = useMemo(() => {
		if (startDate) return startDate;
		return getStartDate(period);
	}, [startDate, period]);

	const historyStartDate = useMemo(() => getStartDate(period), [period]);

	const resolvedCityId = cityId ?? user?.cityId;

	/* =========================
	   BUILD INCIDENT QUERY
	========================= */
	const buildIncidentQuery = () => {
		let constraints = [
			where("geoloc.cityId", "==", resolvedCityId),
			orderBy("createdAt", "desc"),
		];

		/* STATUS */
		if (status && status !== "all") {
			constraints.push(where("status", "==", status));
		}

		/* CATEGORIA */
		if (category) {
			constraints.push(where("ocorrencia.categoria", "==", category));
		}

		/* TIPO */
		if (type) {
			constraints.push(where("ocorrencia.tipo", "==", type));
		}

		/* EMERGÊNCIA */
		if (emergency === "yes") {
			constraints.push(where("isEmergency", "==", true));
		}

		if (emergency === "no") {
			constraints.push(where("isEmergency", "==", false));
		}

		/* DATA (period como fallback) */
		if (incidentStartDate) {
			constraints.push(where("createdAt", ">=", incidentStartDate));
		}

		if (endDate) {
			constraints.push(where("createdAt", "<=", endDate));
		}

		return query(collection(db, "incidents"), ...constraints);
	};

	/* =========================
	   INCIDENTS → TOTAL COUNT
	========================= */
	useEffect(() => {
		if (!resolvedCityId) return;

		const fetchTotal = async () => {
			const q = buildIncidentQuery();
			const snap = await getCountFromServer(q);
			setTotal(snap.data().count);
		};

		fetchTotal();
	}, [
		status,
		category,
		type,
		emergency,
		startDate,
		endDate,
		period,
		page,
		pageSize,
		resolvedCityId,
		realtime,
	]);

	/* =========================
	   INCIDENTS → PAGINATED DATA
	========================= */
	useEffect(() => {
		if (!resolvedCityId) return;

		setLoadingIncidents(true);

		const fetchPage = async () => {
			const baseQuery = buildIncidentQuery();

			let q = query(baseQuery, limit(pageSize));

			if (page > 0 && pageCursors.current[page - 1]) {
				q = query(
					baseQuery,
					startAfter(pageCursors.current[page - 1]),
					limit(pageSize),
				);
			}

			if (realtime) {
				const unsub = onSnapshot(q, (snap) => {
					const docs = snap.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}));

					pageCursors.current[page] = snap.docs[snap.docs.length - 1];

					setIncidents(docs);
					setLastUpdate(new Date());
					setLoadingIncidents(false);
				});

				return unsub;
			}

			const snap = await getDocs(q);

			const docs = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			pageCursors.current[page] = snap.docs[snap.docs.length - 1];

			setIncidents(docs);
			setLastUpdate(new Date());
			setLoadingIncidents(false);
		};

		const unsub = fetchPage();
		return () => typeof unsub === "function" && unsub();
	}, [
		status,
		category,
		type,
		emergency,
		startDate,
		endDate,
		period,
		page,
		pageSize,
		resolvedCityId,
		realtime,
	]);

	/* =========================
	   RESET CURSORS ON FILTER CHANGE
	========================= */
	useEffect(() => {
		pageCursors.current = {};
	}, [
		status,
		category,
		type,
		emergency,
		startDate,
		endDate,
		period,
		page,
		pageSize,
		resolvedCityId,
		realtime,
	]);

	/* =========================
	   INCIDENT HISTORY (INALTERADO)
	========================= */
	useEffect(() => {
		if (!resolvedCityId) return;

		setLoadingHistory(true);

		const q = query(
			collection(db, "incident_history"),
			where("cityId", "==", resolvedCityId),
			where("createdAt", ">=", historyStartDate),
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
	}, [
		status,
		category,
		type,
		emergency,
		startDate,
		endDate,
		period,
		page,
		pageSize,
		resolvedCityId,
		realtime,
	]);

	/* =========================
	   FINAL
	========================= */
	return {
		incidents,
		incidentHistory,
		total,
		loading: loadingIncidents || loadingHistory,
		lastUpdate,
	};
}
