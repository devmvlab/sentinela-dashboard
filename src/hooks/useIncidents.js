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
	Timestamp,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "./useAuth";

/* =========================
   HELPERS
========================= */

function getDayRange(dateString) {
	if (!dateString) return null;

	const start = new Date(`${dateString}T00:00:00`);
	const end = new Date(`${dateString}T23:59:59`);

	return {
		start: Timestamp.fromDate(start),
		end: Timestamp.fromDate(end),
	};
}

function buildCommonConstraints({
	cityId,
	status,
	category,
	type,
	isEmergency,
	dateRange,
}) {
	const constraints = [
		where("geoloc.cityId", "==", cityId),
		orderBy("createdAt", "desc"),
	];

	if (status && status !== "all") {
		constraints.push(where("status", "==", status));
	}

	if (category) {
		constraints.push(where("ocorrencia.categoria", "==", category));
	}

	if (type) {
		constraints.push(where("ocorrencia.tipo", "==", type));
	}

	if (isEmergency === "true") {
		constraints.push(where("isEmergency", "==", true));
	}

	if (isEmergency === "false") {
		constraints.push(where("isEmergency", "==", false));
	}

	if (dateRange?.start) {
		constraints.push(where("createdAt", ">=", dateRange.start));
	}

	if (dateRange?.end) {
		constraints.push(where("createdAt", "<=", dateRange.end));
	}

	return constraints;
}

function buildHistoryConstraints({ cityId, dateRange }) {
	const constraints = [
		where("cityId", "==", cityId),
		where("fromStatus", "in", ["accepted", "in_progress"]), //talvez refatorar no futuro
		where("toStatus", "in", ["in_progress", "resolved"]), //talvez refatorar no futuro
		orderBy("createdAt", "desc"),
	];

	if (dateRange?.start) {
		constraints.push(where("createdAt", ">=", dateRange.start));
	}

	if (dateRange?.end) {
		constraints.push(where("createdAt", "<=", dateRange.end));
	}

	return constraints;
}

/* =========================
   HOOK
========================= */

export function useIncidents({
	status = "all",
	category = "",
	type = "",
	isEmergency = "",
	startDate = null,
	endDate = null,
	page = 0,
	pageSize = 10,
	cityId,
	realtime = false,
} = {}) {
	const { cityId: userCityId, incidentTypes } = useAuth();

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

	const resolvedCityId = cityId ?? userCityId;

	const dateRange = useMemo(() => {
		if (!startDate && !endDate) return null;

		return {
			start: startDate ? getDayRange(startDate)?.start : null,
			end: endDate ? getDayRange(endDate)?.end : null,
		};
	}, [startDate, endDate]);

	/* =========================
	   BUILD INCIDENT QUERY
	========================= */
	const buildIncidentQuery = () => {
		const constraints = buildCommonConstraints({
			cityId: resolvedCityId,
			status,
			category,
			type,
			isEmergency,
			dateRange,
		});

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
		isEmergency,
		startDate,
		endDate,
		resolvedCityId,
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
		isEmergency,
		startDate,
		endDate,
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
		isEmergency,
		startDate,
		endDate,
		resolvedCityId,
	]);

	/* =========================
	   INCIDENT HISTORY (ALINHADO)
	========================= */
	useEffect(() => {
		if (!resolvedCityId) return;

		setLoadingHistory(true);

		const constraints = buildHistoryConstraints({
			cityId: resolvedCityId,
			dateRange,
		});

		const q = query(collection(db, "incident_history"), ...constraints);

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
	}, [startDate, endDate, resolvedCityId, realtime]);

	/* =========================
	   LOCAL UPDATE
	========================= */
	function updateIncidentStatus(id, newStatus) {
		setIncidents((prev) =>
			prev.map((inc) =>
				inc.id === id ? { ...inc, status: newStatus } : inc,
			),
		);
	}

	/* =========================
	   PERMISSION FILTER
	========================= */
	const filteredByPermission = useMemo(() => {
		if (!Array.isArray(incidentTypes) || incidentTypes.length === 0) {
			return [];
		}

		return incidents.filter((inc) =>
			incidentTypes.includes(inc.ocorrencia?.tipo),
		);
	}, [incidents, incidentTypes]);

	const totalVisible = filteredByPermission.length;

	/* =========================
	   FINAL
	========================= */
	return {
		incidents: filteredByPermission,
		incidentHistory,
		total,
		totalVisible,
		loading: loadingIncidents || loadingHistory,
		lastUpdate,
		updateIncidentStatus,
	};
}
