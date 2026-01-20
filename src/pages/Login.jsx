import { useState } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	TextField,
	Typography,
	IconButton,
	InputAdornment,
	CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import logo from "../assets/logo1.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const navigate = useNavigate();
	const hasError = !!errorMsg;

	const handleLogin = async () => {
		setErrorMsg("");
		setLoading(true);

		try {
			// 1️⃣ Login Firebase Auth
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password,
			);

			const user = userCredential.user;

			// 2️⃣ Busca usuário no Firestore
			const userRef = doc(db, "users", user.uid);
			const userSnap = await getDoc(userRef);

			if (!userSnap.exists()) {
				await signOut(auth);
				setErrorMsg("Usuário não autorizado.");
				return;
			}

			const userData = userSnap.data();

			// 3️⃣ Valida admin
			if (userData.isAdmin !== true) {
				await signOut(auth);
				setErrorMsg("Acesso restrito à administração.");
				return;
			}

			// 4️⃣ OK → dashboard
			navigate("/dashboard");
		} catch (err) {
			console.error(err);
			setErrorMsg("Email ou senha inválidos.");
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
					backgroundColor: "background.paper",
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
							width: 130,
							height: 130,
							objectFit: "contain",
						}}
					/>

					<Typography variant="h5" fontWeight={700}>
						SENTINELA
					</Typography>

					<Typography
						variant="caption"
						color="text.primary"
						sx={{
							mb: 3,
						}}
					>
						Segurança colaborativa em tempo real
					</Typography>

					<TextField
						label="Email"
						type="email"
						fullWidth
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						margin="normal"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Email sx={{ color: "text.secondary" }} />
								</InputAdornment>
							),
						}}
					/>

					<TextField
						label="Senha"
						type={showPassword ? "text" : "password"}
						fullWidth
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						margin="normal"
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Lock sx={{ color: "text.secondary" }} />
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										onClick={() =>
											setShowPassword((prev) => !prev)
										}
										edge="end"
										sx={{ color: "text.secondary" }}
									>
										{showPassword ? (
											<VisibilityOff />
										) : (
											<Visibility />
										)}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					{hasError && (
						<Typography
							color="error"
							sx={{ mt: 1, mb: 1, fontSize: "0.9rem" }}
						>
							{errorMsg}
						</Typography>
					)}

					<Box sx={{ mt: 2, mb: 3 }}>
						<Button
							variant="contained"
							fullWidth
							onClick={handleLogin}
							disabled={loading}
							sx={{
								py: 1.2,
								borderRadius: 2,
								fontWeight: 700,
							}}
						>
							{loading ? (
								<CircularProgress
									size={26}
									sx={{ color: "#20284E" }}
								/>
							) : (
								"Entrar"
							)}
						</Button>
					</Box>
				</CardContent>

				<Box sx={{ mt: 4 }}>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{
							textAlign: "center",
							opacity: 0.6,
						}}
					>
						Plataforma de monitoramento
					</Typography>
				</Box>
			</Card>
		</Box>
	);
}
