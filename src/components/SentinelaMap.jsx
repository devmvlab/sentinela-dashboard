import {
	GoogleMap,
	Marker,
	InfoWindow,
	useJsApiLoader,
	HeatmapLayer,
} from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { statusLabels } from "../components/StatusChip";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PlaceIcon from "@mui/icons-material/Place";
import { useTheme } from "@mui/material/styles";

const containerStyle = {
	width: "100%",
	height: "100%",
};

const defaultCenter = {
	lat: -15.7801,
	lng: -47.9292, // Brasil (só se tudo falhar)
};

export default function SentinelaMap({
	ocorrencias,
	mapState,
	onMapStateChange,
}) {
	const theme = useTheme();
	const [selected, setSelected] = useState(null);
	const [viewMode, setViewMode] = useState("markers"); // 🔹 ADICIONADO
	const status = selected?.status?.toLowerCase();

	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
		libraries: ["visualization"], // 🔹 ADICIONADO
	});

	// salva center + zoom quando o mapa “para”
	const handleIdle = useCallback(
		(map) => {
			if (!map || !onMapStateChange) return;

			onMapStateChange({
				center: map.getCenter().toJSON(),
				zoom: map.getZoom(),
			});
		},
		[onMapStateChange],
	);

	// 🔹 limpa seleção ao trocar para heatmap
	useEffect(() => {
		if (viewMode === "heatmap") setSelected(null);
	}, [viewMode]);

	if (!isLoaded) return null;

	return (
		<Box sx={{ height: "100%", position: "relative" }}>
			{/*  BOTÃO TOGGLE */}
			<Box
				sx={{
					position: "absolute",
					top: 16,
					right: 16,
					zIndex: 10,
				}}
			>
				<Box
					onClick={() =>
						setViewMode((prev) =>
							prev === "markers" ? "heatmap" : "markers",
						)
					}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						cursor: "pointer",
						backgroundColor: theme.palette.background.paper,
						color: theme.palette.text.primary,
						px: 2,
						py: 1,
						borderRadius: 2,
						fontSize: 14,
						fontWeight: 600,
						boxShadow: 4,
						userSelect: "none",
					}}
				>
					{viewMode === "markers" ? (
						<>
							<LocalFireDepartmentIcon fontSize="small" />
							Mapa de calor
						</>
					) : (
						<>
							<PlaceIcon fontSize="small" />
							Ocorrências
						</>
					)}
				</Box>
			</Box>

			<GoogleMap
				mapContainerStyle={containerStyle}
				center={mapState?.center || defaultCenter}
				zoom={mapState?.zoom || 13}
				onIdle={handleIdle}
				options={{
					disableDefaultUI: true,
					zoomControl: true,
					styles: [
						{
							featureType: "poi",
							stylers: [{ visibility: "off" }],
						},
					],
				}}
			>
				{/* 📍 MARKERS */}
				{viewMode === "markers" &&
					ocorrencias.map((o) => (
						<Marker
							key={o.id}
							position={{ lat: o.lat, lng: o.lng }}
							onClick={() => setSelected(o)}
							icon={{ url: o.markerIcon }}
						/>
					))}

				{/* 🔥 HEATMAP */}
				{viewMode === "heatmap" && (
					<HeatmapLayer
						data={ocorrencias.map(
							(o) => new window.google.maps.LatLng(o.lat, o.lng),
						)}
						options={{
							radius: 28,
							opacity: 0.7,
							dissipating: true,
						}}
					/>
				)}

				{/* ℹ️ INFO WINDOW */}
				{selected && viewMode === "markers" && (
					<InfoWindow
						position={{ lat: selected.lat, lng: selected.lng }}
						onCloseClick={() => setSelected(null)}
					>
						<Box
							sx={{
								backgroundColor: "#ffffff",
								color: "#111111",
								mt: "-8px",
								borderRadius: 1.5,
								minWidth: 260,
								maxWidth: 300,
								p: 0,
							}}
						>
							<Box sx={{ px: 1.5, pt: 0.75, pb: 0.25 }}>
								<Typography
									variant="subtitle1"
									fontWeight={700}
									sx={{ lineHeight: 1.1, m: 0 }}
								>
									{selected.categoria}
								</Typography>

								<Typography
									variant="body2"
									fontWeight={500}
									sx={{ color: "#444", lineHeight: 1.2 }}
								>
									{selected.tipo}
								</Typography>
							</Box>

							<Box
								sx={{
									height: 1,
									backgroundColor: "#e0e0e0",
									my: 0.75,
								}}
							/>

							<Box sx={{ px: 1.5, pb: 1.25 }}>
								<Typography
									variant="body2"
									sx={{ color: "#555", lineHeight: 1.4 }}
								>
									{selected.endereco}
								</Typography>

								<Typography
									variant="body2"
									sx={{
										color:
											status === "resolved"
												? "#4CAF50"
												: "#F44336",
										lineHeight: 1.4,
										paddingTop: 4,
									}}
								>
									Status: {statusLabels[status] || status}
								</Typography>

								<Typography
									variant="caption"
									sx={{
										display: "block",
										mt: 0.75,
										color: "#777",
									}}
								>
									Hora: {selected.hora}
								</Typography>
							</Box>
						</Box>
					</InfoWindow>
				)}
			</GoogleMap>
		</Box>
	);
}
