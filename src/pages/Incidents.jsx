import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
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

import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

import { useEffect, useState } from "react";

import { db } from "../services/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

import { useTheme } from "@mui/material/styles";

export default function Incidents() {
	const theme = useTheme();

	const [rows, setRows] = useState([]);
	const [snackbar, setSnackbar] = useState({ open: false, message: "" });
	const [openModal, setOpenModal] = useState(false);
	const [currentIncident, setCurrentIncident] = useState(null);

	// 🔥 ADICIONADO — PAGINAÇÃO CONTROLADA
	const [paginationModel, setPaginationModel] = useState({
		page: 0,
		pageSize: 10,
	});

	useEffect(() => {
		async function loadData() {
			const snapshot = await getDocs(collection(db, "incidents"));

			const lista = snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					...data,
				};
			});

			setRows(lista);
		}

		loadData();
	}, []);

	function getStatusChip(status) {
		const map = {
			open: { label: "OPEN", color: "warning" },
			closed: { label: "CLOSED", color: "error" },
			resolved: { label: "RESOLVED", color: "success" },
		};

		const st = map[status] || { label: status, color: "default" };

		return (
			<Chip
				label={st.label}
				color={st.color}
				size="small"
				variant="filled"
				sx={{ fontWeight: "bold" }}
			/>
		);
	}

	async function updateStatusInsideModal(newStatus) {
		if (!currentIncident) return;

		await updateDoc(doc(db, "incidents", currentIncident.id), {
			status: newStatus,
		});

		setRows((old) =>
			old.map((row) =>
				row.id === currentIncident.id
					? { ...row, status: newStatus }
					: row
			)
		);

		setSnackbar({
			open: true,
			message: `Status atualizado para ${newStatus.toUpperCase()}`,
		});

		setOpenModal(false);
	}

	const columns = [
		{
			field: "ocorrencia.id",
			headerName: "Identificador",
			flex: 1,
			valueGetter: (v, row) => row.id,
		},
		{
			field: "ocorrencia.categoria",
			headerName: "Categoria",
			flex: 1,
			valueGetter: (v, row) => row.ocorrencia?.categoria,
		},
		{
			field: "ocorrencia.tipo",
			headerName: "Tipo",
			flex: 1,
			valueGetter: (v, row) => row.ocorrencia?.tipo,
		},
		{
			field: "geoloc.address",
			headerName: "Endereço",
			flex: 2,
			valueGetter: (v, row) => row.geoloc?.address,
		},
		{ field: "data", headerName: "Data", flex: 1 },
		{
			field: "status",
			headerName: "Status",
			flex: 1,
			renderCell: (params) => getStatusChip(params.value),
		},
	];

	return (
		<Paper sx={{ height: "100%", width: "100%" }}>
			<DataGrid
				rows={rows}
				columns={columns}
				getRowId={(row) => row.id}
				// 🔥 PAGINAÇÃO 100% FUNCIONAL
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
				// CLICA NA LINHA → ABRE MODAL
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
								<img
									src={currentIncident.imageUrl}
									alt="Imagem da ocorrência"
									style={{
										width: "100%",
										borderRadius: 8,
										marginBottom: 10,
									}}
								/>
							)}

							<Typography>
								<b>Descrição:</b> {currentIncident.desc}
							</Typography>

							<Divider />

							<Typography>
								<b>Categoria:</b>{" "}
								{currentIncident.ocorrencia?.categoria}
							</Typography>
							<Typography>
								<b>Tipo:</b> {currentIncident.ocorrencia?.tipo}
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
								<b>Cidade:</b> {currentIncident.geoloc?.city} -{" "}
								{currentIncident.geoloc?.state}
							</Typography>
							<Typography>
								<b>CEP:</b> {currentIncident.geoloc?.postalCode}
							</Typography>

							<Divider />

							<Typography>
								<b>Status atual:</b>{" "}
								{getStatusChip(currentIncident.status)}
							</Typography>
						</Box>
					)}
				</DialogContent>

				<DialogActions>
					<Button
						variant="outlined"
						color="error"
						startIcon={<CloseIcon />}
						onClick={() => updateStatusInsideModal("closed")}
					>
						Marcar como CLOSED
					</Button>

					<Button
						variant="contained"
						color="success"
						startIcon={<CheckIcon />}
						onClick={() => updateStatusInsideModal("resolved")}
					>
						Marcar como RESOLVED
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
	);
}
