import { useEffect, useState, useMemo } from "react";
import {
	Grid,
	Card,
	Typography,
	Box,
	ToggleButton,
	ToggleButtonGroup,
	Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";

import CategoryChart from "../components/CategoryChart";
import StatusChart from "../components/StatusChart";
import DistrictChart from "../components/DistrictChart";
import PeakHourChart from "../components/PeakHourChart";
import IncidentsMap from "./IncidentsMap";
import SafetyCard from "../components/SafetyCard";
import EmergencyPieChart from "../components/EmergencyPieChart";

import { formatTime } from "../utils/FormatTime";
import { useSentinelaData } from "../utils/SentinelaDataContext";

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

const filterByPeriod = (incidents, period) => {
	const now = new Date();

	return incidents.filter((item) => {
		if (!item.createdAt) return false;

		const date = item.createdAt.toDate();

		if (period === "today") {
			return date.toDateString() === now.toDateString();
		}

		const diffDays =
			(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

		if (period === "7d") return diffDays <= 7;
		if (period === "30d") return diffDays <= 30;

		return true;
	});
};

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
	const theme = useTheme();
	const { incidents, userCenter, loading, lastUpdate } = useSentinelaData();

	const [viewMode, setViewMode] = useState("dashboard");
	const [mapState, setMapState] = useState(null);

	/* 🔹 FILTROS (AGORA GLOBAIS PARA GRÁFICOS) */
	const [period, setPeriod] = useState("7d");
	const [onlyEmergency, setOnlyEmergency] = useState(false);

	/* 🔹 INCIDENTES FILTRADOS (USADOS SOMENTE NOS GRÁFICOS) */
	const filteredIncidents = useMemo(() => {
		let data = filterByPeriod(incidents || [], period);

		if (onlyEmergency) {
			data = data.filter((i) => i.isEmergency);
		}

		return data;
	}, [incidents, period, onlyEmergency]);

	const [stats, setStats] = useState({
		ocorrenciasHoje: 0,
		ocorrenciasAtivas: 0,
		emergenciasAtivas: 0,
		emergenciasResolvidas: 0,
		ocorrenciasResolvidas: 0,
	});

	const [categoryData, setCategoryData] = useState([]);
	const [statusData, setStatusData] = useState([]);
	const [districtData, setDistrictData] = useState([]);
	const [peakHourData, setPeakHourData] = useState([]);
	const [emergencyPieData, setEmergencyPieData] = useState([]);

	useEffect(() => {
		if (userCenter && !mapState) {
			setMapState({ center: userCenter, zoom: 12 });
		}
	}, [userCenter, mapState]);

	/* 🔹 CARDS — INALTERADOS (USAM incidents ORIGINAL) */
	useEffect(() => {
		if (!incidents || incidents.length === 0) return;

		const ocorrenciasHoje = incidents.filter(
			(i) => i.status !== "resolved"
		).length;

		const ocorrenciasAtivas = incidents.filter(
			(i) => i.status === "open"
		).length;

		const emergenciasAtivas = incidents.filter(
			(i) => i.isEmergency && i.status !== "resolved"
		).length;

		const emergenciasResolvidas = incidents.filter(
			(i) => i.isEmergency && i.status === "resolved"
		).length;

		const ocorrenciasResolvidas = incidents.filter(
			(i) => i.status === "resolved"
		).length;

		setStats({
			ocorrenciasHoje,
			ocorrenciasAtivas,
			emergenciasAtivas,
			emergenciasResolvidas,
			ocorrenciasResolvidas,
		});
	}, [incidents]);

	/* 🔹 GRÁFICOS — AGORA USAM filteredIncidents */
	useEffect(() => {
		if (!filteredIncidents.length) return;

		const totalEmergencias = filteredIncidents.filter(
			(i) => i.isEmergency
		).length;

		const totalOcorrencias = filteredIncidents.length - totalEmergencias;

		setEmergencyPieData([
			{ name: "Emergências", value: totalEmergencias },
			{ name: "Ocorrências", value: totalOcorrencias },
		]);

		const categorias = {};
		const status = {};
		const district = {};

		filteredIncidents.forEach((item) => {
			categorias[item.ocorrencia?.categoria || "Sem categoria"] =
				(categorias[item.ocorrencia?.categoria || "Sem categoria"] ||
					0) + 1;

			status[item.status || "unknown"] =
				(status[item.status || "unknown"] || 0) + 1;

			district[item.geoloc?.district || "unknown"] =
				(district[item.geoloc?.district || "unknown"] || 0) + 1;
		});

		setCategoryData(
			Object.entries(categorias).map(([categoria, quantidade]) => ({
				categoria,
				quantidade,
			}))
		);

		setStatusData(
			Object.entries(status).map(([status, quantidade]) => ({
				status,
				quantidade,
			}))
		);

		setDistrictData(
			Object.entries(district).map(([district, quantidade]) => ({
				district,
				quantidade,
			}))
		);

		setPeakHourData(buildPeakHourData(filteredIncidents));
	}, [filteredIncidents]);

	if (loading) {
		return (
			<Box sx={{ p: 4 }}>
				<Typography color="text.secondary">
					Carregando dados da cidade...
				</Typography>
			</Box>
		);
	}

	const cards = [
		{
			title: "Ocorrências Hoje",
			value: stats.ocorrenciasHoje,
			icon: <TrendingUpIcon />,
		},
		{
			title: "Ocorrências em aberto",
			value: stats.ocorrenciasAtivas,
			icon: <LocationOnIcon />,
		},
		{
			title: "Emergências em aberto",
			value: stats.emergenciasAtivas,
			icon: <WarningIcon />,
		},
		{
			title: "Emergências resolvidas",
			value: stats.emergenciasResolvidas,
			icon: <TaskAltIcon />,
		},
		{
			title: "Ocorrências resolvidas",
			value: stats.ocorrenciasResolvidas,
			icon: <TaskAltIcon />,
		},
	];

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
					{/* 🔹 FILTROS */}
					<ToggleButtonGroup
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
				<Box style={{ width: "100%" }}>
					<Grid container spacing={3}>
						<Grid item xs={12} md={6} lg={4} xl={4}>
							<SafetyCard
								incidents={incidents}
								userCenter={userCenter}
								period="7d"
							/>
						</Grid>
						{cards.map((card, i) => (
							<Grid item key={i} xs={12} md={6} lg={4} xl={4}>
								<Card
									sx={{
										backgroundColor:
											theme.palette.background.paper,
										borderRadius: 2,
										p: 2.5,
										minHeight: 170,
										display: "flex",
										gap: 2,
										boxShadow:
											"0 4px 12px rgba(0,0,0,0.35)",
									}}
								>
									<Box
										sx={{
											width: 54,
											height: 54,
											borderRadius: "12px",
											backgroundColor:
												theme.palette.primary.main +
												"25",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color: "#7BE26A",
											fontSize: "1.9rem",
											flexShrink: 0,
										}}
									>
										{card.icon}
									</Box>

									<Box sx={{ flex: 1 }}>
										<Typography
											variant="caption"
											fontWeight={700}
											sx={{ opacity: 0.85 }}
										>
											{card.title}
										</Typography>

										<Typography
											variant="h4"
											fontWeight={800}
											sx={{ mt: 0.5 }}
										>
											{card.value}
										</Typography>

										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ mt: 1, display: "block" }}
										>
											Última atualização:{" "}
											{formatTime(lastUpdate)}
										</Typography>
									</Box>
								</Card>
							</Grid>
						))}
					</Grid>

					<Box sx={{ mt: 5 }}>
						<PeakHourChart data={peakHourData} />
					</Box>

					<Box sx={{ mt: 5 }}>
						<EmergencyPieChart data={emergencyPieData} />
					</Box>

					<Box sx={{ mt: 5 }}>
						<CategoryChart data={categoryData} />
					</Box>

					<Box sx={{ mt: 5 }}>
						<StatusChart data={statusData} />
					</Box>

					<Box sx={{ mt: 5 }}>
						<DistrictChart data={districtData} />
					</Box>
				</Box>
			</Fade>

			<Fade in={viewMode === "map"} timeout={300} unmountOnExit>
				<Box
					sx={{
						height: "calc(100vh - 170px)",
						borderRadius: 2,
						overflow: "hidden",
					}}
				>
					<IncidentsMap
						incidents={filteredIncidents}
						mapState={mapState}
						onMapStateChange={setMapState}
					/>
				</Box>
			</Fade>
		</Box>
	);
}
