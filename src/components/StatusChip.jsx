import Chip from "@mui/material/Chip";
import { useTheme, alpha } from "@mui/material/styles";
import {
	CheckCircle as CheckCircleIcon,
	QueryBuilder as QueryBuilderIcon,
	Close as CloseIcon,
} from "@mui/icons-material";

import { statusList } from "../utils/statusList";

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

	function getStatusIcon(status) {
		switch (status) {
			case "accepted":
			case "resolved":
				return <CheckCircleIcon />;
			case "in_progress":
				return <QueryBuilderIcon />;
			case "cancelled":
				return <CloseIcon />;
			default:
				return <QueryBuilderIcon />;
		}
	}

	return (
		<Chip
			icon={getStatusIcon(normalizedStatus)}
			label={statusList[normalizedStatus]?.label || normalizedStatus}
			size="small"
			variant="outlined"
			sx={{
				paddingX: 1,
				paddingY: 1,
				fontWeight: "bold",
				borderWidth: 2,
				borderColor: statusColors[normalizedStatus],
				color: statusColors[normalizedStatus],
				backgroundColor: alpha(statusColors[normalizedStatus], 0.2),
				"& .MuiChip-icon": {
					color: "inherit",
				},
				...sx,
			}}
		/>
	);
}
