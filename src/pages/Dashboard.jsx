import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

import CategoryChart from "../components/CategoryChart";

export default function Dashboard() {
	const theme = useTheme();

	// 🔹 Depois vamos substituir por dados do Firebase
	const data = {
		ocorrenciasHoje: 12,
		ocorrenciasAtivas: 78,
		emergencias: 4,
		notificacoesHoje: 32,
	};

	// 📌 Dados mockados inicial (substituir depois por dados reais do Firebase)
	const categoryData = [
		{ categoria: "Segurança", quantidade: 35 },
		{ categoria: "Trânsito", quantidade: 20 },
		{ categoria: "Saúde", quantidade: 10 },
		{ categoria: "Ambiental", quantidade: 5 },
	];

	const cards = [
		{
			title: "Ocorrências Hoje",
			value: data.ocorrenciasHoje,
			icon: <TrendingUpIcon />,
		},
		{
			title: "Ocorrências Ativas",
			value: data.ocorrenciasAtivas,
			icon: <LocationOnIcon />,
		},
		{
			title: "Emergências",
			value: data.emergencias,
			icon: <WarningIcon />,
		},
		{
			title: "Notificações Hoje",
			value: data.notificacoesHoje,
			icon: <NotificationsActiveIcon />,
		},
	];

	return (
		<Box sx={{ paddingTop: 2 }}>
			<Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
				Dashboard
			</Typography>

			{/* CARDS DE INDICADORES */}
			<Grid container spacing={3} justifyContent="center">
				{cards.map((card, i) => (
					<Grid item xs={12} sm={6} md={4} lg={3} key={i}>
						<Card
							sx={{
								backgroundColor: theme.palette.background.paper,
								borderRadius: 2,
								boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
								padding: 2,
								minHeight: 120,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								transition: "transform 0.2s ease",
								"&:hover": {
									transform: "translateY(-4px)",
									boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
								},
							}}
						>
							{/* Ícone */}
							<Box
								sx={{
									fontSize: 42,
									color: theme.palette.primary.main,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: 60,
									height: 60,
								}}
							>
								{card.icon}
							</Box>

							{/* Texto */}
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

			{/* 🔽 Próximos blocos: gráficos e últimas ocorrências */}
			<Box sx={{ mt: 5 }}>
				<CategoryChart data={categoryData} />
			</Box>
		</Box>
	);
}
