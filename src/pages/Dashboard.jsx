import { useEffect, useState } from "react";
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
import IncidentsMap from "./IncidentsMap";
import SafetyCard from "../components/SafetyCard";

import { formatTime } from "../utils/FormatTime";

import { useSentinelaData } from "../utils/SentinelaDataContext";

export default function Dashboard() {
	const theme = useTheme();

	// 🔹 dados globais (fonte única)
	const { incidents, userCenter, loading, lastUpdate } = useSentinelaData();

	// modo da tela
	const [viewMode, setViewMode] = useState("dashboard");

	// estado do mapa (preserva zoom/posição)
	const [mapState, setMapState] = useState(null);

	// inicializa mapa no centro da cidade
	useEffect(() => {
		if (userCenter && !mapState) {
			setMapState({
				center: userCenter,
				zoom: 12,
			});
		}
	}, [userCenter, mapState]);

	// métricas
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

	// 🔹 calcula métricas a partir dos incidents (já filtrados)
	useEffect(() => {
		if (!incidents || incidents.length === 0) {
			setStats({
				ocorrenciasHoje: 0,
				ocorrenciasAtivas: 0,
				emergenciasAtivas: 0,
				emergenciasResolvidas: 0,
				ocorrenciasResolvidas: 0,
			});
			setCategoryData([]);
			return;
		}

		const formatarData = (d) => {
			const dia = String(d.getDate()).padStart(2, "0");
			const mes = String(d.getMonth() + 1).padStart(2, "0");
			const ano = d.getFullYear();
			return `${dia}/${mes}/${ano}`;
		};

		const dataHoje = formatarData(new Date());

		const ocorrenciasHoje = incidents.filter(
			(item) => item.data === dataHoje
		).length;

		const ocorrenciasAtivas = incidents.filter(
			(item) => item.status === "open"
		).length;

		const emergenciasAtivas = incidents.filter(
			(item) => item.isEmergency === true && item.status !== "resolved"
		).length;

		const emergenciasResolvidas = incidents.filter(
			(item) => item.isEmergency === true && item.status === "resolved"
		).length;

		const emergencias = incidents.filter(
			(item) => item.isEmergency === true
		).length;

		const ocorrenciasResolvidas = incidents.filter(
			(item) => item.status === "resolved"
		).length;

		const ocorrenciasEmAndamento = incidents.filter(
			(item) => item.status === "in_progress"
		).length;

		const ocorrenciasFechadas = incidents.filter(
			(item) => item.status === "closed"
		).length;

		const ocorrenciasPendentes = incidents.filter(
			(item) => item.status === "pending"
		).length;

		const categorias = {};
		incidents.forEach((item) => {
			const cat = item.ocorrencia?.categoria || "Sem categoria";
			categorias[cat] = (categorias[cat] || 0) + 1;
		});

		const categoriaFormatada = Object.entries(categorias).map(
			([categoria, quantidade]) => ({
				categoria,
				quantidade,
			})
		);

		const status = {};
		incidents.forEach((item) => {
			const stat = item.status || "unknown";
			status[stat] = (status[stat] || 0) + 1;
		});

		const statusFormatada = Object.entries(status).map(
			([status, quantidade]) => ({
				status,
				quantidade,
			})
		);

		const district = {};
		incidents.forEach((item) => {
			const zone = item.geoloc.district || "unknown";
			district[zone] = (district[zone] || 0) + 1;
		});

		const districtFormatado = Object.entries(district).map(
			([district, quantidade]) => ({
				district,
				quantidade,
			})
		);

		setStats({
			ocorrenciasHoje,
			ocorrenciasAtivas,
			emergenciasAtivas,
			emergenciasResolvidas,
			ocorrenciasResolvidas,
		});

		setCategoryData(categoriaFormatada);
		setStatusData(statusFormatada);
		setDistrictData(districtFormatado);
	}, [incidents]);

	const cards = [
		{
			title: "Ocorrências Hoje",
			value: stats.ocorrenciasHoje,
			description: "Registradas nas últimas 24 horas",
			icon: <TrendingUpIcon />,
		},
		{
			title: "Ocorrências em aberto",
			value: stats.ocorrenciasAtivas,
			description: "Aguardando atendimento ou resolução",
			icon: <LocationOnIcon />,
		},
		{
			title: "Emergências em aberto",
			value: stats.emergenciasAtivas,
			description: "Exigem atenção imediata",
			icon: <WarningIcon />,
		},
		{
			title: "Emergências resolvidas",
			value: stats.emergenciasResolvidas,
			description: "Atendidas com sucesso",
			icon: <TaskAltIcon />,
		},
		{
			title: "Ocorrências resolvidas",
			value: stats.ocorrenciasResolvidas,
			description: "Encerradas com sucesso",
			icon: <TaskAltIcon />,
		},
	];

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
				}}
			>
				<Typography variant="h4" fontWeight={700}>
					{viewMode === "dashboard"
						? "Dashboard"
						: "Mapa de Ocorrências"}
				</Typography>

				<ToggleButtonGroup
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

			{/* DASHBOARD */}
			<Fade in={viewMode === "dashboard"} timeout={300} unmountOnExit>
				<Box>
					<Grid container spacing={3} justifyContent="center">
						<SafetyCard
							incidents={incidents}
							userCenter={userCenter}
							period="7d"
						/>
						{cards.map((card, i) => (
							<Grid item xs={12} sm={6} md={4} lg={3} key={i}>
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

			{/* MAPA */}
			<Fade in={viewMode === "map"} timeout={300} unmountOnExit>
				<Box
					sx={{
						height: "calc(100vh - 170px)",
						borderRadius: 2,
						overflow: "hidden",
					}}
				>
					<IncidentsMap
						incidents={incidents}
						mapState={mapState}
						onMapStateChange={setMapState}
					/>
				</Box>
			</Fade>
		</Box>
	);
}
