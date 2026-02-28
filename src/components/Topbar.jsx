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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoIcon from "@mui/icons-material/Info";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TimerIcon from "@mui/icons-material/Timer";
import SosIcon from "@mui/icons-material/Sos";

import { useTheme, darken } from "@mui/material/styles";

import logo from "../assets/logo1.png";

/* Firebase imports */
import { db } from "../services/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

export default function Topbar({ handleDrawerOpen }) {
	const theme = useTheme();
	const navigate = useNavigate();

	// AJUSTE 2 — marco temporal para não notificar histórico
	const notificationsStartAt = useRef(Date.now());

	const { cityId, loading, name, photoURL, incidentTypes, logout } =
		useAuth();

	// profile menu
	const [anchorEl, setAnchorEl] = useState(null);
	const openProfileMenu = (e) => setAnchorEl(e.currentTarget);
	const closeProfileMenu = () => setAnchorEl(null);

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	// --- Notificações (globais) ---
	const [novaOcorrencia, setNovaOcorrencia] = useState(false);
	const [contadorNovas, setContadorNovas] = useState(0);
	const [toasts, setToasts] = useState([]);
	const [menuAberto, setMenuAberto] = useState(false);
	const [historicoNotificacoes, setHistoricoNotificacoes] = useState([]);
	const [panicOpen, setPanicOpen] = useState(false);
	const [panicData, setPanicData] = useState(null);
	const [elapsedTime, setElapsedTime] = useState("00:00:00");

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

	// listener realtime das ocorrências
	useEffect(() => {
		if (loading) return;
		if (!cityId) return;

		const q = query(
			collection(db, "incidents"),
			where("geoloc.cityId", "==", cityId),
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			snapshot.docChanges().forEach((change) => {
				if (change.type !== "added") return;

				const nova = {
					id: change.doc.id,
					...change.doc.data(),
				};

				const tipoOcorrencia = nova.ocorrencia?.tipo;

				// SE FOR PÂNICO
				if (nova.type === "panic") {
					const createdAt =
						nova.createdAt?.toMillis?.() ??
						nova.createdAt ??
						Date.now();

					if (createdAt < notificationsStartAt.current) return;

					setPanicData(nova);
					setPanicOpen(true);

					try {
						const audio = new Audio("/warning.mp3");
						audio.volume = 0.4;
						audio.play().catch(() => {});
					} catch {}

					return; // não continua fluxo normal
				}

				// tipo não permitido
				if (!incidentTypes.includes(tipoOcorrencia)) return;

				// ocorrência antiga
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
	}, [cityId, loading, incidentTypes]);

	useEffect(() => {
		if (!loading && incidentTypes) {
			notificationsStartAt.current = Date.now();
		}
	}, [loading, incidentTypes]);

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

	//Cronômetro para o modal de pânico
	useEffect(() => {
		if (!panicOpen || !panicData?.createdAt) return;

		const created =
			panicData.createdAt?.toMillis?.() ??
			new Date(panicData.createdAt).getTime();

		const interval = setInterval(() => {
			const now = Date.now();
			const diff = now - created;

			if (diff < 0) diff = 0;

			const hours = Math.floor(diff / 3600000);
			const minutes = Math.floor((diff % 3600000) / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);

			const format = (n) => String(n).padStart(2, "0");

			setElapsedTime(
				`${format(hours)}:${format(minutes)}:${format(seconds)}`,
			);
		}, 1000);

		return () => clearInterval(interval);
	}, [panicOpen, panicData]);

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
					{name}

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
						<Avatar src={photoURL} sx={{ bgcolor: "primary.main" }}>
							{name?.charAt(0)}
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

			<Dialog
				open={panicOpen}
				onClose={() => setPanicOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				{/* HEADER VERMELHO */}
				<DialogTitle
					sx={{
						background: theme.palette.background.paper,
						color: "#fff",
						py: 2,
					}}
				>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Box>
							<Typography
								variant="caption"
								sx={{ opacity: 0.8, letterSpacing: 1 }}
							>
								ALERTA DE EMERGÊNCIA
							</Typography>

							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								BOTÃO DE PÂNICO ACIONADO
							</Typography>
						</Box>

						<IconButton
							onClick={() => setPanicOpen(false)}
							sx={{ color: "#fff" }}
						>
							<CloseIcon />
						</IconButton>
					</Box>
				</DialogTitle>

				<Divider />

				{/* CONTEÚDO */}
				<DialogContent sx={{ py: 3 }}>
					<Box
						sx={{
							backgroundColor: theme.palette.background.default,
							borderRadius: 2,
							mt: 2,
							padding: 2,
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						{/* Categoria */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
							}}
						>
							<Typography variant="subtitle1" fontWeight={600}>
								<b>Categoria: </b>
								{panicData?.ocorrencia?.categoria ||
									"Emergência"}
							</Typography>
						</Box>

						{/* Tipo */}
						<Typography variant="body1">
							<b>Tipo:</b> {panicData?.ocorrencia?.tipo}
						</Typography>

						{/* Endereço */}
						{panicData?.geoloc?.address && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
								}}
							>
								<Typography variant="body1">
									<b>Endereço: </b>
									{panicData.geoloc.address}
								</Typography>
							</Box>
						)}

						{/* Descrição */}
						{panicData?.desc && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
								}}
							>
								<Typography variant="body1">
									<b>Descrição:</b> {panicData.desc}
								</Typography>
							</Box>
						)}

						{/* Cronômetro */}
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								backgroundColor: theme.palette.other.error,
								padding: 1.5,
								borderRadius: 2,
								mb: 2,
							}}
						>
							<b>Tempo decorrido: </b>
							<Typography
								variant="h6"
								sx={{
									ml: 1,
									fontWeight: 700,
									color: theme.palette.text.primary,
									letterSpacing: 1,
								}}
							>
								{elapsedTime}
							</Typography>
						</Box>
					</Box>
				</DialogContent>

				{/* AÇÕES */}
				<DialogActions
					sx={{
						justifyContent: "center",
						pb: 3,
						gap: 2,
					}}
				>
					<Button
						onClick={() => {
							setPanicOpen(false);
							navigate("/ocorrencias", {
								state: { openIncidentId: panicData?.id },
							});
						}}
						variant="contained"
						color="error"
						sx={{
							fontWeight: 700,
						}}
					>
						VER OCORRÊNCIA
					</Button>
				</DialogActions>
			</Dialog>
		</AppBar>
	);
}
