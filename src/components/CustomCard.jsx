import { Box, Card, Typography, useTheme } from "@mui/material";
import { formatTime } from "../utils/FormatTime";

export default function CustomCard({ card, lastUpdate }) {
	const theme = useTheme();
	return (
		<Card
			sx={{
				backgroundColor: theme.palette.background.paper,
				borderRadius: 2,
				p: 2.5,
				minHeight: 170,
				display: "flex",
				alignItems: "center",
				gap: 2,
				boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
			}}
		>
			<Box
				sx={{
					width: 100,
					height: 100,
					borderRadius: "12px",
					backgroundColor: theme.palette.primary.main + "25",
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

			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-end",
				}}
			>
				<Typography
					variant="body1"
					fontWeight={700}
					sx={{ textAlign: "end" }}
				>
					{card.title}
				</Typography>

				<Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
					{card.value}
				</Typography>

				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						mt: 1,
						display: "block",
						fontStyle: "italic",
					}}
				>
					Última atualização: {formatTime(lastUpdate)}
				</Typography>
			</Box>
		</Card>
	);
}
