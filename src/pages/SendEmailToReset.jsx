import { useState } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	TextField,
	Button,
	Alert,
	CircularProgress,
} from "@mui/material";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

export default function SendEmailToReset() {
	const [email, setEmail] = useState("");
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleResetEmail = async () => {
		if (loading) return; // evita múltiplos cliques

		setLoading(true);
		setError("");

		try {
			await sendPasswordResetEmail(auth, email, {
				url: window.location.origin + "/redefinir-senha",
			});

			setSuccess(true);
		} catch (err) {
			setError("Erro ao enviar email.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Card sx={{ width: 380 }}>
				<CardContent>
					<Typography variant="h5" fontWeight={700} mb={2}>
						Redefinir senha
					</Typography>

					{success && (
						<Alert severity="success" sx={{ mb: 2 }}>
							Email enviado. Verifique sua caixa de entrada.
						</Alert>
					)}

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					{!success && (
						<>
							<TextField
								label="Email"
								fullWidth
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								sx={{ mb: 2 }}
							/>

							<Button
								variant="contained"
								fullWidth
								onClick={handleResetEmail}
								disabled={loading || success}
								sx={{ mt: 2 }}
							>
								{loading ? (
									<CircularProgress
										size={22}
										sx={{ color: "#fff" }}
									/>
								) : success ? (
									"Email enviado"
								) : (
									"Enviar email de redefinição"
								)}
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
