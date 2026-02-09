import { Box, Typography } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";

export default function ChartEmptyState({
	height = 300,
	title = "Nenhum dado disponível",
	description = "Não há informações suficientes para exibir este gráfico no momento.",
}) {
	return (
		<Box
			height={height}
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			textAlign="center"
			color="text.secondary"
		>
			<BarChartIcon sx={{ fontSize: 46, mb: 1, opacity: 0.5 }} />
			<Typography fontWeight={600}>{title}</Typography>
			<Typography variant="body2">{description}</Typography>
		</Box>
	);
}
