import {
	Drawer,
	Box,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import logo from "../assets/logo1.png";

const drawerWidth = 240;

export default function Sidebar() {
	return (
		<Drawer
			variant="permanent"
			sx={{
				width: drawerWidth,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: drawerWidth,
					boxSizing: "border-box",
					backgroundColor: "background.paper",
					borderRight: "1px solid rgba(255,255,255,0.1)",
				},
			}}
		>
			<Box
				sx={{
					p: 2,
					textAlign: "center",
					borderBottom: "1px solid #ffffff22",
				}}
			>
				<img src={logo} style={{ width: 80 }} />
			</Box>

			<List>
				<ListItemButton>
					<ListItemIcon>
						<DashboardIcon sx={{ color: "primary.main" }} />
					</ListItemIcon>
					<ListItemText primary="Dashboard" />
				</ListItemButton>

				<ListItemButton>
					<ListItemIcon>
						<MapIcon sx={{ color: "primary.main" }} />
					</ListItemIcon>
					<ListItemText primary="Ocorrências" />
				</ListItemButton>

				<ListItemButton>
					<ListItemIcon>
						<NotificationsIcon sx={{ color: "primary.main" }} />
					</ListItemIcon>
					<ListItemText primary="Notificações" />
				</ListItemButton>

				<ListItemButton>
					<ListItemIcon>
						<SettingsIcon sx={{ color: "primary.main" }} />
					</ListItemIcon>
					<ListItemText primary="Configurações" />
				</ListItemButton>
			</List>
		</Drawer>
	);
}
