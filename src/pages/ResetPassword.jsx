import { useState, useEffect } from "react";
import {
	Box,
	Card,
	CardContent,
	TextField,
	Button,
	Typography,
	CircularProgress,
	Alert,
} from "@mui/material";

import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

import { auth } from "../services/firebase";
import logo from "../assets/logo1.png";

export default function ResetPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [validating, setValidating] = useState(true);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const params = new URLSearchParams(window.location.search);
	const oobCode = params.get("oobCode");

	useEffect(() => {
		const checkCode = async () => {
			try {
				await verifyPasswordResetCode(auth, oobCode);
			} catch (err) {
				setError("Link inválido ou expirado.");
			} finally {
				setValidating(false);
			}
		};

		if (oobCode) checkCode();
		else {
			setError("Link inválido.");
			setValidating(false);
		}
	}, [oobCode]);

	const handleReset = async () => {
		setError("");

		if (!password || !confirmPassword) {
			setError("Preencha todos os campos.");
			return;
		}

		if (password.length < 6) {
			setError("A senha deve ter pelo menos 6 caracteres.");
			return;
		}

		if (password !== confirmPassword) {
			setError("As senhas não coincidem.");
			return;
		}

		setLoading(true);

		try {
			await confirmPasswordReset(auth, oobCode, password);
			setSuccess(true);
		} catch (err) {
			setError("Erro ao redefinir senha.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				backgroundColor: "background.default",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				px: 2,
			}}
		>
			<Card
				sx={{
					width: 380,
					borderRadius: 4,
					textAlign: "center",
					paddingY: 1,
					boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
				}}
			>
				<CardContent>
					<img
						src={logo}
						alt="Sentinela"
						style={{
							width: 120,
							height: 120,
							objectFit: "contain",
						}}
					/>

					<Typography variant="h5" fontWeight={700} mb={2}>
						Redefinir senha
					</Typography>

					{validating && <CircularProgress />}

					{error && (
						<Alert severity="error" sx={{ mt: 2 }}>
							{error}
						</Alert>
					)}

					{success && (
						<Alert severity="success" sx={{ mt: 2 }}>
							Senha redefinida com sucesso.
						</Alert>
					)}

					{!validating && !error && !success && (
						<>
							<TextField
								label="Nova senha"
								type="password"
								fullWidth
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								margin="normal"
							/>

							<TextField
								label="Confirmar senha"
								type="password"
								fullWidth
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								margin="normal"
							/>

							<Button
								variant="contained"
								fullWidth
								onClick={handleReset}
								disabled={loading}
								sx={{
									mt: 2,
									py: 1.2,
									borderRadius: 2,
									fontWeight: 700,
								}}
							>
								{loading ? (
									<CircularProgress size={24} />
								) : (
									"Redefinir senha"
								)}
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
