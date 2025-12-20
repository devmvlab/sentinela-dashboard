import { Card, CardContent, Typography, Box } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@mui/material/styles";

export default function EmergencyPieChart({ data }) {
	const theme = useTheme();

	const COLORS = [
		theme.palette.error.main, // 🔴 Emergências
		theme.palette.primary.main, // 🔵 Ocorrências
	];

	return (
		<Card sx={{ borderRadius: "8px" }}>
			<CardContent>
				<Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
					Emergências x Ocorrências
				</Typography>

				<Box sx={{ width: "100%", height: 300 }}>
					<ResponsiveContainer>
						<PieChart>
							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="50%"
								outerRadius={90}
								innerRadius={55} // 🔥 donut (mais moderno)
								paddingAngle={3}
								isAnimationActive={true}
							>
								{data.map((_, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index]}
									/>
								))}
							</Pie>

							{/* Tooltip customizado */}
							<Tooltip
								contentStyle={{
									backgroundColor:
										theme.palette.background.paper,
									border: "none",
									borderRadius: 8,
								}}
								itemStyle={{
									color: theme.palette.text.primary, // valores
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				</Box>
			</CardContent>
		</Card>
	);
}
