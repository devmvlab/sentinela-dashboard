import { Box, Chip } from "@mui/material";
import { filtersConfig } from "../../utils/filtersConfig";

export default function ActiveFiltersBar({ filters, onRemove }) {
	const activeFilters = Object.entries(filters)
		.filter(([key, value]) => {
			const config = filtersConfig[key];
			return config?.isActive(value);
		})
		.map(([key, value]) => {
			const config = filtersConfig[key];
			return {
				key,
				label: `${config.label}: ${config.formatValue(value)}`,
			};
		});

	if (activeFilters.length === 0) return null;

	return (
		<Box display="flex" gap={1} flexWrap="wrap" px={1}>
			{activeFilters.map(({ key, label }) => (
				<Chip
					key={key}
					label={label}
					onDelete={() => onRemove(key)}
					color="primary"
					variant="outlined"
				/>
			))}
		</Box>
	);
}
