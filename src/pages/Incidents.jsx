import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import IconButton from "@mui/material/IconButton";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

import { useEffect, useState } from "react";

import Filters from "../components/Filters";
import useIncidentFilters from "../utils/useIncidentFilters";
import StatusChip from "../components/StatusChip";

import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

import { useSentinelaData } from "../utils/SentinelaDataContext";

export default function Incidents() {
	const theme = useTheme();
	const location = useLocation();
	const navigate = useNavigate();

	// 🔹 dados globais (já filtrados por cidade)
	const { incidents, loading, updateIncidentStatus } = useSentinelaData();

	// 🔹 filtros
	const [statusFilter, setStatusFilter] = useState("all");
	const [category, setCategory] = useState("all");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [search, setSearch] = useState("");

	// 🔹 UI
	const [snackbar, setSnackbar] = useState({ open: false, message: "" });
	const [openModal, setOpenModal] = useState(false);
	const [currentIncident, setCurrentIncident] = useState(null);

	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

	// =============================
	//  ABRIR MODAL VIA NOTIFICAÇÃO
	// =============================
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

	// =============================
	//  LIMPA STATE DA ROTA
	// =============================
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

	// =============================
	//  ATUALIZA STATUS (WRITE)
	// =============================
	async function updateStatusInsideModal(newStatus) {
		if (!currentIncident) return;

		await updateDoc(doc(db, "incidents", currentIncident.id), {
			status: newStatus,
		});

		//  ATUALIZA O STATE GLOBAL
		updateIncidentStatus(currentIncident.id, newStatus);

		setSnackbar({
			open: true,
			message: `Status atualizado para ${newStatus.toUpperCase()}`,
		});

		setOpenModal(false);
	}

	// =============================
	//  COLUNAS
	// =============================
	const columns = [
		{
			field: "id",
			headerName: "Identificador",
			flex: 1,
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
		},
		{
			field: "status",
			headerName: "Status",
			flex: 1,
			renderCell: (params) => <StatusChip status={params.value} />,
		},
	];

	// =============================
	//  FILTROS (CLIENT SIDE)
	// =============================
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
			<Typography
				variant="h4"
				paddingTop={2}
				paddingBottom={2}
				fontWeight={700}
			>
				Ocorrências
			</Typography>
			<Paper sx={{ height: "100%", width: "100%" }}>
				{/* FILTROS */}
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
						"& .MuiDataGrid-columnHeaderTitle": {
							fontWeight: "bold",
							textTransform: "uppercase",
							fontSize: "0.85rem",
							color: theme.palette.primary.main,
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
					<DialogTitle sx={{ fontWeight: "bold", m: 0, p: 2 }}>
						Detalhes da Ocorrência
						<StatusChip
							sx={{ ml: 1 }}
							status={currentIncident?.status}
						/>
						<IconButton
							aria-label="close"
							onClick={() => setOpenModal(false)}
							sx={{
								position: "absolute",
								right: 8,
								top: 8,
								color: (theme) => theme.palette.grey[500],
							}}
						>
							<CloseIcon />
						</IconButton>
					</DialogTitle>

					<DialogContent dividers>
						{currentIncident && (
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 2,
								}}
							>
								{currentIncident.imageUrl && (
									<>
										<Box
											sx={{
												display: "flex",
												justifyContent: "center",
											}}
										>
											<img
												src={currentIncident.imageUrl}
												alt="Imagem da ocorrência"
												style={{
													width: "50%",
													borderRadius: 8,
													marginBottom: 10,
												}}
											/>
										</Box>
										<Divider />
									</>
								)}

								<Typography>
									<b>Descrição:</b> {currentIncident.desc}
								</Typography>
								<Typography>
									<b>Categoria:</b>{" "}
									{currentIncident.ocorrencia?.categoria}
								</Typography>
								<Typography>
									<b>Tipo:</b>{" "}
									{currentIncident.ocorrencia?.tipo}
								</Typography>
								<Typography>
									<b>Data:</b> {currentIncident.data} às{" "}
									{currentIncident.hora}
								</Typography>

								<Divider />

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
						)}
					</DialogContent>

					<DialogActions>
						<Button
							variant="outlined"
							color="error"
							startIcon={<CloseIcon />}
							onClick={() =>
								updateStatusInsideModal("in_progress")
							}
						>
							Marcar como EM ANDAMENTO
						</Button>

						<Button
							variant="contained"
							color="success"
							startIcon={<CheckIcon />}
							onClick={() => updateStatusInsideModal("resolved")}
						>
							Marcar como RESOLVIDO
						</Button>
					</DialogActions>
				</Dialog>

				{/* SNACKBAR */}
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
