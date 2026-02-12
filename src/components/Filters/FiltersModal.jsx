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
	Typography,
	IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { categories } from "../../utils/categoriesList";

export default function FiltersModal({
	open,
	onClose,
	initialValues,
	onApply,
}) {
	const [localFilters, setLocalFilters] = useState(initialValues);

	const { incidentCategories, incidentTypes } = useAuth();

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

	const typesByCategory = useMemo(() => {
		const map = {};

		categories.forEach((category) => {
			map[category.title] = category.items
				.map((item) => item.title)
				// respeita permissões do usuário
				.filter((title) => incidentTypes.includes(title));
		});

		return map;
	}, [incidentTypes]);

	const filteredTypes = useMemo(() => {
		if (!localFilters.category) return incidentTypes;

		return typesByCategory[localFilters.category] || [];
	}, [localFilters.category, incidentTypes, typesByCategory]);

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
				>
					<Typography fontWeight={700}>Filtros</Typography>

					<IconButton onClick={onClose}>
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

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
							<InputLabel>Tipo de registro</InputLabel>
							<Select
								label="Tipo de registro"
								value={localFilters.type}
								onChange={(e) => update("type", e.target.value)}
								sx={{ width: "100%" }}
							>
								<MenuItem value={""}>Todas</MenuItem>
								<MenuItem value={"emergency"}>
									Emergências
								</MenuItem>
								<MenuItem value={"incident"}>
									Ocorrências
								</MenuItem>
								<MenuItem value={"panic"}>
									Pedido de socorro
								</MenuItem>
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
								{incidentCategories.map((c) => (
									<MenuItem key={c.title} value={c.title}>
										{c.title}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{/* TIPO */}
						<FormControl
							size="small"
							fullWidth
							//disabled={!localFilters.category}
						>
							<InputLabel>Tipo</InputLabel>
							<Select
								label="Tipo"
								value={localFilters.type}
								onChange={(e) => update("type", e.target.value)}
							>
								{!localFilters.category ? (
									<MenuItem disabled value="">
										Selecione uma categoria primeiro
									</MenuItem>
								) : (
									filteredTypes.map((type) => (
										<MenuItem key={type} value={type}>
											{type}
										</MenuItem>
									))
								)}
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

			<DialogActions sx={{ mb: 1, mx: 2 }}>
				<Button size="small" onClick={onClose}>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={() => {
						onApply(localFilters);
						onClose();
					}}
					size="small"
				>
					Filtrar
				</Button>
			</DialogActions>
		</Dialog>
	);
}
