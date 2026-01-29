import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Button,
} from "@mui/material";

import { categories } from "../utils/categoriesList";
import ClearIcon from "@mui/icons-material/Clear";

export default function Filters({
	status,
	setStatus,
	category,
	setCategory,
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
					<MenuItem value="pending_review">Em análise</MenuItem>
					<MenuItem value="accepted">Aceitas</MenuItem>
					<MenuItem value="in_progress">Em andamento</MenuItem>
					<MenuItem value="cancelled">Canceladas</MenuItem>
					<MenuItem value="resolved">Resolvidas</MenuItem>
				</Select>
			</FormControl>

			{/* CATEGORIA */}
			<FormControl size="small" sx={{ width: 180 }}>
				<InputLabel>Categoria</InputLabel>
				<Select
					value={category}
					label="Categoria"
					onChange={(e) => setCategory(e.target.value)}
				>
					<MenuItem value="all">Todas</MenuItem>
					{categories.map((cat) => (
						<MenuItem key={cat.title} value={cat.title}>
							{cat.title}
						</MenuItem>
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
