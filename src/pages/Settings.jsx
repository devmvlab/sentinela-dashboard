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
	Snackbar,
	Alert,
} from "@mui/material";
import ProfileSettingsCard from "../components/settings/ProfileSettingsCard";
import ProfileIncidentsTypeCard from "../components/settings/ProfileIncidentsTypeCard";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

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
	const [incidentTypes, setIncidentTypes] = useState([]);
	const [loadingIncidents, setLoadingIncidents] = useState(true);
	const [feedback, setFeedback] = useState({
		open: false,
		message: "",
		severity: "success",
	});

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

	useEffect(() => {
		const loadUserSettings = async () => {
			if (!authUser) return;

			try {
				const ref = doc(
					db,
					"users",
					authUser.uid,
					"settings",
					"default",
				);
				const snap = await getDoc(ref);

				if (snap.exists()) {
					const data = snap.data();
					if (Array.isArray(data.incidentTypes)) {
						setIncidentTypes(data.incidentTypes);
					}
				}
			} catch (err) {
				console.error("Erro ao carregar configurações:", err);
			} finally {
				setLoadingIncidents(false);
			}
		};

		loadUserSettings();
	}, [authUser]);

	const handleToggleIncidentType = (itemTitle) => {
		setIncidentTypes((prev) =>
			prev.includes(itemTitle)
				? prev.filter((i) => i !== itemTitle)
				: [...prev, itemTitle],
		);
	};

	const saveUserSettings = async () => {
		try {
			if (!authUser) return;

			await updateDoc(
				doc(db, "users", authUser.uid, "settings", "default"),
				{
					incidentTypes,
					updatedAt: serverTimestamp(),
				},
			);

			// trava temporária da topbar
			localStorage.setItem("incidentTypesSyncing", "true");

			setFeedback({
				open: true,
				message: "Configurações salvas com sucesso!",
				severity: "success",
			});
		} catch (error) {
			setFeedback({
				open: true,
				message: "Erro ao salvar configurações.",
				severity: "error",
			});
		}
	};

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

			// 🔥 avisa o app inteiro
			window.dispatchEvent(new Event("avatar-updated"));

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

				<ProfileIncidentsTypeCard
					incidentTypes={incidentTypes}
					onToggle={handleToggleIncidentType}
					loading={loadingIncidents}
				/>

				<Box display="flex" justifyContent="center" mt={3}>
					<Button
						variant="contained"
						startIcon={<MailLock />}
						onClick={handleResetPassword}
						sx={{ ml: 1 }}
					>
						Redefinir senha
					</Button>
					<Button
						variant="contained"
						size="large"
						sx={{ ml: 1 }}
						onClick={saveUserSettings}
					>
						Salvar
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

			<Snackbar
				open={feedback.open}
				autoHideDuration={4000}
				onClose={() => setFeedback({ ...feedback, open: false })}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Alert severity={feedback.severity} variant="filled">
					{feedback.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
