import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import { categoriesOptions, typesOptions } from "../../utils/categoriesHelpers";

export default function FiltersModal({
	open,
	onClose,
	initialValues,
	onApply,
}) {
	const [localFilters, setLocalFilters] = useState(initialValues);

	useEffect(() => {
		setLocalFilters(initialValues);
	}, [initialValues]);

	function update(field, value) {
		setLocalFilters((prev) => ({
			...prev,
			[field]: value,
			// reset tipo se categoria mudar
			...(field === "category" ? { type: "" } : {}),
		}));
	}

	const filteredTypes = localFilters.category
		? typesOptions.filter((t) => t.category === localFilters.category)
		: typesOptions;

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>Filtros</DialogTitle>

			<DialogContent>
				<Box display="flex" flexDirection="column" gap={2} mt={1}>
					{/* STATUS */}
					<FormControl size="small">
						<InputLabel>Status</InputLabel>
						<Select
							label="Status"
							value={localFilters.status}
							onChange={(e) => update("status", e.target.value)}
						>
							<MenuItem value="all">Todos</MenuItem>
							<MenuItem value="pending_review">
								Em análise
							</MenuItem>
							<MenuItem value="accepted">Aceita</MenuItem>
							<MenuItem value="in_progress">
								Em andamento
							</MenuItem>
							<MenuItem value="resolved">Resolvida</MenuItem>
							<MenuItem value="cancelled">Cancelada</MenuItem>
						</Select>
					</FormControl>

					{/* CATEGORIA */}
					<FormControl size="small">
						<InputLabel>Categoria</InputLabel>
						<Select
							label="Categoria"
							value={localFilters.category}
							onChange={(e) => update("category", e.target.value)}
						>
							<MenuItem value="">Todas</MenuItem>
							{categoriesOptions.map((c) => (
								<MenuItem key={c.value} value={c.value}>
									{c.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* TIPO */}
					<FormControl size="small">
						<InputLabel>Tipo</InputLabel>
						<Select
							label="Tipo"
							value={localFilters.type}
							onChange={(e) => update("type", e.target.value)}
						>
							<MenuItem value="">Todos</MenuItem>
							{filteredTypes.map((t) => (
								<MenuItem key={t.value} value={t.value}>
									{t.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* EMERGÊNCIA */}
					<FormControl size="small">
						<InputLabel>Emergência</InputLabel>
						<Select
							label="Emergência"
							value={localFilters.emergency}
							onChange={(e) =>
								update("emergency", e.target.value)
							}
						>
							<MenuItem value="">Todas</MenuItem>
							<MenuItem value="yes">Sim</MenuItem>
							<MenuItem value="no">Não</MenuItem>
						</Select>
					</FormControl>

					{/* PERÍODO */}
					<TextField
						type="date"
						label="Data inicial"
						InputLabelProps={{ shrink: true }}
						value={localFilters.startDate}
						onChange={(e) => update("startDate", e.target.value)}
					/>

					<TextField
						type="date"
						label="Data final"
						InputLabelProps={{ shrink: true }}
						value={localFilters.endDate}
						onChange={(e) => update("endDate", e.target.value)}
					/>
				</Box>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose}>Cancelar</Button>
				<Button
					variant="contained"
					onClick={() => {
						onApply(localFilters);
						onClose();
					}}
				>
					Aplicar filtros
				</Button>
			</DialogActions>
		</Dialog>
	);
}
