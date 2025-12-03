import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	IconButton,
	Divider,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WarningIcon from "@mui/icons-material/Warning";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar({ open, handleDrawerClose, theme }) {
	const navigate = useNavigate();

	const menuItems = [
		{ text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
		{ text: "Ocorrências", icon: <WarningIcon />, path: "/ocorrencias" },
		{
			text: "Notificações",
			icon: <NotificationsIcon />,
			path: "/notifications",
		},
	];

	return (
		<Drawer
			variant="permanent"
			sx={{
				width: open ? drawerWidth : 70,
				"& .MuiDrawer-paper": {
					width: open ? drawerWidth : 70,
					boxSizing: "border-box",
					backgroundColor: "background.dark",
				},
			}}
		>
			<IconButton onClick={handleDrawerClose} sx={{ mt: "16px" }}>
				{theme.direction === "rtl" ? (
					<ChevronRightIcon />
				) : (
					<ChevronLeftIcon />
				)}
			</IconButton>
			<Divider />

			<List>
				{menuItems.map(({ text, icon, path }) => (
					<ListItem
						key={text}
						disablePadding
						sx={{ display: "block" }}
					>
						<ListItemButton
							onClick={() => navigate(path)}
							sx={{
								marginTop: 1,
								//justifyContent: open ? "start" : "start",
								px: 2.5,
							}}
						>
							<ListItemIcon sx={{ color: "primary.text" }}>
								{icon}
							</ListItemIcon>
							<ListItemText
								primary={text}
								sx={{ opacity: open ? 1 : 0 }}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Drawer>
	);
}
