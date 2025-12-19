export function formatTime(date) {
	if (!date) return "--:--";
	return date.toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}