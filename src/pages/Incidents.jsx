import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { useEffect, useState } from "react";

import Filters from "../components/Filters";
import useIncidentFilters from "../utils/useIncidentFilters";
import StatusChip from "../components/StatusChip";

import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSentinelaData } from "../utils/SentinelaDataContext";
import IncidentModal from "../components/IncidentModal";

import { updateIncidentWithHistory } from "../services/incidentStatus";

export default function Incidents() {
	const theme = useTheme();
	const location = useLocation();
	const navigate = useNavigate();

	const { incidents, loading, updateIncidentStatus, incidentTypes, user } =
		useSentinelaData();

	const [statusFilter, setStatusFilter] = useState("all");
	//const [category, setCategory] = useState("all");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [search, setSearch] = useState("");

	const [snackbar, setSnackbar] = useState({ open: false, message: "" });
	const [openModal, setOpenModal] = useState(false);
	const [currentIncident, setCurrentIncident] = useState(null);

	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

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

	function clearFilters() {
		setStatusFilter("all");
		//setCategory("all");
		setStartDate("");
		setEndDate("");
		setSearch("");
	}

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
			user,
			reason,
			cityId: user?.cityId,
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
			user,
		});

		updateIncidentStatus(currentIncident.id, "accepted");

		setSnackbar({
			open: true,
			message: "Ocorrência aceita e em análise",
		});

		setOpenModal(false);
	}

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

	const columns = [
		{
			field: "id",
			headerName: "Identificador",
			//flex: 1,
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
			valueGetter: (_, row) => row.ocorrencia?.tipo,
			renderCell: (params) => {
				const tipo = params.row.ocorrencia?.tipo;
				const isEmergency = params.row.isEmergency;

				return (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							height: "100%", // 🔥 chave do alinhamento vertical
							gap: 1,
						}}
					>
						<Typography variant="body2">{tipo ?? "-"}</Typography>
						{isEmergency && (
							<ReportGmailerrorredIcon
								color="error"
								fontSize="small"
							/>
						)}
					</Box>
				);
			},
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

	const filteredRows = useIncidentFilters(incidents || [], {
		status: statusFilter,
		incidentTypes,
		startDate,
		endDate,
		search,
	});

	if (loading) {
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
				<Filters
					status={statusFilter}
					setStatus={setStatusFilter}
					//category={category}
					//setCategory={setCategory}
					startDate={startDate}
					setStartDate={setStartDate}
					endDate={endDate}
					setEndDate={setEndDate}
					search={search}
					setSearch={setSearch}
					onClear={clearFilters}
				/>

				<DataGrid
					rows={filteredRows}
					columns={columns}
					getRowId={(row) => row.id}
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

				{/* MODAL */}
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
							user,
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
