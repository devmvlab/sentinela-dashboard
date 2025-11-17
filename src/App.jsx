import { ThemeProvider } from "@mui/material/styles";
import { sentinelaTheme } from "./theme/theme";

export default function App() {
	return (
		<ThemeProvider theme={sentinelaTheme}>
			<div style={{ padding: 20 }}>
				<h2 style={{ fontWeight: 700 }}>
					Sentinela Dashboard (início)
				</h2>
				<p style={{ opacity: 0.7 }}>
					Tema carregado com sucesso! Vamos construir o dashboard
					agora.
				</p>
			</div>
		</ThemeProvider>
	);
}
