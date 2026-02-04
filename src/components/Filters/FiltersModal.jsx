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

					<Box display={"flex"} justifyContent={"center"} gap={2}>
						<FormControl size="small" fullWidth>
							<InputLabel>Status</InputLabel>
							<Select
								label="Status"
								value={localFilters.status}
								onChange={(e) =>
									update("status", e.target.value)
								}
								sx={{ width: "100%" }}
							>
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

						{/* EMERGÊNCIA */}
						<FormControl size="small" fullWidth>
							<InputLabel>Tipo de ocorrência</InputLabel>
							<Select
								label="Tipo de ocorrência"
								value={localFilters.isEmergency}
								onChange={(e) =>
									update("isEmergency", e.target.value)
								}
								sx={{ width: "100%" }}
							>
								<MenuItem value={""}>Todas</MenuItem>
								<MenuItem value={"true"}>Emergências</MenuItem>
								<MenuItem value={"false"}>Ocorrências</MenuItem>
							</Select>
						</FormControl>
					</Box>

					<Box display={"flex"} justifyContent={"center"} gap={2}>
						{/* CATEGORIA */}
						<FormControl size="small" fullWidth>
							<InputLabel>Categoria</InputLabel>
							<Select
								label="Categoria"
								value={localFilters.category}
								onChange={(e) =>
									update("category", e.target.value)
								}
							>
								{/* <MenuItem value="">Todas</MenuItem> */}
								{categoriesOptions.map((c) => (
									<MenuItem key={c.value} value={c.value}>
										{c.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* TIPO */}
						<FormControl size="small" fullWidth>
							<InputLabel>Tipo</InputLabel>
							<Select
								label="Tipo"
								value={localFilters.type}
								onChange={(e) => update("type", e.target.value)}
							>
								{/* <MenuItem value="">Todos</MenuItem> */}
								{filteredTypes.map((t) => (
									<MenuItem key={t.value} value={t.value}>
										{t.label}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>

					<Box display={"flex"} justifyContent={"center"} gap={2}>
						{/* PERÍODO */}
						<FormControl size="small" fullWidth>
							<TextField
								type="date"
								label="Data inicial"
								InputLabelProps={{ shrink: true }}
								value={localFilters.startDate}
								onChange={(e) =>
									update("startDate", e.target.value)
								}
								sx={{
									"& input::-webkit-calendar-picker-indicator":
										{
											filter: "invert(1)", // muda a cor (hack)
										},
								}}
								size="small"
							/>
						</FormControl>

						<FormControl size="small" fullWidth>
							<TextField
								type="date"
								label="Data final"
								InputLabelProps={{ shrink: true }}
								value={localFilters.endDate}
								onChange={(e) =>
									update("endDate", e.target.value)
								}
								sx={{
									"& input::-webkit-calendar-picker-indicator":
										{
											filter: "invert(1)", // muda a cor (hack)
										},
								}}
								size="small"
							/>
						</FormControl>
					</Box>
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
					sx={{ mr: 2 }}
				>
					Aplicar filtros
				</Button>
			</DialogActions>
		</Dialog>
	);
}
