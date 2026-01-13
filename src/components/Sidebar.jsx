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
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;
const drawerWidthClosed = 70;

export default function Sidebar({ open, handleDrawerClose, theme }) {
	const navigate = useNavigate();

	const menuItems = [
		{ text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
		{ text: "Ocorrências", icon: <WarningIcon />, path: "/ocorrencias" },
		{
			text: "Configurações",
			icon: <SettingsIcon />,
			path: "/configuracoes",
		},
	];

	return (
		<Drawer
			variant="permanent"
			sx={{
				width: open ? drawerWidth : drawerWidthClosed,
				flexShrink: 0,
				whiteSpace: "nowrap",
				"& .MuiDrawer-paper": {
					width: open ? drawerWidth : drawerWidthClosed,
					boxSizing: "border-box",
					backgroundColor: "background.dark",
					overflowX: "hidden",
					borderRadius: 0,
				},
			}}
		>
			<IconButton
				onClick={handleDrawerClose}
				sx={{
					mt: 2,
					ml: "auto",
					mr: open ? 2 : "auto",
					alignSelf: open ? "flex-end" : "center",
				}}
			>
				{theme.direction === "rtl" ? (
					<ChevronRightIcon />
				) : (
					<ChevronLeftIcon />
				)}
			</IconButton>

			<Divider />

			<List sx={{ mt: 1 }}>
				{menuItems.map(({ text, icon, path }) => (
					<ListItem
						key={text}
						disablePadding
						sx={{ display: "block" }}
					>
						<ListItemButton
							onClick={() => navigate(path)}
							sx={{
								minHeight: 48,
								justifyContent: open ? "flex-start" : "center",
								px: open ? 2.5 : 0,
							}}
						>
							<ListItemIcon
								sx={{
									minWidth: 0,
									width: open ? "auto" : "100%",
									display: "flex",
									justifyContent: "center",
									mr: open ? 3 : 0,
									color: "primary.text",
								}}
							>
								{icon}
							</ListItemIcon>

							{open && (
								<ListItemText
									primary={text}
									sx={{ whiteSpace: "nowrap" }}
								/>
							)}
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Drawer>
	);
}
