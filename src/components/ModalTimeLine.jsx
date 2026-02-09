import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { Box, Typography, useTheme } from "@mui/material";
import {
	CheckCircle as CheckCircleIcon,
	QueryBuilder as QueryBuilderIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { statusList } from "../utils/statusList";

/* =============================
   ICONES POR STATUS
============================= */
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

/* =============================
   LABELS DE STATUS
============================= */
function formatStatus(status) {
	return statusList[status]?.label || status;
}

/* =============================
   COMPONENTE
============================= */
export default function IncidentTimeline({ incidentId }) {
	const theme = useTheme();
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!incidentId) return;

		const q = query(
			collection(db, "incident_history"),
			where("incidentId", "==", incidentId),
			orderBy("createdAt", "asc"),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const data = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setHistory(data);
			setLoading(false);
		});

		return () => unsubscribe();
	}, [incidentId]);

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" py={4}>
				<CircularProgress />
			</Box>
		);
	}

	if (history.length === 0) {
		return (
			<Typography color="text.secondary">
				Nenhum histórico registrado para esta ocorrência.
			</Typography>
		);
	}

	return (
		<Timeline
			sx={{
				[`& .${timelineItemClasses.root}:before`]: {
					flex: 0,
					padding: 0,
				},
				background: theme.palette.background.default,
				borderRadius: "8px",
			}}
		>
			{history.map((item, index) => (
				<TimelineItem key={item.id}>
					<TimelineSeparator>
						{index !== 0 && <TimelineConnector />}
						<TimelineDot
							sx={{
								backgroundColor:
									theme.palette.other[item.toStatus],
							}}
						>
							{getStatusIcon(item.toStatus)}
						</TimelineDot>
						{index !== history.length - 1 && <TimelineConnector />}
					</TimelineSeparator>

					<TimelineContent
						sx={{
							py: "14px",
							px: 2,
						}}
					>
						{/* STATUS — preso ao centro do ícone */}
						<Typography variant="h6" component="span">
							{formatStatus(item.toStatus)}
						</Typography>

						{/* TEXTO — sempre abaixo */}

						{item.reason && (
							<Typography
								variant="body2"
								sx={{
									fontStyle: "italic",
								}}
							>
								"{item.reason}"
							</Typography>
						)}
						<Typography variant="caption" color="text.secondary">
							{item.createdBy?.name} –{" "}
							{item.createdAt?.toDate
								? item.createdAt
										.toDate()
										.toLocaleString("pt-BR")
								: ""}
						</Typography>
					</TimelineContent>
				</TimelineItem>
			))}
		</Timeline>
	);
}
