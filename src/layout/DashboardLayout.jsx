import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }) {
	return (
		<>
			<Sidebar />
			<Topbar />

			<Box
				component="main"
				sx={{
					ml: "240px",
					mt: "64px",
					p: 3,
					color: "text.primary",
					minHeight: "100vh",
					backgroundColor: "background.default",
				}}
			>
				{children}
			</Box>
		</>
	);
}
