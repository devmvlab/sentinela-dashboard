import Chip from "@mui/material/Chip";

// Map de tradução dos labels
const statusLabels = {
	pending: "PENDENTE",
	open: "ABERTO",
	closed: "FECHADO",
	resolved: "RESOLVIDO",
};

// Map de cores do Chip
const statusColors = {
	pending: "default",
	open: "warning",
	closed: "error",
	resolved: "success",
};

export default function StatusChip({ status }) {
	const label = statusLabels[status] || status;
	const color = statusColors[status] || "default";

	return (
		<Chip
			label={label}
			color={color}
			size="small"
			variant="filled"
			sx={{ fontWeight: "bold" }}
		/>
	);
}
