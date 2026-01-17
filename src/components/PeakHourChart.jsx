import { Card, CardContent, Typography } from "@mui/material";
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

export default function PeakHourChart({ data }) {
	const theme = useTheme();
	const [activeIndex, setActiveIndex] = useState(null);

	return (
		<Card sx={{ borderRadius: "8px" }}>
			<CardContent>
				<Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
					Horário de Pico
				</Typography>

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
						<XAxis
							dataKey="hour"
							stroke="#ccc"
							style={{ fontSize: 13 }}
						/>
						<YAxis stroke="#ccc" allowDecimals={false} />

						{/* Tooltip customizado (igual CategoryChart) */}
						<Tooltip
							cursor={false}
							contentStyle={{
								backgroundColor: theme.palette.background.paper,
								color: "#fff",
								borderRadius: "8px",
								border: "none",
							}}
						/>

						<Bar
							dataKey="total"
							fill={theme.palette.primary.main}
							radius={[8, 8, 0, 0]}
							barSize={40}
							isAnimationActive={true}
							animationDuration={800}
							animationEasing="ease-out"
						>
							{/* 🔢 Número acima da barra */}
							<LabelList
								dataKey="total"
								position="top"
								fill={theme.palette.text.primary}
								fontSize={14}
								fontWeight={700}
							/>

							{/* 🎨 Hover exatamente igual ao CategoryChart */}
							{data.map((_, index) => (
								<Cell
									key={`cell-${index}`}
									fill={
										activeIndex === index
											? theme.palette.background.default
											: theme.palette.primary.main
									}
									style={{
										cursor: "pointer",
										transition: "all 0.3s ease",
										filter:
											activeIndex === index
												? "drop-shadow(0px 0px 6px rgba(255,255,255,0.4))"
												: "none",
									}}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
