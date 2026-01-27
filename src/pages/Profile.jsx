import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Grid,
	TextField,
	Typography,
} from "@mui/material";
import { useRef, useState, useEffect } from "react";
import { auth } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { storage } from "../services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
	const [openResetDialog, setOpenResetDialog] = useState(false);
	const navigate = useNavigate();

	const fileInputRef = useRef(null);
	const [avatarFile, setAvatarFile] = useState(null);

	const user = auth.currentUser;

	// Estado inicial neutro (seguro)
	const [profile, setProfile] = useState({
		name: "",
		email: "",
		avatar: "",
	});

	//  Popula dados e avatar quando o user existir
	useEffect(() => {
		if (user) {
			setProfile((prev) => ({
				...prev,
				name: user.displayName || "",
				email: user.email || "",
				avatar: user.photoURL || "",
			}));
		}
	}, [user]);

	const handleChange = (e) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	const handleAvatarClick = () => {
		fileInputRef.current.click();
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		// validação básica
		if (!file.type.startsWith("image/")) return;
		if (file.size > 2 * 1024 * 1024) return; // 2MB

		setAvatarFile(file);

		const preview = URL.createObjectURL(file);
		setProfile({ ...profile, avatar: preview });
	};

	const handleSubmit = async () => {
		try {
			const authUser = user;

			if (!authUser) {
				throw new Error("Usuário não autenticado");
			}

			let avatarUrl = profile.avatar;

			// Upload do avatar
			if (avatarFile) {
				const avatarRef = ref(
					storage,
					`users/${authUser.uid}/avatar.jpg`,
				);

				await uploadBytes(avatarRef, avatarFile);
				avatarUrl = await getDownloadURL(avatarRef);
			}

			// Atualiza Firebase Auth
			await updateProfile(authUser, {
				displayName: profile.name,
				photoURL: avatarUrl,
			});
		} catch (error) {
			console.error("Erro ao salvar perfil:", error);
		}
	};

	const handleResetPassword = async () => {
		try {
			if (!user?.email) {
				throw new Error("E-mail do usuário não encontrado");
			}

			await sendPasswordResetEmail(auth, user.email);

			setOpenResetDialog(true);
		} catch (error) {
			console.error("Erro ao redefinir senha:", error);
		}
	};

	const handleCloseResetDialog = () => {
		setOpenResetDialog(false);
		navigate("/dashboard");
	};

	return (
		<Box display="flex" justifyContent="center">
			<Card sx={{ width: "100%", maxWidth: 520 }}>
				<Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
					<DialogTitle>Redefinição de senha</DialogTitle>

					<DialogContent>
						<DialogContentText>
							Se o e-mail existir, uma mensagem de redefinição de
							senha foi enviada.
						</DialogContentText>
					</DialogContent>

					<DialogActions>
						<Button
							onClick={handleCloseResetDialog}
							variant="contained"
							color="primary"
						>
							OK
						</Button>
					</DialogActions>
				</Dialog>

				<CardContent>
					{/* Avatar centralizado */}
					<Box
						display="flex"
						flexDirection="column"
						alignItems="center"
						mb={3}
					>
						<Avatar
							src={profile.avatar}
							sx={{
								width: 96,
								height: 96,
								cursor: "pointer",
								mb: 1,
							}}
							onClick={handleAvatarClick}
						/>
						<input
							type="file"
							accept="image/png, image/jpeg"
							hidden
							ref={fileInputRef}
							onChange={handleAvatarChange}
						/>

						<Typography fontWeight={600}>{profile.name}</Typography>
						<Typography color="text.secondary" fontSize={14}>
							Usuário do Sistema
						</Typography>
					</Box>

					{/* Campos */}
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								disabled
								label="Nome"
								name="name"
								value={profile.name}
								onChange={handleChange}
								fullWidth
							/>
						</Grid>

						<Grid item xs={12}>
							<TextField
								disabled
								label="E-mail"
								name="email"
								value={profile.email}
								onChange={handleChange}
								fullWidth
							/>
						</Grid>
					</Grid>

					{/* Botão */}

					<Box display="flex" justifyContent="center" mt={3}>
						<Button
							sx={{ mr: 2 }}
							variant="contained"
							color="primary"
							onClick={handleResetPassword}
						>
							Redefinir senha
						</Button>

						<Button
							variant="contained"
							color="primary"
							onClick={handleSubmit}
						>
							Salvar alterações
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}
