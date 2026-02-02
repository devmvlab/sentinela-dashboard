import { Card, CardContent, Typography, Box } from "@mui/material";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChartEmptyState from "./ChartEmptyState";

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
								tickFormatter={(v) => `${v} min`}
							/>

							<Tooltip
								formatter={(value) => [
									`${value} min`,
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
