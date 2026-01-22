export default function useIncidentFilters(
	rows,
	{ status, category, startDate, endDate, search },
) {
	return rows
		.filter((row) => {
			// STATUS
			if (status !== "all" && row.status !== status) return false;

			// CATEGORIA
			if (category !== "all" && row.ocorrencia?.categoria !== category) {
				return false;
			}

			// BUSCA POR TEXTO
			if (search.trim()) {
				const text = search.toLowerCase();

				const match =
					row.ocorrencia?.categoria?.toLowerCase().includes(text) ||
					row.ocorrencia?.tipo?.toLowerCase().includes(text) ||
					row.desc?.toLowerCase().includes(text) ||
					row.geoloc?.address?.toLowerCase().includes(text) ||
					row.geoloc?.city?.toLowerCase().includes(text);

				if (!match) return false;
			}

			// DATA
			const [day, month, year] = row.data.split("/");
			const rowDate = new Date(`${year}-${month}-${day}`);

			if (startDate && rowDate < new Date(startDate)) return false;
			if (endDate && rowDate > new Date(endDate)) return false;

			return true;
		})
		.sort((a, b) => {
			// Ordena por data e hora (mais recentes primeiro)
			const [dayA, monthA, yearA] = a.data.split("/");
			const [dayB, monthB, yearB] = b.data.split("/");
			const dateA = new Date(yearA, monthA - 1, dayA);
			const dateB = new Date(yearB, monthB - 1, dayB);
			return dateB - dateA;
		});
}
