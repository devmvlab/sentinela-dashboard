import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import StatusChip from "../components/StatusChip";
import IncidentModal from "../components/IncidentModal";
import FilterButton from "../components/Filters/FilterButton";
import FiltersModal from "../components/Filters/FiltersModal";
import ActiveFiltersBar from "../components/Filters/ActiveFiltersBar";

import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

import { updateIncidentWithHistory } from "../services/incidentStatus";
import { useIncidents } from "../hooks/useIncidents";
import { useAuth } from "../hooks/useAuth";

/* ======================================================
   COMPONENT
====================================================== */
export default function Incidents() {
	const theme = useTheme();
	const location = useLocation();
	const navigate = useNavigate();

	const { name, cityId, uid } = useAuth();

	/* =====================
	   FILTROS (SERVER)
	===================== */

	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

	const [filters, setFilters] = useState({
		status: "",
		category: "",
		type: "",
		isEmergency: "",
		startDate: "",
		endDate: "",
	});

	const [openFilters, setOpenFilters] = useState(false);

	const activeCount = Object.values(filters).filter(
		(v) => v && v !== "all",
	).length;

	/* =====================
	   BUSCA SERVER-SIDE
	===================== */
	const { incidents, total, loading, updateIncidentStatus } = useIncidents({
		status: filters.status,
		category: filters.category,
		type: filters.type,
		isEmergency: filters.isEmergency,
		startDate: filters.startDate,
		endDate: filters.endDate,
		page: paginationModel.page,
		pageSize: paginationModel.pageSize,
		cityId,
	});

	/* =====================
	   MODAL STATE
	===================== */
	const [snackbar, setSnackbar] = useState({ open: false, message: "" });
	const [openModal, setOpenModal] = useState(false);
	const [currentIncident, setCurrentIncident] = useState(null);

	/* =====================
	   OPEN MODAL VIA ROUTE
	===================== */
	useEffect(() => {
		if (!location.state?.openIncidentId) return;
		if (!incidents || incidents.length === 0) return;

		const incident = incidents.find(
			(item) => item.id === location.state.openIncidentId,
		);

		if (incident) {
			setCurrentIncident(incident);
			setOpenModal(true);
		}
	}, [location.state, incidents]);

	useEffect(() => {
		if (location.state?.openIncidentId && openModal) {
			navigate(location.pathname, { replace: true });
		}
	}, [location.state, openModal, navigate, location.pathname]);

	/* =====================
	   MODAL ACTIONS (INALTERADAS)
	===================== */
	async function updateStatusInsideModal(newStatus, reason) {
		if (!currentIncident) return;

		const currentStatus = currentIncident.status;

		if (currentStatus === "cancelled") return;
		if (newStatus === "cancelled") return;

		const allowedTransitions = {
			pending_review: ["accepted"],
			accepted: ["in_progress"],
			in_progress: ["resolved"],
			resolved: [],
		};

		if (!allowedTransitions[currentStatus]?.includes(newStatus)) return;

		await updateIncidentWithHistory({
			incident: currentIncident,
			newStatus,
			user: {
				id: uid,
				name,
			},
			reason,
			cityId,
		});

		updateIncidentStatus(currentIncident.id, newStatus);

		setSnackbar({
			open: true,
			message: "Status atualizado com sucesso",
		});

		setOpenModal(false);
	}

	async function aceitarOcorrencia() {
		if (!currentIncident) return;
		if (currentIncident.status === "accepted") return;

		await updateIncidentWithHistory({
			incident: currentIncident,
			newStatus: "accepted",
			reason: "Ocorrência aceita pelo operador",
			user: {
				id: uid,
				name,
			},
		});

		updateIncidentStatus(currentIncident.id, "accepted");

		setSnackbar({
			open: true,
			message: "Ocorrência aceita e em análise",
		});

		setOpenModal(false);
	}

	/* =====================
	   STEPPER (INALTERADO)
	===================== */
	const stepsToRender =
		currentIncident?.status === "cancelled"
			? [
					{ key: "pending_review", label: "Em análise" },
					{ key: "cancelled", label: "Cancelada" },
				]
			: [
					{ key: "pending_review", label: "Em análise" },
					{ key: "accepted", label: "Aceita" },
					{ key: "in_progress", label: "Em andamento" },
					{ key: "resolved", label: "Resolvida" },
				];

	const activeStep = stepsToRender.findIndex(
		(step) => step.key === currentIncident?.status,
	);

	/* =====================
	   COLUMNS (INALTERADAS)
	===================== */
	const columns = [
		{
			field: "id",
			headerName: "Identificador",
			valueGetter: (_, row) => row.id?.slice(0, 5),
		},
		{
			field: "categoria",
			headerName: "Categoria",
			flex: 1,
			valueGetter: (_, row) => row.ocorrencia?.categoria,
		},
		{
			field: "tipo",
			headerName: "Tipo",
			flex: 1,
			renderCell: ({ row }) => (
				<Box
					display="flex"
					alignItems="center"
					gap={1}
					sx={{ height: "100%" }}
				>
					<Typography variant="body2">
						{row.ocorrencia?.tipo ?? "-"}
					</Typography>
					{row.isEmergency && (
						<ReportGmailerrorredIcon
							color="error"
							fontSize="small"
						/>
					)}
				</Box>
			),
		},
		{
			field: "endereco",
			headerName: "Endereço",
			flex: 2,
			valueGetter: (_, row) => row.geoloc?.address,
		},
		{
			field: "data",
			headerName: "Data",
			flex: 1,
			valueGetter: (_, row) => `${row.data} - ${row.hora}`,
		},
		{
			field: "status",
			headerName: "Status",
			flex: 1,
			renderCell: (params) => <StatusChip status={params.value} />,
		},
	];

	/* =====================
	   RENDER
	===================== */
	if (loading && incidents.length === 0) {
		return (
			<Paper sx={{ p: 4 }}>
				<Typography color="text.secondary">
					Carregando ocorrências da cidade...
				</Typography>
			</Paper>
		);
	}

	return (
		<Box>
			<Typography variant="h4" py={2} fontWeight={700}>
				Ocorrências
			</Typography>

			<Paper>
				<Box
					display={"flex"}
					flexDirection={"row"}
					justifyContent={"flex-end"}
					sx={{ padding: 2 }}
				>
					<ActiveFiltersBar
						filters={filters}
						onRemove={(key) =>
							setFilters((prev) => ({ ...prev, [key]: "" }))
						}
					/>
					<FilterButton
						activeCount={activeCount}
						onClick={() => setOpenFilters(true)}
					/>
				</Box>

				<FiltersModal
					open={openFilters}
					onClose={() => setOpenFilters(false)}
					initialValues={filters}
					onApply={(newFilters) => {
						setFilters(newFilters);
						setPaginationModel((p) => ({ ...p, page: 0 }));
					}}
				/>

				<DataGrid
					rows={incidents}
					columns={columns}
					getRowId={(row) => row.id}
					rowCount={total}
					loading={loading}
					paginationMode="server"
					paginationModel={paginationModel}
					onPaginationModelChange={setPaginationModel}
					pageSizeOptions={[5, 10, 15, 20]}
					sx={{
						border: 0,
						cursor: "pointer",
						"& .MuiDataGrid-row:hover": {
							backgroundColor: theme.palette.tableHover,
						},
					}}
					onRowClick={(params) => {
						setCurrentIncident(params.row);
						setOpenModal(true);
					}}
				/>

				{/* MODAL — INTACTO */}
				<IncidentModal
					open={openModal}
					onClose={() => setOpenModal(false)}
					incident={currentIncident}
					stepsToRender={stepsToRender}
					activeStep={activeStep}
					onStepClick={updateStatusInsideModal}
					onAccept={aceitarOcorrencia}
					onConfirmCancel={async (reason) => {
						await updateIncidentWithHistory({
							incident: currentIncident,
							newStatus: "cancelled",
							reason,
							user: {
								id: uid,
								name,
							},
						});

						updateIncidentStatus(currentIncident.id, "cancelled");
						setOpenModal(false);
					}}
				/>

				<Snackbar
					open={snackbar.open}
					autoHideDuration={3000}
					onClose={() => setSnackbar({ open: false, message: "" })}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<Alert severity="success">{snackbar.message}</Alert>
				</Snackbar>
			</Paper>
		</Box>
	);
}
