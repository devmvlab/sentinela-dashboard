import { Card, CardContent, Typography, Box } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Cell,
	LabelList,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import ChartEmptyState from "../components/ChartEmptyState";

export default function PeakHourChart({ data = [] }) {
	const theme = useTheme();
	const [activeIndex, setActiveIndex] = useState(null);

	const hasData = data.length > 0;

	return (
		<Card sx={{ borderRadius: "8px" }}>
			<CardContent>
				<Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
					Horário de Pico
				</Typography>

				{!hasData ? (
					<ChartEmptyState />
				) : (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={data}
							margin={{ top: 40, right: 20, left: 0, bottom: 20 }}
							onMouseMove={(state) =>
								state?.activeTooltipIndex !== undefined &&
								setActiveIndex(state.activeTooltipIndex)
							}
							onMouseLeave={() => setActiveIndex(null)}
						>
							<XAxis dataKey="hour" stroke="#ccc" />
							<YAxis stroke="#ccc" allowDecimals={false} />

							<Tooltip
								cursor={false}
								contentStyle={{
									backgroundColor:
										theme.palette.background.paper,
									borderRadius: "8px",
									border: "none",
								}}
							/>

							<Bar
								dataKey="total"
								fill={theme.palette.primary.main}
								radius={[8, 8, 0, 0]}
								barSize={40}
							>
								<LabelList
									dataKey="total"
									position="top"
									fontWeight={700}
								/>

								{data.map((_, index) => (
									<Cell
										key={index}
										fill={
											activeIndex === index
												? theme.palette.background
														.default
												: theme.palette.primary.main
										}
									/>
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				)}
			</CardContent>
		</Card>
	);
}
