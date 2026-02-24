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
import { styled, useTheme, darken } from "@mui/material/styles";
import { memo, useState, useRef } from "react";

import IncidentTimeline from "../components/ModalTimeLine";
import { statusList } from "../utils/statusList";
import { statusTransitions } from "../utils/statusList";

/* =============================
   STEPPER (READ ONLY)
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

	if (stepKey === "cancelled") {
		return <CloseIcon color="error" />;
	}

	if (stepKey === "resolved" && currentStatus === "resolved") {
		return <CheckCircleIcon color="primary" />;
	}

	if (currentStatus === stepKey) {
		return <QueryBuilderIcon color="primary" />;
	}

	const statusOrder = [
		"pending_review",
		"accepted",
		"in_progress",
		"resolved",
	];

	const currentIndex = statusOrder.indexOf(currentStatus);
	const stepIndex = statusOrder.indexOf(stepKey);

	if (stepIndex !== -1 && stepIndex < currentIndex) {
		return <CheckCircleIcon color="primary" />;
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
	onConfirmCancel,
}) {
	const theme = useTheme();

	const [tab, setTab] = useState(0);

	// fluxo de ação
	const [actionOpen, setActionOpen] = useState(false);
	const [textReasonType, setTextReasonType] = useState(null);
	const [nextStatus, setNextStatus] = useState(null);
	const [hasReason, setHasReason] = useState(false);

	const reasonRef = useRef("");

	const handleClose = () => {
		setActionOpen(false);
		setTextReasonType(null);
		setNextStatus(null);
		setHasReason(false);
		reasonRef.current = "";
		onClose();
	};

	if (!incident) return null;

	const availableActions = statusTransitions[incident.status] || [];

	const InfoItem = ({ label, value, full }) => (
		<Box gridColumn={full ? "1 / -1" : "auto"}>
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
			<Typography variant="body2" component={"div"}>
				{value || "-"}
			</Typography>
		</Box>
	);

	return (
		<Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
			{/* HEADER */}
			<DialogTitle>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
				>
					<Box
						display="flex"
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography fontWeight={700}>Protocolo:</Typography>
						<Typography sx={{ ml: 1 }}>{incident.id}</Typography>
					</Box>
					<IconButton onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				</Box>
			</DialogTitle>

			<DialogContent dividers>
				{/* STEPPER */}
				<Stepper
					alternativeLabel
					activeStep={activeStep === -1 ? 0 : activeStep}
					connector={<CustomStepConnector />}
					sx={{
						my: 3,
						p: 2,
						background: theme.palette.background.default,
						borderRadius: "8px",
					}}
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
							>
								{step.label}
							</StepLabel>
						</Step>
					))}
				</Stepper>

				{/* TABS */}
				<Tabs
					value={tab}
					onChange={(_, v) => setTab(v)}
					sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
				>
					<Tab label="Detalhes" />
					<Tab label="Histórico" />
				</Tabs>

				{/* DETALHES */}
				{tab === 0 && (
					<>
						<Box display="flex" gap={3} alignItems={"center"}>
							{incident.imageUrl ? (
								<Box
									component="img"
									src={incident.imageUrl}
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
									display="flex"
									alignItems="center"
									justifyContent="center"
									flexDirection="column"
									bgcolor="grey.200"
									borderRadius={2}
									flexShrink={0}
								>
									<ImageNotSupportedIcon
										sx={{ fontSize: 80 }}
									/>
									<Typography>Nenhuma imagem</Typography>
								</Box>
							)}

							<Box
								display="grid"
								gridTemplateColumns="repeat(2, minmax(0, 1fr))"
								gap={"12px"}
								width="100%"
								bgcolor={theme.palette.background.default}
								p={2}
								borderRadius={2}
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
											{incident.type !== "incident" && (
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
								<Typography fontWeight={600} mb={1}>
									{textReasonType === "cancel"
										? "Motivo do cancelamento"
										: `Observações — ${statusList[nextStatus]?.label}`}
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

				{/* HISTÓRICO */}
				{tab === 1 && <IncidentTimeline incidentId={incident.id} />}
			</DialogContent>

			{/* ACTIONS */}
			{tab === 0 && (
				<DialogActions>
					{!actionOpen && (
						<Box
							sx={{
								flexGrow: 1,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								gap: 2,
								m: 1,
							}}
						>
							{availableActions.length
								? "Alterar status para:"
								: ""}
							{availableActions.map((action) => {
								const meta = statusList[action.to];

								return (
									<Button
										key={action.to}
										variant="contained"
										sx={{
											backgroundColor:
												action.type === "cancel"
													? theme.palette.error.main
													: meta.color,

											color: theme.palette.getContrastText(
												meta.color,
											),

											"&:hover": {
												backgroundColor: darken(
													action.type === "cancel"
														? theme.palette.error
																.main
														: meta.color,
													0.15, // intensidade (0.1 a 0.2 é o sweet spot)
												),
											},
										}}
										onClick={() => {
											setTextReasonType(action.type);
											setNextStatus(action.to);
											setActionOpen(true);
										}}
									>
										{meta.label}
									</Button>
								);
							})}
						</Box>
					)}
					{actionOpen && (
						<>
							<Button
								onClick={() => {
									setActionOpen(false);
									setTextReasonType(null);
									setNextStatus(null);
									setHasReason(false);
									reasonRef.current = "";
								}}
							>
								Voltar
							</Button>

							<Button
								variant="contained"
								color={
									textReasonType === "cancel"
										? "error"
										: "primary"
								}
								sx={{ mr: 2 }}
								disabled={!hasReason}
								onClick={() => {
									if (textReasonType === "cancel") {
										onConfirmCancel(reasonRef.current);
									} else {
										onStepClick(
											nextStatus,
											reasonRef.current,
										);
									}
									handleClose();
								}}
							>
								Confirmar
							</Button>
						</>
					)}
				</DialogActions>
			)}
		</Dialog>
	);
});

export default IncidentModal;
