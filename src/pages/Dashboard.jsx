import { useEffect, useState, useMemo } from "react";
import {
	Grid,
	Typography,
	Box,
	ToggleButton,
	ToggleButtonGroup,
	Fade,
} from "@mui/material";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import TaskIcon from "@mui/icons-material/Task";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import MapIcon from "@mui/icons-material/Map";

import CategoryChart from "../components/CategoryChart";
import StatusChart from "../components/StatusChart";
import DistrictChart from "../components/DistrictChart";
import PeakHourChart from "../components/PeakHourChart";
import IncidentsMap from "./IncidentsMap";
import SafetyCard from "../components/SafetyCard";
import EmergencyPieChart from "../components/EmergencyPieChart";
import { buildAverageResponseTimeData } from "../utils/utils";

import { useIncidents } from "../hooks/useIncidents";
import { useUsersByCity } from "../hooks/useUsersByCity";

import CustomCard from "../components/CustomCard";
import AverageResponseTimeChart from "../components/AverageResponseTimeChart";
import { useAuth } from "../hooks/useAuth";

/* =======================
   FAIXAS DE HORÁRIO
======================= */
const hourRanges = [
	{ label: "00–02h", start: 0, end: 2 },
	{ label: "02–04h", start: 2, end: 4 },
	{ label: "04–06h", start: 4, end: 6 },
	{ label: "06–08h", start: 6, end: 8 },
	{ label: "08–10h", start: 8, end: 10 },
	{ label: "10–12h", start: 10, end: 12 },
	{ label: "12–14h", start: 12, end: 14 },
	{ label: "14–16h", start: 14, end: 16 },
	{ label: "16–18h", start: 16, end: 18 },
	{ label: "18–20h", start: 18, end: 20 },
	{ label: "20–22h", start: 20, end: 22 },
	{ label: "22–24h", start: 22, end: 24 },
];

const buildPeakHourData = (incidents) => {
	const data = hourRanges.map((r) => ({ hour: r.label, total: 0 }));

	incidents.forEach((incident) => {
		if (!incident.createdAt) return;

		const hour = incident.createdAt.toDate().getHours();
		const range = hourRanges.find((r) => hour >= r.start && hour < r.end);

		if (range) {
			const idx = data.findIndex((d) => d.hour === range.label);
			if (idx !== -1) data[idx].total += 1;
		}
	});

	return data;
};

export default function Dashboard() {
	const [viewMode, setViewMode] = useState("dashboard");
	const [mapState, setMapState] = useState(null);

	const [incidentTypes, setIncidentTypes] = useState(null);

	/* 🔹 FILTROS */
	const [period, setPeriod] = useState("today");
	const [onlyEmergency, setOnlyEmergency] = useState(false);

	/* 🔹 INCIDENTS (FIREBASE JÁ FILTRADO) */
	const { incidents, loading, lastUpdate, incidentHistory } = useIncidents({
		period,
		onlyEmergency,
		realtime: true,
	});
	/* 🔹 INCIDENTS FILTRADOS PELO TIPO DE OCORRÊNCIA */
	const filteredIncidents = useMemo(() => {
		if (!Array.isArray(incidentTypes)) return [];

		return incidents.filter((inc) =>
			incidentTypes.includes(inc.ocorrencia?.tipo),
		);
	}, [incidents, incidentTypes]);

	const { center } = useAuth();
	const { users } = useUsersByCity();

	/* =======================
	   DEFINE INCIDENT TYPES
	======================= */

	useEffect(() => {
		let unsubscribeSettings = null;

		const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
			if (!user) {
				setIncidentTypes(null);
				if (unsubscribeSettings) unsubscribeSettings();
				return;
			}

			const ref = doc(db, "users", user.uid, "settings", "default");

			unsubscribeSettings = onSnapshot(ref, (snap) => {
				const data = snap.data();
				setIncidentTypes(
					Array.isArray(data?.incidentTypes)
						? data.incidentTypes
						: [],
				);
			});
		});

		return () => {
			if (unsubscribeSettings) unsubscribeSettings();
			unsubscribeAuth();
		};
	}, []);

	/* =======================
	   MAPA
	======================= */
	useEffect(() => {
		const first = incidents.find(
			(i) => i.geoloc?.latitude && i.geoloc?.longitude,
		);

		if (first) {
			setMapState({
				center: {
					lat: first.geoloc.latitude,
					lng: first.geoloc.longitude,
				},
				zoom: 12,
			});
		} else {
			setMapState({
				center: {
					lat: center?.lat,
					lng: center?.lng,
				},
				zoom: 12,
			});
		}
	}, [incidents]);

	const periodLabelMap = {
		today: "hoje",
		"7d": "nos últimos 7 dias",
		"30d": "nos últimos 30 dias",
	};

	const getBaseLabel = (onlyEmergency) =>
		onlyEmergency ? "Emergências" : "Ocorrências";

	const buildCardTitle = ({ base, status, period }) => {
		return `${base} ${status} ${periodLabelMap[period]}`;
	};

	const stats = useMemo(() => {
		const ocorrenciasPendentes = filteredIncidents.filter(
			(i) => i.status === "pending_review",
		).length;
		const ocorrenciasAceitas = filteredIncidents.filter(
			(i) => i.status === "accepted",
		).length;
		const ocorrenciasEmAndamento = filteredIncidents.filter(
			(i) => i.status === "in_progress",
		).length;
		const ocorrenciasResolvidas = filteredIncidents.filter(
			(i) => i.status === "resolved",
		).length;

		return {
			ocorrenciasPendentes,
			ocorrenciasAceitas,
			ocorrenciasEmAndamento,
			ocorrenciasResolvidas,
		};
	}, [filteredIncidents]);

	/* =======================
	   GRÁFICOS
	======================= */
	const {
		typeData,
		statusData,
		districtData,
		peakHourData,
		emergencyPieData,
		averageResponseTimeData,
	} = useMemo(() => {
		if (!filteredIncidents.length) {
			return {
				typeData: [],
				statusData: [],
				districtData: [],
				peakHourData: [],
				emergencyPieData: [],
				averageResponseTimeData: [],
			};
		}

		const types = {};
		const status = {};
		const district = {};
		let emergencias = 0;

		filteredIncidents.forEach((item) => {
			if (item.isEmergency) emergencias++;

			types[item.ocorrencia?.tipo || "Sem tipo"] =
				(types[item.ocorrencia?.tipo || "Sem tipo"] || 0) + 1;

			status[item.status || "unknown"] =
				(status[item.status || "unknown"] || 0) + 1;

			district[item.geoloc?.district || "unknown"] =
				(district[item.geoloc?.district || "unknown"] || 0) + 1;
		});

		return {
			typeData: Object.entries(types).map(([tipo, quantidade]) => ({
				tipo,
				quantidade,
			})),
			statusData: Object.entries(status).map(([status, quantidade]) => ({
				status,
				quantidade,
			})),
			districtData: Object.entries(district).map(
				([district, quantidade]) => ({
					district,
					quantidade,
				}),
			),
			peakHourData: buildPeakHourData(filteredIncidents),
			emergencyPieData: [
				{ name: "Emergências", value: emergencias },
				{
					name: "Ocorrências",
					value: filteredIncidents.length - emergencias,
				},
			],
			averageResponseTimeData:
				buildAverageResponseTimeData(incidentHistory),
		};
	}, [filteredIncidents, incidentHistory]);

	const baseLabel = getBaseLabel(onlyEmergency);
	const cards = [
		{
			key: "pending_review",
			statusLabel: "pendentes de análise",
			value: stats.ocorrenciasPendentes,
			icon: <PendingActionsIcon sx={{ fontSize: 48 }} />,
		},
		{
			key: "accepted",
			statusLabel: "aceitas",
			value: stats.ocorrenciasAceitas,
			icon: <TaskIcon sx={{ fontSize: 48 }} />,
		},
		{
			key: "in_progress",
			statusLabel: "em andamento",
			value: stats.ocorrenciasEmAndamento,
			icon: <EngineeringIcon sx={{ fontSize: 48 }} />,
		},
		{
			key: "resolved",
			statusLabel: "resolvidas",
			value: stats.ocorrenciasResolvidas,
			icon: <TaskAltIcon sx={{ fontSize: 48 }} />,
		},
	].map((card) => ({
		...card,
		title: buildCardTitle({
			base: baseLabel,
			status: card.statusLabel,
			period,
		}),
	}));

	if (incidentTypes === null) {
		return (
			<Box sx={{ p: 4 }}>
				<Typography color="text.secondary">
					Carregando configurações do usuário...
				</Typography>
			</Box>
		);
	}

	if (loading) {
		return (
			<Box sx={{ p: 4 }}>
				<Typography color="text.secondary">
					Carregando dados da cidade...
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ paddingTop: 2 }}>
			{/* HEADER */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 3,
					flexWrap: "wrap",
					gap: 2,
				}}
			>
				<Typography variant="h4" fontWeight={700}>
					{viewMode === "dashboard"
						? "Dashboard"
						: "Mapa de Ocorrências"}
				</Typography>

				<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
					<ToggleButtonGroup
						color="primary"
						value={period}
						exclusive
						onChange={(_, v) => v && setPeriod(v)}
						size="small"
					>
						<ToggleButton value="today">Hoje</ToggleButton>
						<ToggleButton value="7d">7 dias</ToggleButton>
						<ToggleButton value="30d">30 dias</ToggleButton>
					</ToggleButtonGroup>

					<ToggleButton
						color="primary"
						selected={onlyEmergency}
						onChange={() => setOnlyEmergency(!onlyEmergency)}
						size="small"
					>
						Somente Emergências
					</ToggleButton>

					<ToggleButtonGroup
						color="primary"
						value={viewMode}
						exclusive
						onChange={(_, val) => val && setViewMode(val)}
						size="small"
					>
						<ToggleButton value="dashboard">
							<DashboardIcon sx={{ mr: 1 }} />
							Resumo
						</ToggleButton>
						<ToggleButton value="map">
							<MapIcon sx={{ mr: 1 }} />
							Mapa
						</ToggleButton>
					</ToggleButtonGroup>
				</Box>
			</Box>

			<Fade in={viewMode === "dashboard"} timeout={300} unmountOnExit>
				<Box>
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 6, lg: 4 }}>
							<SafetyCard
								incidents={filteredIncidents}
								period={period}
								userCenter={center}
							/>
						</Grid>

						<Grid size={{ xs: 12, md: 6, lg: 4 }}>
							<CustomCard
								card={{
									title: `Usuários cadastrados`,
									value: users.length,
									icon: <GroupIcon sx={{ fontSize: 48 }} />,
								}}
								lastUpdate={lastUpdate}
							/>
						</Grid>

						{cards.map((card, i) => (
							<Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
								<CustomCard
									card={card}
									lastUpdate={lastUpdate}
								/>
							</Grid>
						))}
					</Grid>

					<Grid container spacing={3} sx={{ mt: 5 }}>
						<Grid size={{ xs: 12, md: 6 }}>
							<PeakHourChart data={peakHourData} />
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<AverageResponseTimeChart
								data={averageResponseTimeData}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<EmergencyPieChart data={emergencyPieData} />
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<StatusChart data={statusData} />
						</Grid>
						<Grid size={{ xs: 12 }}>
							<CategoryChart data={typeData} />
						</Grid>
						<Grid size={{ xs: 12 }}>
							<DistrictChart data={districtData} />
						</Grid>
					</Grid>
				</Box>
			</Fade>

			<Fade in={viewMode === "map"} timeout={300} unmountOnExit>
				<Box sx={{ height: "calc(100vh - 170px)" }}>
					<IncidentsMap
						incidents={filteredIncidents}
						loading={loading}
						mapState={mapState}
						onMapStateChange={setMapState}
					/>
				</Box>
			</Fade>
		</Box>
	);
}
