import { Box, CssBaseline } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

import { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const DrawerHeader = styled("div")(({ theme }) => ({
	...theme.mixins.toolbar,
}));

export default function Layout() {
	const theme = useTheme();
	const [open, setOpen] = useState(false);

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />

			{/* 🔹 Top Bar */}
			<Topbar open={open} handleDrawerOpen={() => setOpen(!open)} />

			{/* 🔹 Sidebar */}
			<Sidebar
				open={open}
				theme={theme}
				handleDrawerClose={() => setOpen(false)}
			/>

			{/* 🔹 Conteúdo */}
			<Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
				{/* <DrawerHeader /> */}
				<Outlet /> {/* Renderiza a rota filha */}
			</Box>
		</Box>
	);
}
