import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import PendingIcon from "@mui/icons-material/Pending";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import StepConnector from "@mui/material/StepConnector";
import IconButton from "@mui/material/IconButton";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useState } from "react";

import Filters from "../components/Filters";
import useIncidentFilters from "../utils/useIncidentFilters";
import StatusChip from "../components/StatusChip";

import { useLocation, useNavigate } from "react-router-dom";
import { useTheme, styled } from "@mui/material/styles";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

import { useSentinelaData } from "../utils/SentinelaDataContext";

/* =============================
   FLUXO DE STATUS
============================= */
const INCIDENT_STEPS = [
	{ key: "open", label: "Aberta" },
	{ key: "in_progress", label: "Em andamento" },
	{ key: "resolved", label: "Resolvida" },
];

export default function Incidents() {
	const theme = useTheme();
	const location = useLocation();
	const navigate = useNavigate();

	const { incidents, loading, updateIncidentStatus } = useSentinelaData();

	const [statusFilter, setStatusFilter] = useState("all");
	const [category, setCategory] = useState("all");
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
		setCategory("all");
		setStartDate("");
		setEndDate("");
		setSearch("");
	}

	async function updateStatusInsideModal(newStatus) {
		if (!currentIncident || newStatus === currentIncident.status) return;

		await updateDoc(doc(db, "incidents", currentIncident.id), {
			status: newStatus,
		});

		updateIncidentStatus(currentIncident.id, newStatus);

		const statusLabel = INCIDENT_STEPS.find(
			(step) => step.key === newStatus,
		)?.label;

		setSnackbar({
			open: true,
			message: `Status atualizado para ${statusLabel}`,
		});

		setOpenModal(false);
	}

	const statusToStepIndex = {
		open: 0,
		in_progress: 1,
		resolved: 2,
	};

	const activeStep = statusToStepIndex[currentIncident?.status] ?? 0;

	const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
		"& .MuiStepConnector-line": {
			borderColor: theme.palette.divider,
			borderTopWidth: 2,
		},

		"&.Mui-active .MuiStepConnector-line": {
			borderColor: theme.palette.primary.main,
		},

		"&.Mui-completed .MuiStepConnector-line": {
			borderColor: theme.palette.primary.main,
		},
	}));

	function CustomStepIcon(props) {
		const { icon, ownerState } = props;

		// icon = índice do step (1, 2, 3)
		const stepIndex = Number(icon) - 1;
		const currentStatus = ownerState.currentStatus;

		const stepKey = INCIDENT_STEPS[stepIndex].key;

		// OPEN → sempre completed
		if (stepKey === "open") {
			return <CheckCircleIcon sx={{ color: "primary.main" }} />;
		}

		// IN_PROGRESS
		if (stepKey === "in_progress") {
			if (currentStatus === "in_progress") {
				return <QueryBuilderIcon sx={{ color: "primary.main" }} />;
			}

			if (currentStatus === "resolved") {
				return <CheckCircleIcon sx={{ color: "primary.main" }} />;
			}

			return <PendingIcon sx={{ color: "grey.400" }} />;
		}

		// RESOLVED
		if (stepKey === "resolved") {
			if (currentStatus === "resolved") {
				return <CheckCircleIcon sx={{ color: "primary.main" }} />;
			}

			return <PendingIcon sx={{ color: "grey.400" }} />;
		}

		return null;
	}

	const columns = [
		{ field: "id", headerName: "Identificador", flex: 1 },
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
		category,
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
					category={category}
					setCategory={setCategory}
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
				<Dialog
					open={openModal}
					onClose={() => setOpenModal(false)}
					fullWidth
					maxWidth="md"
				>
					<DialogTitle sx={{ fontWeight: "bold" }}>
						Detalhes da Ocorrência
						<IconButton
							onClick={() => setOpenModal(false)}
							sx={{ position: "absolute", right: 8, top: 8 }}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>

					<DialogContent dividers>
						{currentIncident && (
							<>
								<Stepper
									alternativeLabel
									sx={{ marginY: 3 }}
									connector={<CustomStepConnector />}
									activeStep={activeStep}
								>
									{INCIDENT_STEPS.map((step, index) => (
										<Step key={step.key}>
											<StepLabel
												StepIconComponent={(props) => (
													<CustomStepIcon
														{...props}
														ownerState={{
															currentStatus:
																currentIncident.status,
														}}
													/>
												)}
												onClick={() =>
													updateStatusInsideModal(
														step.key,
													)
												}
												sx={{
													cursor: "pointer",
													"& .MuiStepLabel-label": {
														fontWeight:
															step.key ===
															currentIncident.status
																? 600
																: 400,
														color:
															step.key ===
																"open" ||
															step.key ===
																currentIncident.status ||
															currentIncident.status ===
																"resolved"
																? "primary.main"
																: "text.secondary",
													},
												}}
											>
												{step.label}
											</StepLabel>
										</Step>
									))}
								</Stepper>

								<Box
									display="flex"
									flexDirection="row"
									justifyContent="center"
									gap={4}
								>
									{currentIncident.imageUrl ? (
										<img
											src={currentIncident.imageUrl}
											alt="Ocorrência"
											style={{
												width: 300,
												height: 300,
												borderRadius: 8,
											}}
										/>
									) : (
										<Box
											display={"flex"}
											justifyContent={"center"}
											alignItems={"center"}
											flexDirection={"column"}
											width={300}
											height={300}
											bgcolor={
												theme.palette.text.secondary
											}
											borderRadius={8}
										>
											<ImageNotSupportedIcon
												sx={{ fontSize: 100 }}
											/>
											<Typography>
												Nenhuma imagem
											</Typography>
										</Box>
									)}

									<Box
										display="flex"
										flexDirection="column"
										justifyContent={"space-between"}
										gap={2}
									>
										<Typography>
											<b>Categoria:</b>{" "}
											{
												currentIncident.ocorrencia
													?.categoria
											}
										</Typography>
										<Typography>
											<b>Tipo:</b>{" "}
											{currentIncident.ocorrencia?.tipo}
										</Typography>
										<Typography>
											<b>Descrição:</b>{" "}
											{currentIncident.desc}
										</Typography>
										<Typography>
											<b>Data:</b> {currentIncident.data}{" "}
											às {currentIncident.hora}
										</Typography>

										<Typography>
											<b>Endereço:</b>{" "}
											{currentIncident.geoloc?.address}
										</Typography>
										<Typography>
											<b>Cidade:</b>{" "}
											{currentIncident.geoloc?.city} -{" "}
											{currentIncident.geoloc?.state}
										</Typography>
										<Typography>
											<b>CEP:</b>{" "}
											{currentIncident.geoloc?.postalCode}
										</Typography>
									</Box>
								</Box>
							</>
						)}
					</DialogContent>

					<DialogActions>
						<Button onClick={() => setOpenModal(false)}>
							Fechar
						</Button>
					</DialogActions>
				</Dialog>

				<Snackbar
					open={snackbar.open}
					autoHideDuration={3000}
					onClose={() => setSnackbar({ open: false, message: "" })}
				>
					<Alert severity="success">{snackbar.message}</Alert>
				</Snackbar>
			</Paper>
		</Box>
	);
}
