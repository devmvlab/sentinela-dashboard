import {
	Timeline,
	TimelineItem,
	TimelineSeparator,
	TimelineConnector,
	TimelineContent,
	TimelineOppositeContent,
	TimelineDot,
} from "@mui/lab";
import {
	CheckCircle as CheckCircleIcon,
	QueryBuilder as QueryBuilderIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

import {
	collection,
	query,
	where,
	orderBy,
	onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";

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
	const map = {
		pending_review: "Em análise",
		accepted: "Aceita",
		in_progress: "Em andamento",
		resolved: "Resolvida",
		cancelled: "Cancelada",
	};

	return map[status] || status;
}

/* =============================
   COMPONENTE
============================= */
export default function IncidentTimeline({ incidentId }) {
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
		<Timeline position="left">
			{history.map((item, index) => (
				<TimelineItem key={item.id}>
					<TimelineOppositeContent
						sx={{ m: "auto 0" }}
						variant="body2"
						color="text.secondary"
					>
						{item.reason && <Typography>{item.reason}</Typography>}
						{item.createdBy?.name} -{" "}
						{item.createdAt?.toDate
							? item.createdAt.toDate().toLocaleString("pt-BR")
							: ""}
					</TimelineOppositeContent>

					<TimelineSeparator>
						{index !== 0 && <TimelineConnector />}
						<TimelineDot
							color={
								item.toStatus === "cancelled"
									? "error"
									: item.toStatus === "resolved"
										? "success"
										: "primary"
							}
						>
							{getStatusIcon(item.toStatus)}
						</TimelineDot>
						{index !== history.length - 1 && <TimelineConnector />}
					</TimelineSeparator>

					<TimelineContent
						sx={{
							px: 2,
							display: "flex",
							alignItems: "center", // centro vertical real
							justifyContent: "flex-start",
						}}
					>
						<Typography variant="h6" component="span">
							{formatStatus(item.fromStatus)} →{" "}
							{formatStatus(item.toStatus)}
						</Typography>
					</TimelineContent>
				</TimelineItem>
			))}
		</Timeline>
	);
}
