import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useTheme } from "@mui/material/styles";
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Paper,
	Divider,
	Snackbar,
	Alert,
	CircularProgress,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export default function CommunicationPage() {
	const [title, setTitle] = useState("Alerta Sentinela");
	const [message, setMessage] = useState("");

	const theme = useTheme();
	const maxChars = 120;
	const titleMaxChars = 30;

	const [toastOpen, setToastOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState("");
	const [toastType, setToastType] = useState("success");
	const [loading, setLoading] = useState(false);
	const { cityId } = useAuth();

	const functions = getFunctions();
	const sendNotification = httpsCallable(functions, "sendPushNotification");

	const handleSend = async () => {
		if (loading) return;

		setLoading(true);

		try {
			await sendNotification({ title, message, cityId });

			setToastType("success");
			setToastMessage("Alerta enviado com sucesso");
			setToastOpen(true);

			setMessage("");
		} catch (error) {
			setToastType("error");
			setToastMessage("Erro ao enviar alerta");
			setToastOpen(true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			{/* HEADER */}

			<Typography variant="h4" py={2} fontWeight={700}>
				Central de Comunicação
			</Typography>

			<Typography color="text.secondary" pb={2}>
				Envie comunicados e alertas oficiais para os cidadãos através do
				aplicativo Sentinela.
			</Typography>

			{/* FORMULÁRIO */}
			<Card sx={{ flex: 1 }}>
				<CardContent sx={{ p: 4 }}>
					<Typography variant="h6" fontWeight={600} mb={3}>
						Criar novo alerta
					</Typography>

					<Typography variant="subtitle2">
						Título da notificação
					</Typography>

					<TextField
						fullWidth
						value={title}
						onChange={(e) => {
							if (e.target.value.length <= titleMaxChars) {
								setTitle(e.target.value);
							}
						}}
						sx={{ mb: 3 }}
					/>

					<Typography variant="subtitle2">Mensagem</Typography>

					<TextField
						fullWidth
						multiline
						rows={4}
						value={message}
						onChange={(e) => {
							if (e.target.value.length <= maxChars) {
								setMessage(e.target.value);
							}
						}}
					/>

					<Typography
						variant="caption"
						display="block"
						textAlign="right"
						mt={1}
					>
						{message.length} / {maxChars} caracteres
					</Typography>

					<Typography variant="h6" fontWeight={600} mb={3}>
						Pré-visualização da notificação
					</Typography>

					<Paper
						elevation={2}
						sx={{
							p: 2,
							borderLeft: "5px solid #d32f2f",
							backgroundColor: theme.palette.background.default,
						}}
					>
						<Typography
							fontWeight="bold"
							fontSize={14}
							color="text.secondary"
						>
							Sentinela
						</Typography>

						<Typography fontWeight={600}>{title}</Typography>

						<Typography variant="body2">
							{message || "Sua mensagem aparecerá aqui"}
						</Typography>
					</Paper>

					<Divider sx={{ my: 3 }} />

					<Box display="flex" justifyContent="flex-end">
						<Button
							variant="contained"
							color="error"
							size="large"
							onClick={handleSend}
							disabled={loading || !message.trim()}
							startIcon={
								loading ? (
									<CircularProgress
										size={18}
										color="inherit"
									/>
								) : null
							}
						>
							{loading ? "Enviando..." : "Enviar alerta"}
						</Button>
					</Box>
				</CardContent>
			</Card>

			<Snackbar
				open={toastOpen}
				autoHideDuration={4000}
				onClose={() => setToastOpen(false)}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert
					onClose={() => setToastOpen(false)}
					severity={toastType}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{toastMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
}
