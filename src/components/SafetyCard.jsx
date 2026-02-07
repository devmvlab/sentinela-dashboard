import { Card, Typography, Box, LinearProgress } from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { useSafetyLevel } from "../hooks/useSafetyLevel";

export default function SafetyCard({ incidents, userCenter, period }) {
	const { data, loading } = useSafetyLevel({
		incidents,
		userCenter,
		period,
	});

	if (loading || !data) {
		return (
			<Card
				sx={{
					backgroundColor: "background.paper",
					borderRadius: 2,
					p: 2.5,
					minHeight: 170,
					display: "flex",
					alignItems: "center",
					gap: 2.5,
					boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
				}}
			>
				<Typography color="text.secondary" variant="body2">
					Calculando nível de segurança...
				</Typography>
			</Card>
		);
	}

	return (
		<Card
			sx={{
				backgroundColor: "background.paper",
				borderRadius: 2,
				p: 2.5,
				minHeight: 170,
				display: "flex",
				alignItems: "center",
				gap: 2,
				boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
			}}
		>
			{/* ÍCONE */}
			<Box
				sx={{
					width: 100,
					height: 100,
					borderRadius: "12px",
					backgroundColor: data.color + "25",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: data.color,
					fontSize: "1.9rem",
					flexShrink: 0,
				}}
			>
				<ShieldIcon sx={{ fontSize: 48 }} />
			</Box>

			{/* CONTEÚDO */}
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-end",
				}}
			>
				{/* LABEL */}
				<Typography variant="body1" fontWeight={700}>
					Nível de segurança
				</Typography>

				{/* SCORE + STATUS */}
				<Box
					sx={{
						display: "flex",
						alignItems: "baseline",
						gap: 1,
						mt: 0.5,
					}}
				>
					<Typography
						variant="h4"
						fontWeight={800}
						sx={{ color: data.color, lineHeight: 1 }}
					>
						{data.score}
					</Typography>

					<Typography
						variant="body2"
						fontWeight={700}
						sx={{ color: data.color }}
					>
						{data.status}
					</Typography>
				</Box>

				{/* BARRA */}
				<LinearProgress
					variant="determinate"
					value={data.score}
					sx={{
						mt: 1,
						width: "100%",
						height: 6,
						borderRadius: 4,
						backgroundColor: "#2a2a2a",
						"& .MuiLinearProgress-bar": {
							backgroundColor: data.color,
						},
					}}
				/>

				{/* DESCRIÇÃO */}
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ mt: 1, display: "block" }}
				>
					{data.description}
				</Typography>
			</Box>
		</Card>
	);
}
