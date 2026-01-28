import { useState, useEffect } from "react";
import {
	Box,
	Typography,
	FormGroup,
	FormControlLabel,
	Checkbox,
	Snackbar,
	Alert,
	CircularProgress,
} from "@mui/material";
import { categories } from "../../utils/categories";
import { useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { getAuth } from "firebase/auth";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function ProfileIncidentsTypeCard() {
	const [feedback, setFeedback] = useState({
		open: false,
		message: "",
		severity: "success",
	});

	const theme = useTheme();
	const [incidentTypes, setIncidentTypes] = useState([]);
	const [loading, setLoading] = useState(true);

	/* =========================
       CARREGA CONFIG DO FIRESTORE
       ========================= */
	useEffect(() => {
		const loadUserSettings = async () => {
			const auth = getAuth();
			const user = auth.currentUser;

			if (!user) {
				setLoading(false);
				return;
			}

			try {
				const ref = doc(db, "users", user.uid, "settings", "default");
				const snap = await getDoc(ref);

				if (snap.exists()) {
					const data = snap.data();

					if (Array.isArray(data.incidentTypes)) {
						setIncidentTypes(data.incidentTypes);
					}
				}
			} catch (error) {
				console.error("Erro ao carregar configurações:", error);
			} finally {
				setLoading(false);
			}
		};

		loadUserSettings();
	}, []);

	/* =========================
       TOGGLE DOS CHECKBOXES
       ========================= */
	const handleToggle = (itemTitle) => {
		setIncidentTypes((prev) => {
			const isSelected = prev.includes(itemTitle);

			const updated = isSelected
				? prev.filter((item) => item !== itemTitle)
				: [...prev, itemTitle];

			return updated;
		});
	};

	/* =========================
       SALVA NO FIRESTORE
       ========================= */
	const saveUserSettings = async () => {
		try {
			const auth = getAuth();
			const user = auth.currentUser;

			if (!user) return;

			const userId = user.uid;

			await updateDoc(doc(db, "users", userId, "settings", "default"), {
				incidentTypes: incidentTypes,
				updatedAt: serverTimestamp(),
			});

			// AVISA A TOPBAR PARA BLOQUEAR NOTIFICAÇÕES ATÉ SINCRONIZAR
			localStorage.setItem("incidentTypesSyncing", "true");

			setFeedback({
				open: true,
				message: "Configurações salvas com sucesso!",
				severity: "success",
			});
		} catch (error) {
			setFeedback({
				open: true,
				message: "Erro ao salvar configurações. Tente novamente.",
				severity: "error",
			});
		}
	};

	/* =========================
       LOADING
       ========================= */
	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "60vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<>
			<Accordion>
				<AccordionSummary
					expandIcon={<ArrowDownwardIcon />}
					aria-controls="panel1-content"
					id="panel1-header"
					sx={{
						backgroundColor: "background.default",
						color: "#fff",
						"& .MuiAccordionSummary-expandIconWrapper": {
							color: "#fff",
						},
					}}
				>
					<Typography variant="h6" fontWeight={700}>
						Notificações
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								md: "repeat(3, 1fr)",
							},
							gap: 3,
						}}
					>
						{categories.map((category) => (
							<Box key={category.title} mb={3}>
								<Typography
									fontWeight={600}
									mb={1}
									color={theme.palette.primary.main}
								>
									{category.title}
								</Typography>

								<FormGroup>
									{category.items.map((item) => (
										<FormControlLabel
											key={item.title}
											label={item.title}
											control={
												<Checkbox
													checked={incidentTypes.includes(
														item.title,
													)}
													onChange={() =>
														handleToggle(item.title)
													}
												/>
											}
										/>
									))}
								</FormGroup>
							</Box>
						))}
					</Box>

					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							mt: 4,
						}}
					>
						<Button
							variant="outlined"
							size="large"
							sx={{
								minWidth: 200,
								px: 4,
								py: 1.2,
								fontWeight: 600,
							}}
							onClick={saveUserSettings}
						>
							Salvar
						</Button>
					</Box>
				</AccordionDetails>
			</Accordion>

			<Snackbar
				open={feedback.open}
				autoHideDuration={4000}
				onClose={() => setFeedback({ ...feedback, open: false })}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
			>
				<Alert
					onClose={() => setFeedback({ ...feedback, open: false })}
					severity={feedback.severity}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{feedback.message}
				</Alert>
			</Snackbar>
		</>
	);
}
