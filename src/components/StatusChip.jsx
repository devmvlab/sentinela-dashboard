import Chip from "@mui/material/Chip";

// 👇 exporte os maps
export const statusLabels = {
	pending: "PENDENTE",
	open: "EM ABERTO",
	closed: "FECHADO",
	resolved: "RESOLVIDO",
};

export const statusColors = {
	pending: "default",
	open: "warning",
	closed: "error",
	resolved: "success",
};

export default function StatusChip({ status }) {
	const normalizedStatus = status?.toLowerCase();

	return (
		<Chip
			label={statusLabels[normalizedStatus] || normalizedStatus}
			color={statusColors[normalizedStatus] || "default"}
			size="small"
			variant="filled"
			sx={{ fontWeight: "bold" }}
		/>
	);
}
