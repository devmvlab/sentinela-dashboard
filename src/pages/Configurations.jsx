import { Box, Typography, Paper } from "@mui/material";

export default function Settings() {
	return (
		<Box
			sx={{
				height: "100%",
				padding: 3,
				display: "flex",
				flexDirection: "column",
				gap: 2,
			}}
		>
			{/* Título da página */}
			<Typography variant="h5" fontWeight="bold">
				Configurações
			</Typography>

			{/* Subtítulo */}
			<Typography variant="body2" color="text.secondary">
				Ajustes e preferências do sistema
			</Typography>

			{/* Conteúdo vazio */}
			<Paper
				elevation={0}
				sx={{
					flex: 1,
					borderRadius: 2,
					border: "1px dashed",
					borderColor: "divider",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "text.secondary",
				}}
			>
				<Typography variant="body2">Em desenvolvimento 🚧</Typography>
			</Paper>
		</Box>
	);
}
