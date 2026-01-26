import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

export const statusLabels = {
	accepted: "ACEITA",
	pending_review: "EM ANÁLISE",
	in_progress: "EM ANDAMENTO",
	resolved: "RESOLVIDA",
	cancelled: "CANCELADA",
};

export default function StatusChip({ status, sx }) {
	const theme = useTheme();
	const normalizedStatus = status?.toLowerCase();

	const statusColors = {
		accepted: theme.palette.other.accepted,
		pending_review: theme.palette.other.pending_review,
		in_progress: theme.palette.other.in_progress,
		resolved: theme.palette.other.resolved,
		cancelled: theme.palette.other.cancelled,
	};

	return (
		<Chip
			label={statusLabels[normalizedStatus] || normalizedStatus}
			size="small"
			variant="filled"
			sx={{
				fontWeight: "bold",
				backgroundColor: statusColors[normalizedStatus],
				color: theme.palette.primary.contrastText,
				...sx,
			}}
		/>
	);
}
