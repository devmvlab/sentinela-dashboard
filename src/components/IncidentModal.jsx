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
} from "@mui/material";
import {
	CheckCircle as CheckCircleIcon,
	QueryBuilder as QueryBuilderIcon,
	Pending as PendingIcon,
	ImageNotSupported as ImageNotSupportedIcon,
	Close as CloseIcon,
	ReportGmailerrorred,
} from "@mui/icons-material";
import StepConnector from "@mui/material/StepConnector";
import { styled, useTheme } from "@mui/material/styles";
import { memo, useState, useRef } from "react";
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

	const InfoItem = ({ label, value, full }) => (
		<Box gridColumn={full ? "1 / -1" : "auto"}>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2">{value || "-"}</Typography>
		</Box>
	);

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
						<Box display="flex" gap={4} alignItems="center">
							{/* ================= IMAGEM ================= */}
							{incident.imageUrl ? (
								<Box
									component="img"
									src={incident.imageUrl}
									alt="Ocorrência"
									sx={{
										width: 300,
										height: 300,
										borderRadius: 2,
										objectFit: "cover",
										flexShrink: 0,
									}}
								/>
							) : (
								<Box
									width={300}
									height={300}
									minWidth={300}
									minHeight={300}
									display="flex"
									alignItems="center"
									justifyContent="center"
									flexDirection="column"
									bgcolor="grey.200"
									borderRadius={2}
									color="text.secondary"
									flexShrink={0}
								>
									<ImageNotSupportedIcon
										sx={{ fontSize: 80 }}
									/>
									<Typography variant="body2">
										Nenhuma imagem
									</Typography>
								</Box>
							)}

							{/* ================= INFORMAÇÕES ================= */}
							<Box
								display="grid"
								gridTemplateColumns="repeat(2, minmax(0, 1fr))"
								gap={2}
								width="100%"
							>
								<InfoItem
									label="Categoria"
									value={incident.ocorrencia?.categoria}
								/>

								<InfoItem
									label="Tipo"
									value={
										<Box
											display="flex"
											alignItems="center"
											gap={1}
										>
											{incident.ocorrencia?.tipo}
											{incident.isEmergency && (
												<ReportGmailerrorred
													color="error"
													fontSize="small"
												/>
											)}
										</Box>
									}
								/>

								<InfoItem
									label="Data"
									value={`${incident.data} às ${incident.hora}`}
								/>

								<InfoItem
									label="Cidade"
									value={`${incident.geoloc?.city} - ${incident.geoloc?.state}`}
								/>

								<InfoItem
									label="CEP"
									value={incident.geoloc?.postalCode}
								/>

								<InfoItem
									label="Endereço"
									value={incident.geoloc?.address}
									full
								/>

								<InfoItem
									label="Descrição"
									value={incident.desc}
									full
								/>
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

			{tab === 0 && (
				<DialogActions>
					<Box
						sx={{
							flexGrow: 1,
							display: "flex",
							justifyContent: "center",
							gap: 2,
							m: 1,
						}}
					>
						{incident.status === "pending_review" &&
							tab === 0 &&
							!actionOpen && (
								<Button
									variant="contained"
									sx={{
										fontWeight: "bold",
										color: theme.palette.primary
											.contrastText,
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
										backgroundColor:
											theme.palette.other.error,
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
									sx={{ mr: 2 }}
								>
									Confirmar cancelamento
								</Button>
							) : (
								<Button
									variant="contained"
									disabled={!hasReason}
									onClick={() => {
										onStepClick(
											nextStatus,
											reasonRef.current,
										);
										handleClose();
									}}
									sx={{ mr: 2 }}
								>
									Confirmar
								</Button>
							)}
						</>
					)}
				</DialogActions>
			)}
		</Dialog>
	);
});

export default IncidentModal;
