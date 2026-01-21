import Chip from "@mui/material/Chip";

//  exporte os maps
export const statusLabels = {
	pending: "PENDENTE",
	open: "ABERTA",
	in_progress: "EM ANDAMENTO",
	closed: "ENCERRADA",
	resolved: "RESOLVIDA",
};

export const statusColors = {
	pending: "default",
	open: "warning",
	in_progress: "info",
	closed: "error",
	resolved: "success",
};

export default function StatusChip({ status, sx }) {
	const normalizedStatus = status?.toLowerCase();

	return (
		<Chip
			label={statusLabels[normalizedStatus] || normalizedStatus}
			color={statusColors[normalizedStatus] || "default"}
			size="small"
			variant="filled"
			sx={{ fontWeight: "bold", ...sx }}
		/>
	);
}
