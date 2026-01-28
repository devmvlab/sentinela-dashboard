import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	TextField,
	IconButton,
	Stepper,
	Step,
	StepLabel,
	Tabs,
	Tab,
	Chip,
	Divider,
} from "@mui/material";
import {
	CheckCircle as CheckCircleIcon,
	QueryBuilder as QueryBuilderIcon,
	Pending as PendingIcon,
	ImageNotSupported as ImageNotSupportedIcon,
	Close as CloseIcon,
} from "@mui/icons-material";
import StepConnector from "@mui/material/StepConnector";
import { styled, useTheme } from "@mui/material/styles";
import { memo, useState, useCallback, useRef } from "react";
import IncidentTimeline from "../components/ModalTimeLine";

/* =============================
   STEPPER
============================= */
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

function CustomStepIcon({ ownerState }) {
	const { currentStatus, stepKey } = ownerState;

	if (stepKey === "pending_review") {
		return <CheckCircleIcon color="primary" />;
	}

	if (stepKey === "accepted") {
		if (["accepted", "in_progress"].includes(currentStatus)) {
			return <QueryBuilderIcon color="primary" />;
		}
		if (currentStatus === "resolved") {
			return <CheckCircleIcon color="primary" />;
		}
		return <PendingIcon color="disabled" />;
	}

	if (stepKey === "in_progress") {
		if (currentStatus === "in_progress") {
			return <QueryBuilderIcon color="primary" />;
		}
		if (currentStatus === "resolved") {
			return <CheckCircleIcon color="primary" />;
		}
		return <PendingIcon color="disabled" />;
	}

	if (stepKey === "resolved") {
		return currentStatus === "resolved" ? (
			<CheckCircleIcon color="primary" />
		) : (
			<PendingIcon color="disabled" />
		);
	}

	if (stepKey === "cancelled") {
		return <CloseIcon color="error" />;
	}

	return <PendingIcon color="disabled" />;
}

/* =============================
   COMPONENTE
============================= */
const IncidentModal = memo(function IncidentModal({
	open,
	onClose,
	incident,
	stepsToRender,
	activeStep,
	onStepClick,
	onAccept,
	onConfirmCancel,
}) {
	const theme = useTheme();

	// 🔹 substitui showCancelReason
	const [actionOpen, setActionOpen] = useState(false);

	// 🔹 mantém o que já existia
	const [textReasonType, setTextReasonType] = useState("cancel");
	const [nextStatus, setNextStatus] = useState(null);
	const [hasReason, setHasReason] = useState(false);

	// 🔹 substitui cancelReason
	const reasonRef = useRef("");

	const [tab, setTab] = useState(0);

	const handleClose = () => {
		setActionOpen(false);
		setTextReasonType("cancel");
		setNextStatus(null);
		setHasReason(false);
		reasonRef.current = "";
		onClose();
	};

	if (!incident) return null;

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
			{/* HEADER */}
			<DialogTitle sx={{ fontWeight: "bold" }}>
				<Box display="flex" flexDirection="column" gap={1}>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Typography fontWeight={700}>
							Ocorrência #{incident.id}
						</Typography>

						<IconButton onClick={handleClose}>
							<CloseIcon />
						</IconButton>
					</Box>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				{/* STEPPER */}
				<Stepper
					alternativeLabel
					sx={{ my: 3 }}
					connector={<CustomStepConnector />}
					activeStep={activeStep === -1 ? 0 : activeStep}
				>
					{stepsToRender.map((step) => (
						<Step key={step.key}>
							<StepLabel
								StepIconComponent={(props) => (
									<CustomStepIcon
										{...props}
										ownerState={{
											currentStatus: incident.status,
											stepKey: step.key,
										}}
									/>
								)}
								onClick={() => {
									if (incident.status === "cancelled") return;

									if (
										(incident.status === "pending_review" &&
											step.key === "accepted") ||
										(incident.status === "accepted" &&
											step.key === "in_progress") ||
										(incident.status === "in_progress" &&
											step.key === "resolved")
									) {
										setTextReasonType("observation");
										setNextStatus(step.key);
										setActionOpen(true);
										return;
									}

									onStepClick(step.key);
								}}
								sx={{ cursor: "pointer" }}
							>
								{step.label}
							</StepLabel>
						</Step>
					))}
				</Stepper>

				{/* TABS */}
				<Tabs
					value={tab}
					onChange={(_, value) => setTab(value)}
					sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
				>
					<Tab label="Detalhes" />
					<Tab label="Histórico" />
				</Tabs>

				{/* ABA DETALHES */}
				{tab === 0 && (
					<>
						<Box display="flex" justifyContent="center" gap={4}>
							{incident.imageUrl ? (
								<img
									src={incident.imageUrl}
									alt="Ocorrência"
									style={{
										width: 300,
										height: 300,
										borderRadius: 8,
									}}
								/>
							) : (
								<Box
									width={300}
									height={300}
									display="flex"
									alignItems="center"
									justifyContent="center"
									flexDirection="column"
									bgcolor="text.secondary"
									borderRadius={2}
								>
									<ImageNotSupportedIcon
										sx={{ fontSize: 100 }}
									/>
									<Typography>Nenhuma imagem</Typography>
								</Box>
							)}

							<Box display="flex" flexDirection="column" gap={1}>
								<Typography>
									<b>Categoria:</b>{" "}
									{incident.ocorrencia?.categoria}
								</Typography>
								<Typography>
									<b>Tipo:</b> {incident.ocorrencia?.tipo}
								</Typography>
								<Typography>
									<b>Descrição:</b> {incident.desc}
								</Typography>
								<Typography>
									<b>Data:</b> {incident.data} às{" "}
									{incident.hora}
								</Typography>
								<Typography>
									<b>Endereço:</b> {incident.geoloc?.address}
								</Typography>
								<Typography>
									<b>Cidade:</b> {incident.geoloc?.city} -{" "}
									{incident.geoloc?.state}
								</Typography>
								<Typography>
									<b>CEP:</b> {incident.geoloc?.postalCode}
								</Typography>
							</Box>
						</Box>

						{actionOpen && (
							<Box mt={3}>
								<Typography
									fontWeight={600}
									color={
										textReasonType === "cancel"
											? "error.main"
											: "text.primary"
									}
									mb={1}
								>
									{textReasonType === "cancel"
										? "Motivo do cancelamento"
										: "Observações"}
								</Typography>
								<TextField
									fullWidth
									multiline
									minRows={3}
									autoFocus
									onChange={(e) => {
										reasonRef.current = e.target.value;
										setHasReason(!!e.target.value.trim());
									}}
								/>
							</Box>
						)}
					</>
				)}

				{/* ABA HISTÓRICO */}
				{tab === 1 && <IncidentTimeline incidentId={incident.id} />}
			</DialogContent>

			<DialogActions>
				<Box
					sx={{
						flexGrow: 1,
						display: "flex",
						justifyContent: "center",
						gap: 2,
					}}
				>
					{incident.status === "pending_review" &&
						tab === 0 &&
						!actionOpen && (
							<Button
								variant="contained"
								sx={{
									fontWeight: "bold",
									color: theme.palette.primary.contrastText,
								}}
								onClick={() => {
									setTextReasonType("observation");
									setNextStatus("accepted");
									setActionOpen(true);
								}}
							>
								Aceitar ocorrência
							</Button>
						)}

					{(incident.status === "pending_review" ||
						incident.status === "accepted") &&
						!actionOpen &&
						tab === 0 && (
							<Button
								variant="contained"
								sx={{
									fontWeight: "bold",
									backgroundColor: theme.palette.other.error,
									color: theme.palette.text.primary,
									"&:hover": {
										backgroundColor:
											theme.palette.other.errorDark ??
											theme.palette.error.dark,
									},
								}}
								onClick={() => {
									setTextReasonType("cancel");
									setActionOpen(true);
								}}
							>
								Cancelar ocorrência
							</Button>
						)}
				</Box>

				{actionOpen && tab === 0 && (
					<>
						<Button
							onClick={() => {
								setActionOpen(false);
								setTextReasonType("cancel");
								setNextStatus(null);
								setHasReason(false);
								reasonRef.current = "";
							}}
						>
							Voltar
						</Button>

						{textReasonType === "cancel" ? (
							<Button
								color="error"
								variant="contained"
								disabled={!hasReason}
								onClick={() => {
									onConfirmCancel(reasonRef.current);
									handleClose();
								}}
							>
								Confirmar cancelamento
							</Button>
						) : (
							<Button
								variant="contained"
								disabled={!hasReason}
								onClick={() => {
									onStepClick(nextStatus, reasonRef.current);
									handleClose();
								}}
							>
								Confirmar
							</Button>
						)}
					</>
				)}
			</DialogActions>
		</Dialog>
	);
});

export default IncidentModal;
