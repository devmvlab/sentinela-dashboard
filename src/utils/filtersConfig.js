import { categoriesOptions, typesOptions } from "../utils/categoriesHelpers";

const categoryMap = Object.fromEntries(
	categoriesOptions.map((c) => [c.value, c.label]),
);

const typeMap = Object.fromEntries(typesOptions.map((t) => [t.value, t.label]));

export const filtersConfig = {
	status: {
		label: "Status",
		isActive: (v) => v && v !== "all",
		formatValue: (v) =>
			({
				pending_review: "Em análise",
				accepted: "Aceita",
				in_progress: "Em andamento",
				resolved: "Resolvida",
				cancelled: "Cancelada",
			})[v] ?? v,
	},

	category: {
		label: "Categoria",
		isActive: Boolean,
		formatValue: (v) => categoryMap[v],
	},

	type: {
		label: "Tipo",
		isActive: Boolean,
		formatValue: (v) => typeMap[v],
	},

	isEmergency: {
		label: "Tipo de registro",
		isActive: (v) => v !== "",
		formatValue: (v) =>
			v === "true"
				? "Emergências"
				: v === "false"
					? "Ocorrências"
					: "Todas",
	},

	startDate: {
		label: "De",
		isActive: Boolean,
		formatValue: (v) => new Date(v).toLocaleDateString("pt-BR"),
	},

	endDate: {
		label: "Até",
		isActive: Boolean,
		formatValue: (v) => new Date(v).toLocaleDateString("pt-BR"),
	},
};
