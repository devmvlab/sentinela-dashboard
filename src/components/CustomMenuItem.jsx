import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function CustomMenuItem({ text, icon, route }) {
	const navigate = useNavigate();
	const IconComponent = Icons[icon] || Icons.Circle;

	return (
		<ListItemButton onClick={() => navigate(route)}>
			<ListItemIcon>
				<IconComponent sx={{ color: "primary.main" }} />
			</ListItemIcon>
			<ListItemText primary={text} />
		</ListItemButton>
	);
}
