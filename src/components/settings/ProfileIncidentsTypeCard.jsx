import {
	Box,
	Typography,
	FormGroup,
	FormControlLabel,
	Checkbox,
	CircularProgress,
} from "@mui/material";
import { categories } from "../../utils/categoriesList";
import { useTheme } from "@mui/material/styles";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function ProfileIncidentsTypeCard({
	incidentTypes,
	onToggle,
	loading,
}) {
	const theme = useTheme();

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: 200,
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Accordion>
			<AccordionSummary
				expandIcon={<ArrowDownwardIcon />}
				sx={{
					backgroundColor: "background.default",
					"& .MuiAccordionSummary-expandIconWrapper": {
						color: "#fff",
					},
				}}
			>
				<Typography variant="h6" fontWeight={700}>
					Notificações
				</Typography>
			</AccordionSummary>

			<AccordionDetails>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "repeat(2, 1fr)",
							md: "repeat(3, 1fr)",
						},
						gap: 3,
					}}
				>
					{categories.map((category) => (
						<Box key={category.title}>
							<Typography
								fontWeight={600}
								mb={1}
								color={theme.palette.primary.main}
							>
								{category.title}
							</Typography>

							<FormGroup>
								{category.items.map((item) => (
									<FormControlLabel
										key={item.title}
										label={item.title}
										control={
											<Checkbox
												checked={incidentTypes.includes(
													item.title,
												)}
												onChange={() =>
													onToggle(item.title)
												}
											/>
										}
									/>
								))}
							</FormGroup>
						</Box>
					))}
				</Box>
			</AccordionDetails>
		</Accordion>
	);
}
