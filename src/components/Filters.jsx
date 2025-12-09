import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Button,
} from "@mui/material";

import { categories } from "../utils/Categories";
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
					<MenuItem value="pending">Pendentes</MenuItem>
					<MenuItem value="open">Aberto</MenuItem>
					<MenuItem value="closed">Fechado</MenuItem>
					<MenuItem value="resolved">Resolvido</MenuItem>
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
				sx={{ width: 160 }}
				value={startDate}
				max={endDate || undefined}
				onChange={(e) => {
					const value = e.target.value;
					setStartDate(value);

					if (endDate && value > endDate) {
						setEndDate(value);
					}
				}}
			/>

			{/* DATA FINAL */}
			<TextField
				size="small"
				type="date"
				label="Data Final"
				InputLabelProps={{ shrink: true }}
				sx={{ width: 160 }}
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
			<TextField
				size="small"
				sx={{ width: 220 }}
				label="Buscar..."
				placeholder="Endereço, tipo, categoria..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>

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
