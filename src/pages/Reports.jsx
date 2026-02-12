import { Box, Typography, Paper, Stack, Button } from "@mui/material";
import { useState, useMemo } from "react";

import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import FilterButton from "../components/Filters/FilterButton";
import FiltersModal from "../components/Filters/FiltersModal";
import ActiveFiltersBar from "../components/Filters/ActiveFiltersBar";

import { useIncidents } from "../hooks/useIncidents";
import { useAuth } from "../hooks/useAuth";

import { exportIncidentsToExcel } from "../utils/exportToExcel";
import { exportIncidentsToPdf } from "../utils/exportIncidentsToPdf";

export default function Reports() {
	/* =====================
	   FILTROS
	===================== */
	const [filters, setFilters] = useState({
		status: "",
		category: "",
		type: "",
		ocorrenciaTipo: "",
		startDate: "",
		endDate: "",
	});

	const [openFilters, setOpenFilters] = useState(false);

	const activeCount = Object.values(filters).filter(
		(v) => v && v !== "all",
	).length;

	/* =====================
	   INCIDENTS
	===================== */
	const { incidents, loading } = useIncidents({
		status: filters.status,
		category: filters.category,
		type: filters.type,
		ocorrenciaTipo: filters.ocorrenciaTipo,
		startDate: filters.startDate,
		endDate: filters.endDate,
	});

	const { incidentTypes } = useAuth();

	/* =====================
	   VISIBILIDADE
	===================== */
	const visibleIncidents = useMemo(() => {
		if (!incidentTypes?.length) return [];
		return incidents.filter((i) =>
			incidentTypes.includes(i.ocorrencia?.tipo),
		);
	}, [incidents, incidentTypes]);

	const disabledButtons =
		loading || visibleIncidents.length === 0 || activeCount === 0;

	return (
		<Box
			sx={{
				height: "100%",
				padding: 3,
				display: "flex",
				flexDirection: "column",
				gap: 2,
			}}
		>
			<Typography variant="h4" fontWeight={700}>
				Relatórios
			</Typography>

			<Paper
				sx={{
					width: "100%",
					p: 2,
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				{/* HEADER DE FILTROS */}
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					flexWrap="wrap"
					gap={2}
				>
					<Typography variant="body2" color="text.secondary">
						{activeCount === 0
							? "Informe pelo menos um filtro para gerar o relatório..."
							: visibleIncidents.length === 0
								? "Não foi encontrado nenhuma registro com esse filtro"
								: "Por favor escolha o tipo de arquivo para gerar o relatório"}
					</Typography>
					<Box
						display={"flex"}
						justifyContent="flex-end"
						alignItems="center"
					>
						<ActiveFiltersBar
							filters={filters}
							onRemove={(key) =>
								setFilters((prev) => ({
									...prev,
									[key]: "",
								}))
							}
						/>

						<FilterButton
							activeCount={activeCount}
							onClick={() => setOpenFilters(true)}
						/>
					</Box>
				</Box>

				{/* MODAL DE FILTROS */}
				<FiltersModal
					open={openFilters}
					onClose={() => setOpenFilters(false)}
					initialValues={filters}
					onApply={(newFilters) => setFilters(newFilters)}
				/>

				{/* AÇÕES */}
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
					flexWrap="wrap"
					gap={2}
				>
					<Button
						variant="outlined"
						startIcon={<DescriptionIcon />}
						disabled={disabledButtons}
						onClick={() => exportIncidentsToExcel(visibleIncidents)}
					>
						Gerar Excel
					</Button>

					<Button
						variant="outlined"
						endIcon={<PictureAsPdfIcon />}
						disabled={disabledButtons}
						onClick={() => exportIncidentsToPdf(visibleIncidents)}
					>
						Gerar PDF
					</Button>
				</Box>
			</Paper>
		</Box>
	);
}
