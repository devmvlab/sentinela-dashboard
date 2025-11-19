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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

import logo from "../assets/logo1.png";

export default function Topbar({ handleDrawerOpen }) {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);

	// Controles do menu
	const openProfileMenu = (e) => setAnchorEl(e.currentTarget);
	const closeProfileMenu = () => setAnchorEl(null);

	const handleLogout = async () => {
		await signOut(auth);
		navigate("/");
	};

	return (
		<AppBar
			position="fixed"
			sx={{
				backgroundColor: "background.dark",
				boxShadow: "none",
				zIndex: (theme) => theme.zIndex.drawer + 1,
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
							height: 72, // mantido EXATAMENTE como você colocou
							objectFit: "contain",
							marginRight: 8,
						}}
					/>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>
						Sentinela
					</Typography>
				</Box>

				{/* Só empurra o avatar para a direita, sem alterar visual */}
				<Box sx={{ flexGrow: 1 }} />

				<IconButton onClick={openProfileMenu} sx={{ p: 0 }}>
					<Avatar sx={{ bgcolor: "primary.main" }}>S</Avatar>
				</IconButton>

				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={closeProfileMenu}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<MenuItem onClick={() => navigate("/perfil")}>
						<PersonIcon sx={{ mr: 1 }} /> Meu perfil
					</MenuItem>
					<MenuItem onClick={() => navigate("/config")}>
						<SettingsIcon sx={{ mr: 1 }} /> Configurações
					</MenuItem>
					<Divider />
					<MenuItem
						onClick={handleLogout}
						sx={{ color: "error.main" }}
					>
						<LogoutIcon sx={{ mr: 1 }} /> Sair
					</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
}
