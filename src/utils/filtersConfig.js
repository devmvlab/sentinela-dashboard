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

	type: {
		label: "Tipo de registro",
		isActive: (v) => v !== "",
		formatValue: (v) =>
			v === "emergency"
				? "Emergências"
				: v === "incident"
					? "Ocorrências"
					: v === "panic"
						? "Pedido de socorro"
						: "Todos",
	},

	startDate: {
		label: "De",
		isActive: Boolean,
		formatValue: (v) =>
			new Date(`${v}T00:00:00`).toLocaleDateString("pt-BR"),
	},

	endDate: {
		label: "Até",
		isActive: Boolean,
		formatValue: (v) =>
			new Date(`${v}T00:00:00`).toLocaleDateString("pt-BR"),
	},
};
