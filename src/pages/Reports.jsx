import { Box, Typography, Paper } from "@mui/material";
import Filters from "../components/Filters";
import useIncidentFilters from "../utils/useIncidentFilters";
import { useState } from "react";
import { useSentinelaData } from "../utils/SentinelaDataContext";

import Button from "@mui/material/Button";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Stack from "@mui/material/Stack";
import { exportIncidentsToExcel } from "../utils/exportToExcel";
import { exportIncidentsToPdf } from "../utils/exportIncidentsToPdf";

export default function Settings() {
	const [statusFilter, setStatusFilter] = useState("all");
	const [category, setCategory] = useState("all");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [search, setSearch] = useState("");

	const { incidents } = useSentinelaData();

	function clearFilters() {
		setStatusFilter("all");
		setCategory("all");
		setStartDate("");
		setEndDate("");
		setSearch("");
	}

	const filteredRows = useIncidentFilters(incidents || [], {
		status: statusFilter,
		category,
		startDate,
		endDate,
		search,
	});

	return (
		console.log(filteredRows),
		(
			<Box
				sx={{
					height: "100%",
					padding: 3,
					display: "flex",
					flexDirection: "column",
					gap: 2,
				}}
			>
				{/* Título da página */}
				<Typography variant="h4" fontWeight="bold">
					Relatórios
				</Typography>

				{/* Subtítulo */}
				<Typography variant="body2" color="text.secondary">
					Gerar relatórios das ocorrências registradas no sistema.
				</Typography>

				{/* Conteúdo vazio */}
				<Paper
					sx={{
						height: "100%",
						width: "100%",
						alignItems: "center",
						p: 1,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						gap: 1,
					}}
				>
					<Filters
						status={statusFilter}
						setStatus={setStatusFilter}
						category={category}
						setCategory={setCategory}
						startDate={startDate}
						setStartDate={setStartDate}
						endDate={endDate}
						setEndDate={setEndDate}
						search={search}
						setSearch={setSearch}
						onClear={clearFilters}
						showSearch={false}
					/>

					<Stack direction="row" spacing={2}>
						<Button
							variant="outlined"
							startIcon={<DescriptionIcon />}
							onClick={() => exportIncidentsToExcel(filteredRows)}
						>
							Gerar Excel
						</Button>
						<Button
							variant="outlined"
							endIcon={<PictureAsPdfIcon />}
							onClick={() => exportIncidentsToPdf(filteredRows)}
						>
							Gerar PDF
						</Button>
					</Stack>
				</Paper>
			</Box>
		)
	);
}
