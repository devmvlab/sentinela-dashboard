import { Grid, Card, CardContent, Typography } from "@mui/material";
import DashboardLayout from "../layout/DashboardLayout";

export default function Dashboard() {
	return (
		<DashboardLayout>
			<Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
				Visão Geral
			</Typography>

			<Grid container spacing={3}>
				<Grid item xs={12} md={4}>
					<Card sx={{ backgroundColor: "background.paper", p: 2 }}>
						<CardContent>
							<Typography variant="h6">
								Total de Ocorrências
							</Typography>
							<Typography
								variant="h3"
								fontWeight={900}
								sx={{ mt: 1 }}
							>
								128
							</Typography>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ backgroundColor: "background.paper", p: 2 }}>
						<CardContent>
							<Typography variant="h6">Emergências</Typography>
							<Typography
								variant="h3"
								fontWeight={900}
								sx={{ mt: 1 }}
							>
								7
							</Typography>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ backgroundColor: "background.paper", p: 2 }}>
						<CardContent>
							<Typography variant="h6">
								Ocorrências Hoje
							</Typography>
							<Typography
								variant="h3"
								fontWeight={900}
								sx={{ mt: 1 }}
							>
								12
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</DashboardLayout>
	);
}
