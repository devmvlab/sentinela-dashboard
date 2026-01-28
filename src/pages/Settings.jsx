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
import {
	updateProfile,
	sendPasswordResetEmail,
	onAuthStateChanged,
} from "firebase/auth";

import { useEffect, useState } from "react";
import { MailLock } from "@mui/icons-material";

export default function SettingsPage() {
	// =============================
	// STATE
	// =============================
	const [authUser, setAuthUser] = useState(null);
	const [openResetDialog, setOpenResetDialog] = useState(false);
	const [profile, setProfile] = useState({
		name: "",
		email: "",
		avatar: "",
	});
	const [uploadingAvatar, setUploadingAvatar] = useState(false);

	// =============================
	// AUTH REATIVO
	// =============================
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setAuthUser(user);
		});

		return unsubscribe;
	}, []);

	// =============================
	// INICIALIZA PERFIL (AUTH-ONLY)
	// =============================
	useEffect(() => {
		if (!authUser) return;

		setProfile((prev) => ({
			...prev,
			name: authUser.displayName || "",
			email: authUser.email || "",
			avatar: prev.avatar || authUser.photoURL || "",
		}));
	}, [authUser]);

	// =============================
	// AVATAR: PREVIEW + UPLOAD IMEDIATO
	// =============================
	const handleAvatarChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		e.target.value = "";

		if (!file.type.startsWith("image/")) return;
		if (file.size > 2 * 1024 * 1024) return;

		const previewUrl = URL.createObjectURL(file);
		setProfile((prev) => ({
			...prev,
			avatar: previewUrl,
		}));

		try {
			setUploadingAvatar(true);

			if (!authUser) return;

			const fileExt = file.name.split(".").pop();
			const avatarRef = ref(
				storage,
				`users/${authUser.uid}/avatar_${Date.now()}.${fileExt}`,
			);

			await uploadBytes(avatarRef, file);

			const downloadUrl = await getDownloadURL(avatarRef);

			await updateProfile(authUser, {
				photoURL: downloadUrl,
			});

			await authUser.reload();

			setProfile((prev) => ({
				...prev,
				avatar: downloadUrl,
			}));

			URL.revokeObjectURL(previewUrl);
		} catch (error) {
			console.error("Erro ao atualizar avatar:", error);
		} finally {
			setUploadingAvatar(false);
		}
	};

	// =============================
	// RESET DE SENHA
	// =============================
	const handleResetPassword = async () => {
		if (!authUser?.email) return;

		await sendPasswordResetEmail(auth, authUser.email);
		setOpenResetDialog(true);
	};

	// =============================
	// RENDER
	// =============================
	return (
		<Box>
			<Typography variant="h4" fontWeight={700} mb={3}>
				Configurações
			</Typography>

			<Card sx={{ p: 3 }}>
				<ProfileSettingsCard
					profile={profile}
					handleAvatarChange={handleAvatarChange}
					uploadingAvatar={uploadingAvatar}
				/>

				<ProfileIncidentsTypeCard />

				<Box display="flex" justifyContent="center" mt={3}>
					<Button
						variant="contained"
						startIcon={<MailLock />}
						onClick={handleResetPassword}
					>
						Redefinir senha
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
