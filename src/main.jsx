import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { sentinelaTheme } from "./theme/theme";
import Root from "./root.jsx";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { useJsApiLoader } from "@react-google-maps/api";

function GoogleMapsProvider({ children }) {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
		libraries: ["visualization"],
	});

	if (!isLoaded) return null;

	return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<ThemeProvider theme={sentinelaTheme}>
		<CssBaseline />
		<AuthProvider>
			<GoogleMapsProvider>
				<Root />
			</GoogleMapsProvider>
		</AuthProvider>
	</ThemeProvider>,
);
