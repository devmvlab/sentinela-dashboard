import { Button, Badge } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

export default function FilterButton({ activeCount, onClick }) {
	return (
		<Badge
			color="primary"
			badgeContent={activeCount}
			invisible={activeCount === 0}
		>
			<Button
				variant="outlined"
				startIcon={<FilterAltIcon />}
				onClick={onClick}
				size="small"
			>
				Filtros
			</Button>
		</Badge>
	);
}
