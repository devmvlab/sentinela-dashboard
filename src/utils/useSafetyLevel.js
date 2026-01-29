import { useEffect, useState } from "react";

const normalize = (value, max) =>
	Math.min(100, Math.max(0, Math.round((value / max) * 100)));

export function useSafetyLevel({ incidents, userCenter, period = "7d" }) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	const getDateRange = () => {
		const now = new Date();
		switch (period) {
			case "day":
				return new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
				);
			case "7d":
				return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			case "month":
				return new Date(now.getFullYear(), now.getMonth(), 1);
			default:
				return null;
		}
	};

	useEffect(() => {
		if (!incidents || !userCenter) return;

		setLoading(true);

		const startDate = getDateRange();

		let total = 0;
		let emergencyOpen = 0;
		let resolved = 0;

		incidents.forEach((item) => {
			if (!item.createdAt) return;

			const createdAt = item.createdAt.toDate
				? item.createdAt.toDate()
				: new Date(item.createdAt);

			if (createdAt < startDate) return;

			total++;

			const status = item.status?.toLowerCase();
			const isResolved = [
				"resolved",
				"cancelled",
				"pending_review",
			].includes(status);

			if (isResolved) {
				resolved++;
			}

			// 🔥 emergência só pesa se estiver em aberto
			if (item.isEmergency && !isResolved) {
				emergencyOpen++;
			}
		});

		const unresolved = Math.max(0, total - resolved);

		const raw = unresolved * 1 + emergencyOpen * 4;

		const score = normalize(100 - raw, 100);

		let statusLabel = "Seguro";
		let description = "Ambiente tranquilo";
		let color = "#7BE26A";

		if (score < 50) {
			statusLabel = "Risco";
			description = "Emergências ou ocorrências em aberto na região";
			color = "#F44336";
		} else if (score < 80) {
			statusLabel = "Atenção";
			description = "Algumas ocorrências ainda exigem atenção";
			color = "#FF9800";
		}

		setData({
			score,
			status: statusLabel,
			description,
			color,
			incidents: total,
			resolved,
			unresolved,
			emergencyOpen,
		});

		setLoading(false);
	}, [incidents, userCenter, period]);

	return { data, loading };
}
