import {
	AppBar,
	Toolbar,
	IconButton,
	Typography,
	Box,
	Avatar,
	Menu,
	MenuItem,
	Divider,
	Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useTheme } from "@mui/material/styles";
import { onAuthStateChanged } from "firebase/auth";

import logo from "../assets/logo1.png";

/* Firebase imports */
import { db } from "../services/firebase";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { useSentinelaData } from "../utils/SentinelaDataContext";

export default function Topbar({ handleDrawerOpen }) {
	const theme = useTheme();
	const navigate = useNavigate();

	const [incidentTypes, setIncidentTypes] = useState(null);

	// AJUSTE 1 — trava temporária após salvar config
	const [configSyncing, setConfigSyncing] = useState(false);
	const [authUser, setAuthUser] = useState(null);

	// AJUSTE 2 — marco temporal para não notificar histórico
	const notificationsStartAt = useRef(Date.now());

	const { userCity, loading } = useSentinelaData();

	// profile menu
	const [anchorEl, setAnchorEl] = useState(null);
	const openProfileMenu = (e) => setAnchorEl(e.currentTarget);
	const closeProfileMenu = () => setAnchorEl(null);

	const handleLogout = async () => {
		await signOut(auth);
		navigate("/");
	};

	// --- Notificações (globais) ---
	const [novaOcorrencia, setNovaOcorrencia] = useState(false);
	const [contadorNovas, setContadorNovas] = useState(0);
	const [toasts, setToasts] = useState([]);
	const [menuAberto, setMenuAberto] = useState(false);
	const [historicoNotificacoes, setHistoricoNotificacoes] = useState([]);

	useEffect(() => {
		const updateAvatar = async () => {
			const user = auth.currentUser;
			if (!user) return;

			await user.reload();
			setAuthUser({ ...user });
		};

		window.addEventListener("avatar-updated", updateAvatar);

		return () => {
			window.removeEventListener("avatar-updated", updateAvatar);
		};
	}, []);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setAuthUser(user);
		});

		return unsubscribe;
	}, []);

	// ref para o container do dropdown (fechar ao clicar fora)
	const dropdownRef = useRef(null);

	// função para tocar som e adicionar toast/historico
	const adicionarToast = (oc) => {
		const id = Date.now();
		setToasts((prev) => [...prev, { id, ...oc }]);

		setHistoricoNotificacoes((prev) => {
			const novaLista = [{ ...oc }, ...prev];
			return novaLista.slice(0, 10);
		});

		try {
			const audio = new Audio("/alert.mp3");
			audio.volume = 0.7;
			audio.play().catch(() => {});
		} catch {}

		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 6000);
	};

	useEffect(() => {
		const unlockAudio = () => {
			const audio = new Audio("/alert.mp3");
			audio.volume = 0;
			audio
				.play()
				.then(() => {
					audio.pause();
					audio.currentTime = 0;
				})
				.catch(() => {});
		};

		window.addEventListener("click", unlockAudio, { once: true });
		return () => window.removeEventListener("click", unlockAudio);
	}, []);

	// AJUSTE 3 — se acabou de salvar config, bloqueia temporariamente
	useEffect(() => {
		if (localStorage.getItem("incidentTypesSyncing") === "true") {
			setConfigSyncing(true);
		}
	}, []);

	// listener realtime das configs
	useEffect(() => {
		let unsubscribeSettings = null;

		const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
			if (!user) {
				setIncidentTypes(null);
				if (unsubscribeSettings) unsubscribeSettings();
				return;
			}

			const ref = doc(db, "users", user.uid, "settings", "default");

			unsubscribeSettings = onSnapshot(ref, (snap) => {
				if (!snap.exists()) {
					setIncidentTypes([]);
				} else {
					const data = snap.data();
					setIncidentTypes(
						Array.isArray(data.incidentTypes)
							? data.incidentTypes
							: [],
					);
				}

				// 🔧 AJUSTE — config confirmada
				setConfigSyncing(false);
				localStorage.removeItem("incidentTypesSyncing");
				notificationsStartAt.current = Date.now();
			});
		});

		return () => {
			if (unsubscribeSettings) unsubscribeSettings();
			unsubscribeAuth();
		};
	}, []);

	// listener realtime das ocorrências
	useEffect(() => {
		if (loading) return;
		if (!userCity) return;

		const q = query(
			collection(db, "incidents"),
			where("geoloc.cityId", "==", userCity),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			snapshot.docChanges().forEach((change) => {
				if (change.type !== "added") return;

				const nova = {
					id: change.doc.id,
					...change.doc.data(),
				};

				const tipoOcorrencia = nova.ocorrencia?.tipo;

				// AJUSTE — bloqueios corretos

				// config acabou de salvar
				if (configSyncing) return;

				// config ainda não carregou
				if (incidentTypes === null) return;

				// tipo não permitido
				if (!incidentTypes.includes(tipoOcorrencia)) return;

				// ocorrência antiga (já existia antes)
				const createdAt =
					nova.createdAt?.toMillis?.() ??
					nova.createdAt ??
					Date.now();

				if (createdAt < notificationsStartAt.current) return;

				setNovaOcorrencia(true);
				setContadorNovas((prev) => prev + 1);
				adicionarToast(nova);
			});
		});

		return () => unsubscribe();
	}, [userCity, loading, incidentTypes, configSyncing]);

	// fechar dropdown ao clicar fora
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target)
			) {
				setMenuAberto(false);
			}
		};

		if (menuAberto) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [menuAberto]);

	// render do dropdown (últimas 10)
	const NotificacoesDropdown = menuAberto && (
		<Box
			ref={dropdownRef}
			sx={{
				position: "absolute",
				top: 64,
				right: 16,
				width: 360,
				maxHeight: 420,
				overflowY: "auto",
				backgroundColor: theme.palette.background.paper,
				borderRadius: 2,
				boxShadow: "0 8px 22px rgba(0,0,0,0.35)",
				padding: 2,
				zIndex: 1400,
				animation: "fadeIn 0.18s ease",
			}}
		>
			<Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
				Notificações
			</Typography>

			{historicoNotificacoes.length === 0 && (
				<Typography variant="body2" sx={{ opacity: 0.6 }}>
					Sem notificações recentes
				</Typography>
			)}

			{historicoNotificacoes.map((t, i) => (
				<Box
					key={t.id ?? i}
					sx={{
						padding: "10px 12px",
						borderBottom: "1px solid rgba(0,0,0,0.06)",
						cursor: "pointer",
						"&:hover": {
							backgroundColor: theme.palette.action.hover,
						},
					}}
					onClick={() => {
						setMenuAberto(false);

						navigate("/ocorrencias", {
							state: {
								openIncidentId: t.id,
							},
						});
					}}
				>
					<Typography variant="subtitle2" fontWeight={700}>
						{t.ocorrencia?.categoria || "Nova ocorrência"}
					</Typography>

					<Typography variant="body2" sx={{ opacity: 0.9 }}>
						{t.ocorrencia?.tipo}
					</Typography>

					{t.geoloc?.address && (
						<Typography variant="body2">
							<b>Endereço:</b> {t.geoloc.address}
						</Typography>
					)}

					<Typography variant="caption" sx={{ opacity: 0.6 }}>
						{t.geoloc.city} — {t.hora}
					</Typography>
				</Box>
			))}

			{historicoNotificacoes.length > 0 && (
				<Box sx={{ mt: 1, textAlign: "center" }}>
					<Typography
						variant="button"
						onClick={() => {
							setHistoricoNotificacoes([]);
						}}
						sx={{
							cursor: "pointer",
							color: theme.palette.primary.main,
						}}
					>
						Limpar
					</Typography>
				</Box>
			)}
		</Box>
	);

	// Toasts UI (fixed)
	const ToastContainer = (
		<Box
			sx={{
				position: "fixed",
				top: 20,
				right: 20,
				zIndex: 9999,
				display: "flex",
				flexDirection: "column",
				gap: 2,
			}}
		>
			{toasts.map((t) => (
				<Box
					key={t.id}
					sx={{
						width: 340,
						backgroundColor: theme.palette.background.paper,
						borderRadius: 3,
						padding: 2,
						boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
						animation: "slideIn 0.35s ease, fadeOut 0.5s ease 5.5s",
						borderLeft: `6px solid ${theme.palette.primary.main}`,
					}}
				>
					<Typography variant="subtitle1" fontWeight={700}>
						{t.ocorrencia?.categoria || "Nova ocorrência"}
					</Typography>

					<Typography variant="body2" sx={{ opacity: 0.9 }}>
						{t.ocorrencia?.tipo}
					</Typography>

					{t.geoloc?.address && (
						<Typography variant="body2">
							<b>Endereço:</b> {t.geoloc.address}
						</Typography>
					)}

					<Typography variant="body2">
						<b>Hora:</b> {t.hora} - {t.geoloc.city}
					</Typography>

					<Box
						onClick={() =>
							setToasts((prev) =>
								prev.filter((p) => p.id !== t.id),
							)
						}
						sx={{
							cursor: "pointer",
							mt: 1,
							textAlign: "right",
							fontWeight: "bold",
							color: theme.palette.primary.main,
						}}
					>
						Fechar
					</Box>
				</Box>
			))}
		</Box>
	);

	return (
		<AppBar
			position="fixed"
			sx={{
				backgroundColor: "background.dark",
				boxShadow: "none",
				zIndex: (theme) => theme.zIndex.drawer + 1,
				borderRadius: 0,
				borderBottom: "1px solid #ffffff33",
			}}
		>
			<Toolbar style={{ paddingLeft: "12px", paddingRight: "12px" }}>
				<IconButton onClick={handleDrawerOpen} sx={{ mr: 2 }}>
					<MenuIcon />
				</IconButton>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<img
						src={logo}
						alt="Sentinela"
						style={{
							height: 72,
							objectFit: "contain",
							marginRight: 8,
						}}
					/>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						SENTINELA
					</Typography>
				</Box>
				{/* empurra o resto para a direita */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "center",
						flex: 1,
					}}
				>
					{auth.currentUser?.displayName}

					{/* SINO (badge) */}
					<Box
						sx={{
							position: "relative",
							display: "flex",
							alignItems: "center",
							marginX: 1,
						}}
					>
						<IconButton
							onClick={() => {
								setMenuAberto((prev) => !prev);
								setNovaOcorrencia(false);
								setContadorNovas(0);
							}}
						>
							<Badge
								color="error"
								variant={contadorNovas > 0 ? "standard" : null}
								badgeContent={
									contadorNovas > 0 ? contadorNovas : null
								}
							>
								<NotificationsIcon
									sx={{
										fontSize: 28,
										color: theme.palette.text.primary,
									}}
								/>
							</Badge>
						</IconButton>

						{/* dropdown posicionado relativo ao AppBar */}
						{NotificacoesDropdown}
					</Box>
					{/* AVATAR / MENU PERFIL */}
					<IconButton onClick={openProfileMenu}>
						<Avatar
							src={authUser?.photoURL}
							sx={{ bgcolor: "primary.main" }}
						>
							{authUser?.displayName?.charAt(0)}
						</Avatar>
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={closeProfileMenu}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "right",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "right",
						}}
					>
						<MenuItem
							onClick={() => {
								navigate("/configuracoes");
								closeProfileMenu();
							}}
						>
							<SettingsIcon sx={{ mr: 1 }} /> Configurações
						</MenuItem>
						<Divider />
						<MenuItem onClick={handleLogout}>
							<LogoutIcon sx={{ mr: 1 }} /> Sair
						</MenuItem>
					</Menu>
					{/* Toasts (global) */}
					{/* {ToastContainer} */}
					{/* animações CSS keyframes inline */}
					<Box
						sx={{
							"@keyframes slideIn": {
								from: {
									transform: "translateX(140%)",
									opacity: 0,
								},
								to: { transform: "translateX(0)", opacity: 1 },
							},
							"@keyframes fadeOut": {
								from: { opacity: 1 },
								to: { opacity: 0 },
							},
							"@keyframes fadeIn": {
								from: {
									opacity: 0,
									transform: "translateY(-5px)",
								},
								to: { opacity: 1, transform: "translateY(0)" },
							},
						}}
					/>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
