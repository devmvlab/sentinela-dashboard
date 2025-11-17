import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";

export default function Topbar({ title = "Dashboard" }) {
	return (
		<AppBar
			position="fixed"
			sx={{
				ml: "240px",
				width: `calc(100% - 240px)`,
				backgroundColor: "background.paper",
				borderBottom: "1px solid rgba(255,255,255,0.1)",
				boxShadow: "none",
			}}
		>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Typography variant="h6" sx={{ fontWeight: 700 }}>
					{title}
				</Typography>

				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Typography variant="body1">Administrador</Typography>
					<Avatar sx={{ bgcolor: "primary.main" }}>A</Avatar>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
