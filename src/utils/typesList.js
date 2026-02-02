export const typesList = {
	pending_review: {
		id: "pending_review",
		icon: "clock-outline",
		color: "#FFC107",
		label: "Em análise",
		description:
			"Ocorrência recebida e aguardando avaliação da prefeitura.",
	},
	cancelled: {
		id: "cancelled",
		icon: "close-circle-outline",
		color: "#d32f2f",
		label: "Cancelada",
		description:
			"Ocorrência analisada e descartada pela prefeitura por inconsistência, duplicidade ou fora da competência do município.",
	},
	accepted: {
		id: "accepted",
		icon: "checkbox-marked-circle-plus-outline",
		color: "#9E9E9E",
		label: "Aceita",
		description:
			"Ocorrência validada e aprovada para atendimento pelo município.",
	},
	in_progress: {
		id: "in_progress",
		icon: "account-hard-hat-outline",
		color: "#1E88E5",
		label: "Em andamento",
		description:
			"Equipe ou setor responsável acionado e trabalhando na ocorrência.",
	},
	resolved: {
		id: "resolved",
		icon: "check-circle-outline",
		color: "#A1EC2F99",
		label: "Resolvida",
		description:
			"Problema solucionado com sucesso e finalizado pelo setor responsável.",
	},
};
