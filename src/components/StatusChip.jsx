import Chip from "@mui/material/Chip";

//  exporte os maps
export const statusLabels = {
	pending: "PENDENTE",
	review: "EM ANÁLISE",
	open: "ABERTA",
	in_progress: "EM ANDAMENTO",
	closed: "ENCERRADA",
	resolved: "RESOLVIDA",
	cancelled: "CANCELADA",
};

export const statusColors = {
	pending: "default",
	review: "primary",
	open: "warning",
	in_progress: "info",
	closed: "error",
	resolved: "success",
	cancelled: "error",
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
