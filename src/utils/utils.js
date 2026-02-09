const buildAverageResponseTimeData = (incidentHistory) => {
	if (!Array.isArray(incidentHistory) || incidentHistory.length === 0) {
		return [];
	}

	// Agrupa histórico por incidente
	const groupedByIncident = incidentHistory.reduce((acc, item) => {
		if (!acc[item.incidentId]) acc[item.incidentId] = [];
		acc[item.incidentId].push(item);
		return acc;
	}, {});

	// Coleta tempos resolvidos
	const resolvedTimes = [];

	Object.values(groupedByIncident).forEach((history) => {
		const start = history.find(
			(h) => h.fromStatus === "accepted" && h.toStatus === "in_progress",
		);

		const end = history.find(
			(h) => h.fromStatus === "in_progress" && h.toStatus === "resolved",
		);

		if (!start || !end) return;

		const startDate = start.createdAt.toDate();
		const endDate = end.createdAt.toDate();

		const diffMinutes =
			(endDate.getTime() - startDate.getTime()) / 1000 / 60;

		if (diffMinutes <= 0) return;

		resolvedTimes.push({
			date: endDate.toLocaleDateString("pt-BR"),
			time: diffMinutes,
		});
	});

	// Agrupa por dia e calcula média
	const groupedByDay = resolvedTimes.reduce((acc, item) => {
		if (!acc[item.date]) acc[item.date] = [];
		acc[item.date].push(item.time);
		return acc;
	}, {});

	return Object.entries(groupedByDay)
		.map(([date, times]) => ({
			period: date,
			avgTime: Math.round(
				times.reduce((sum, t) => sum + t, 0) / times.length,
			),
		}))
		.sort((a, b) => {
			const [da, ma, ya] = a.period.split("/");
			const [db, mb, yb] = b.period.split("/");

			const dateA = new Date(`${ya}-${ma}-${da}`);
			const dateB = new Date(`${yb}-${mb}-${db}`);

			return dateA - dateB;
		});
};

export { buildAverageResponseTimeData };
