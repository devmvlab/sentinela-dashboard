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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
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
			await signInWithEmailAndPassword(auth, email, password);
			navigate("/dashboard");
		} catch (err) {
			console.log(err);
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
					paddingY: 3,
					boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
				}}
			>
				<CardContent>
					{/* LOGO */}
					<img
						src={logo}
						alt="Sentinela"
						style={{
							width: 130,
							height: 130,
							objectFit: "contain",
							marginBottom: 8,
						}}
					/>

					<Typography
						variant="h5"
						fontWeight={700}
						color="primary.main"
						sx={{ mb: 3 }}
					>
						Sentinela
					</Typography>

					{/* EMAIL */}
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

					{/* PASSWORD */}
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

					{/* ERROR MESSAGE */}
					{hasError && (
						<Typography
							color="error"
							sx={{ mt: 1, mb: 1, fontSize: "0.9rem" }}
						>
							{errorMsg}
						</Typography>
					)}

					{/* BUTTON LOGIN */}
					<Button
						variant="contained"
						fullWidth
						onClick={handleLogin}
						disabled={loading}
						sx={{
							mt: 2,
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

					{/* REGISTER */}
					<Button
						variant="text"
						sx={{
							mt: 1,
							fontWeight: 700,
							color: "primary.main",
						}}
					>
						Registrar-se
					</Button>
				</CardContent>
			</Card>
		</Box>
	);
}
