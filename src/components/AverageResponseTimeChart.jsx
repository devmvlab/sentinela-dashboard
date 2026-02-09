import { Card, CardContent, Typography } from "@mui/material";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import ChartEmptyState from "./ChartEmptyState";

const formatResolutionTime = (minutes) => {
	if (minutes == null || isNaN(minutes)) return "-";

	if (minutes < 60) {
		return `${Math.round(minutes)} min`;
	}

	if (minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = Math.round(minutes % 60);

		if (remainingMinutes === 0) {
			return `${hours}h`;
		}

		return `${hours}h ${remainingMinutes}min`;
	}

	const days = Math.floor(minutes / 1440);
	const remainingHours = Math.floor((minutes % 1440) / 60);

	if (remainingHours === 0) {
		return `${days}d`;
	}

	return `${days}d ${remainingHours}h`;
};

export default function AverageResponseTimeChart({ data = [] }) {
	const theme = useTheme();
	const hasData = Array.isArray(data) && data.length > 0;

	return (
		<Card sx={{ borderRadius: "8px" }}>
			<CardContent>
				<Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
					Tempo Médio de Atendimento
				</Typography>

				{!hasData ? (
					<ChartEmptyState />
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={data}>
							<XAxis
								dataKey="period"
								stroke="#ccc"
								fontSize={13}
							/>

							<YAxis
								stroke="#ccc"
								fontSize={13}
								tickFormatter={formatResolutionTime}
							/>

							<Tooltip
								formatter={(value) => [
									formatResolutionTime(value),
									"Tempo médio",
								]}
								contentStyle={{
									backgroundColor:
										theme.palette.background.paper,
									borderRadius: "8px",
									border: "none",
								}}
							/>

							<Line
								type="monotone"
								dataKey="avgTime"
								stroke={theme.palette.primary.main}
								strokeWidth={3}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
								isAnimationActive
								animationDuration={800}
							/>
						</LineChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
}
