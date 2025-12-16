import {
	GoogleMap,
	Marker,
	InfoWindow,
	useJsApiLoader,
} from "@react-google-maps/api";
import { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";

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
	const [selected, setSelected] = useState(null);

	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
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
		[onMapStateChange]
	);

	if (!isLoaded) return null;

	return (
		<GoogleMap
			mapContainerStyle={containerStyle}
			center={mapState?.center || defaultCenter}
			zoom={mapState?.zoom || 13}
			onIdle={handleIdle}
			options={{
				disableDefaultUI: true,
				zoomControl: true,
			}}
		>
			{ocorrencias.map((o) => (
				<Marker
					key={o.id}
					position={{ lat: o.lat, lng: o.lng }}
					onClick={() => setSelected(o)}
					icon={{
						url: o.markerIcon,
					}}
				/>
			))}

			{selected && (
				<InfoWindow
					position={{ lat: selected.lat, lng: selected.lng }}
					onCloseClick={() => setSelected(null)}
				>
					<Box
						sx={{
							backgroundColor: "#ffffff",
							color: "#111111",

							// REMOVE o “respiro” do Google Maps
							mt: "-8px",

							borderRadius: 1.5,
							minWidth: 260,
							maxWidth: 300,

							// nenhum padding aqui
							p: 0,
						}}
					>
						{/* HEADER — TÍTULO COLADO */}
						<Box
							sx={{
								px: 1.5,
								pt: 0.75, // padding top mínimo
								pb: 0.25,
							}}
						>
							<Typography
								variant="subtitle1"
								fontWeight={700}
								sx={{
									lineHeight: 1.1,
									m: 0, // remove qualquer margem
								}}
							>
								{selected.categoria}
							</Typography>

							<Typography
								variant="body2"
								fontWeight={500}
								sx={{
									color: "#444",
									lineHeight: 1.2,
								}}
							>
								{selected.tipo}
							</Typography>
						</Box>

						{/* DIVISOR */}
						<Box
							sx={{
								height: 1,
								backgroundColor: "#e0e0e0",
								my: 0.75,
							}}
						/>

						{/* CORPO */}
						<Box sx={{ px: 1.5, pb: 1.25 }}>
							<Typography
								variant="body2"
								sx={{ color: "#555", lineHeight: 1.4 }}
							>
								{selected.endereco}
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
	);
}
