import {
	Box,
	Card,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from "@mui/material";
import ProfileSettingsCard from "../components/settings/ProfileSettingsCard";
import ProfileIncidentsTypeCard from "../components/settings/ProfileIncidentsTypeCard";
import { auth, storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";

import { useEffect, useState } from "react";
import { MailLock } from "@mui/icons-material";

export default function SettingsPage() {
	const [profile, setProfile] = useState({
		name: "",
		email: "",
		avatar: "",
	});
	const [openResetDialog, setOpenResetDialog] = useState(false);
	const [avatarFile, setAvatarFile] = useState(null);

	const authUser = auth.currentUser;

	useEffect(() => {
		if (!authUser) return;

		setProfile((prev) => ({
			...prev,
			name: authUser.displayName || "",
			email: authUser.email || "",
			avatar: prev.avatar || authUser.photoURL || "",
		}));
	}, [authUser]);

	const handleAvatarChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// reset do input (IMPORTANTE)
		e.target.value = "";

		if (!file.type.startsWith("image/")) {
			console.warn("Arquivo inválido");
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			console.warn("Imagem maior que 2MB");
			return;
		}

		// 🔹 Preview imediato
		const previewUrl = URL.createObjectURL(file);
		setProfile((prev) => ({
			...prev,
			avatar: previewUrl,
		}));

		try {
			const authUser = auth.currentUser;

			if (!authUser) {
				console.error("Usuário não autenticado no Auth");
				return;
			}

			console.log("Uploading avatar for:", authUser.uid);

			const avatarRef = ref(storage, `users/${authUser.uid}/avatar.jpg`);

			// 🔹 Upload
			await uploadBytes(avatarRef, file);

			// 🔹 Download URL + cache bust
			const downloadUrl = await getDownloadURL(avatarRef);
			const finalUrl = `${downloadUrl}?v=${Date.now()}`;

			// 🔹 Atualiza Auth
			await updateProfile(authUser, {
				photoURL: finalUrl,
			});

			// 🔹 Atualiza estado final
			setProfile((prev) => ({
				...prev,
				avatar: finalUrl,
			}));

			console.log("Avatar atualizado com sucesso");

			// limpa preview
			URL.revokeObjectURL(previewUrl);
		} catch (error) {
			console.error("Erro ao atualizar avatar:", error);
		}
	};

	const handleSaveProfile = async () => {
		if (!user) return;

		let avatarUrl = profile.avatar;

		if (avatarFile) {
			const avatarRef = ref(storage, `users/${user.uid}/avatar.jpg`);
			await uploadBytes(avatarRef, avatarFile);
			avatarUrl = await getDownloadURL(avatarRef);
		}

		await updateProfile(user, {
			photoURL: avatarUrl,
		});
	};

	const handleResetPassword = async () => {
		if (!user?.email) return;
		await sendPasswordResetEmail(auth, user.email);
		setOpenResetDialog(true);
	};

	return (
		<Box>
			<Typography variant="h4" fontWeight={700} mb={3}>
				Configurações
			</Typography>

			<Card sx={{ p: 3 }}>
				<ProfileSettingsCard
					profile={profile}
					handleAvatarChange={handleAvatarChange}
				/>
				<ProfileIncidentsTypeCard />

				<Box display="flex" justifyContent="center" mt={3} gap={2}>
					<Button
						variant="contained"
						startIcon={<MailLock />}
						onClick={handleResetPassword}
					>
						Redefinir senha
					</Button>
					<Button variant="contained" onClick={handleSaveProfile}>
						Salvar perfil
					</Button>
				</Box>
			</Card>

			<Dialog
				open={openResetDialog}
				onClose={() => setOpenResetDialog(false)}
			>
				<DialogTitle>Redefinição de senha</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Se o e-mail existir, uma mensagem foi enviada.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenResetDialog(false)}>
						OK
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
