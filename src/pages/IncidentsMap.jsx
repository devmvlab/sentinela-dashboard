import { Box, Card, CardContent, Typography } from "@mui/material";
import SentinelaMap from "../components/SentinelaMap";

import { categories } from "../utils/categoriesList";
import { getMarkerIconByCategory } from "../utils/markerIcons";
import { statusList } from "../utils/statusList";

export default function IncidentsMap({
	mapState,
	onMapStateChange,
	incidents,
	loading,
}) {
	// 🔹 dados globais (já filtrados por cidade)

	// 🔹 transforma incidents em ocorrências do mapa
	const ocorrencias = (incidents || [])
		.filter((d) => d.status !== statusList.cancelled.id)
		.map((d) => {
			const category = categories.find(
				(c) =>
					c.title.trim().toLowerCase() ===
					d.ocorrencia?.categoria?.trim().toLowerCase(),
			);

			return {
				id: d.id,

				// coords
				lat: d.geoloc?.latitude,
				lng: d.geoloc?.longitude,

				// dados
				categoria: d.ocorrencia?.categoria,
				tipo: d.ocorrencia?.tipo,
				descricao: d.desc,
				endereco: d.geoloc?.address,
				status: d.status,
				hora: d.hora,

				// ícone por categoria
				markerIcon: getMarkerIconByCategory(
					category?.icon || "dots-horizontal-circle-outline",
				),
			};
		})
		.filter((o) => typeof o.lat === "number" && typeof o.lng === "number");

	if (loading) {
		return (
			<Box
				sx={{
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Typography color="text.secondary">
					Carregando mapa da cidade...
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ height: "100%" }}>
			<Card
				sx={{
					height: "100%",
					borderRadius: 2,
					overflow: "hidden",
				}}
			>
				<CardContent sx={{ p: 0, height: "100%" }}>
					<SentinelaMap
						ocorrencias={ocorrencias}
						mapState={mapState}
						onMapStateChange={onMapStateChange}
					/>
				</CardContent>
			</Card>
		</Box>
	);
}
