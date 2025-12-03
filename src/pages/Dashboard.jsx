import { useEffect, useState } from "react";
import { Grid, Card, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

import CategoryChart from "../components/CategoryChart";

export default function Dashboard() {
	const theme = useTheme();

	const [stats, setStats] = useState({
		ocorrenciasHoje: 0,
		ocorrenciasAtivas: 0,
		emergencias: 0,
		notificacoesHoje: 0,
	});

	const [categoryData, setCategoryData] = useState([]);

	useEffect(() => {
		const formatarData = (d) => {
			const dia = String(d.getDate()).padStart(2, "0");
			const mes = String(d.getMonth() + 1).padStart(2, "0");
			const ano = d.getFullYear();
			return `${dia}/${mes}/${ano}`;
		};

		const carregarDados = async () => {
			const dataHoje = formatarData(new Date());
			const snapshot = await getDocs(collection(db, "incidents"));
			const lista = snapshot.docs.map((doc) => doc.data());

			const ocorrenciasHoje = lista.filter(
				(item) => item.data === dataHoje
			).length;
			const ocorrenciasAtivas = lista.filter(
				(item) => item.status === "open"
			).length;
			const emergencias = lista.filter(
				(item) => item.isEmergency === true
			).length;

			const categorias = {};
			lista.forEach((item) => {
				const cat = item.ocorrencia?.categoria || "Sem categoria";
				categorias[cat] = (categorias[cat] || 0) + 1;
			});

			const categoriaFormatada = Object.entries(categorias).map(
				([categoria, quantidade]) => ({ categoria, quantidade })
			);

			setStats({
				ocorrenciasHoje,
				ocorrenciasAtivas,
				emergencias,
				notificacoesHoje: 0,
			});

			setCategoryData(categoriaFormatada);
		};

		carregarDados();
	}, []);

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
			title: "Emergências",
			value: stats.emergencias,
			icon: <WarningIcon />,
		},
		{
			title: "Notificações Hoje",
			value: stats.notificacoesHoje,
			icon: <NotificationsActiveIcon />,
		},
	];

	return (
		<Box sx={{ paddingTop: 2 }}>
			<Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
				Dashboard
			</Typography>

			{/* CARDS */}
			<Grid container spacing={3} justifyContent="center">
				{cards.map((card, i) => (
					<Grid item xs={12} sm={6} md={4} lg={3} key={i}>
						<Card
							sx={{
								backgroundColor: theme.palette.background.paper,
								borderRadius: 2,
								padding: 2,
								minHeight: 120,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
							}}
						>
							<Box
								sx={{
									fontSize: 42,
									color: theme.palette.primary.main,
									width: 60,
									height: 60,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								{card.icon}
							</Box>

							<Box sx={{ textAlign: "right" }}>
								<Typography variant="body1" fontWeight={600}>
									{card.title}
								</Typography>
								<Typography variant="h5" fontWeight={700}>
									{card.value}
								</Typography>
							</Box>
						</Card>
					</Grid>
				))}
			</Grid>

			{/* GRÁFICO */}
			<Box sx={{ mt: 5 }}>
				<CategoryChart data={categoryData} />
			</Box>
		</Box>
	);
}
