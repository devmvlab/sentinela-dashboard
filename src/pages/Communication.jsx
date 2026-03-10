import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Divider,
	Grid,
	Paper,
} from "@mui/material";

export default function CommunicationPage() {
	const [title, setTitle] = useState("Alerta Sentinela");
	const [message, setMessage] = useState("");

	const maxChars = 120;
	const titleMaxChars = 30;

	const functions = getFunctions();
	const sendNotification = httpsCallable(functions, "sendPushNotification");

	const handleSend = async () => {
		try {
			await sendNotification({
				title,
				message,
			});

			alert("Alerta enviado com sucesso");
		} catch (error) {
			console.error(error);
			alert("Erro ao enviar alerta");
		}
	};

	return (
		<Box p={3}>
			<Typography variant="h4" fontWeight={700} mb={2}>
				Central de Comunicação
			</Typography>
			<Card>
				<CardContent>
					<Grid container spacing={3}>
						{/* FORMULÁRIO */}
						<Grid item xs={12} md={7}>
							{/* Título */}
							<Typography variant="subtitle1">Título</Typography>
							<TextField
								fullWidth
								value={title}
								onChange={(e) => {
									if (
										e.target.value.length <= titleMaxChars
									) {
										setTitle(e.target.value);
									}
								}}
								sx={{ mb: 3 }}
							/>

							{/* Mensagem */}
							<Typography variant="subtitle1">
								Mensagem
							</Typography>
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
								sx={{ mt: 1 }}
							>
								{message.length} / {maxChars} caracteres
							</Typography>

							<Divider sx={{ my: 3 }} />

							{/* Botões */}
							<Box
								display="flex"
								justifyContent="flex-end"
								gap={2}
							>
								<Button
									variant="contained"
									color="error"
									onClick={handleSend}
								>
									🚀 Enviar alerta
								</Button>
							</Box>
						</Grid>

						{/* PREVIEW */}
						<Grid item xs={12} md={5}>
							<Typography variant="subtitle1" gutterBottom>
								Pré-visualização da notificação
							</Typography>

							<Paper
								elevation={3}
								sx={{
									p: 2,
									borderLeft: `6px solid`,
									maxWidth: "500px",
								}}
							>
								<Typography fontWeight="bold">
									{title}
								</Typography>

								<Typography variant="body2">
									{message || "Sua mensagem aparecerá aqui"}
								</Typography>
							</Paper>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</Box>
	);
}
