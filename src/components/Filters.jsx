import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Button,
} from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";
import { statusList } from "../utils/statusList";

export default function Filters({
	status,
	setStatus,
	startDate,
	setStartDate,
	endDate,
	setEndDate,
	search,
	setSearch,
	onClear,
	showSearch = true,
}) {
	return (
		<Box
			sx={{
				p: 2,
				display: "flex",
				gap: 2,
				flexWrap: "wrap",
				alignItems: "center",
			}}
		>
			{/* STATUS */}
			<FormControl size="small" sx={{ width: 180 }}>
				<InputLabel>Status</InputLabel>
				<Select
					value={status}
					label="Status"
					onChange={(e) => setStatus(e.target.value)}
				>
					<MenuItem value="all">Todos</MenuItem>
					{Object.values(statusList).map(({ id, label }) => (
						<MenuItem value={id}>{label}</MenuItem>
					))}
				</Select>
			</FormControl>

			{/* DATA INICIAL */}
			<TextField
				size="small"
				type="date"
				label="Data Inicial"
				InputLabelProps={{ shrink: true }}
				value={startDate}
				max={endDate || undefined}
				onChange={(e) => {
					const value = e.target.value;
					setStartDate(value);

					if (endDate && value > endDate) {
						setEndDate(value);
					}
				}}
				sx={{
					width: 160,
					"& input::-webkit-calendar-picker-indicator": {
						filter: "invert(1)", // muda a cor (hack)
					},
				}}
			/>

			{/* DATA FINAL */}
			<TextField
				size="small"
				type="date"
				label="Data Final"
				InputLabelProps={{ shrink: true }}
				sx={{
					width: 160,
					"& input::-webkit-calendar-picker-indicator": {
						filter: "invert(1)", // muda a cor (hack)
					},
				}}
				value={endDate}
				min={startDate || undefined}
				onChange={(e) => {
					const value = e.target.value;
					setEndDate(value);

					if (startDate && value < startDate) {
						setStartDate(value);
					}
				}}
			/>

			{/* BUSCA POR TEXTO */}
			{showSearch && (
				<TextField
					size="small"
					sx={{ width: 220 }}
					label="Buscar..."
					placeholder="Endereço, tipo, categoria..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			)}

			{/* BOTÃO LIMPAR FILTROS */}
			<Button
				size="small"
				color="error"
				variant="outlined"
				startIcon={<ClearIcon />}
				onClick={onClear}
				sx={{ height: 40 }}
			>
				Limpar
			</Button>
		</Box>
	);
}
