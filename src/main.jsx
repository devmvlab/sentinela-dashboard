import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { sentinelaTheme } from "./theme/theme";
import Root from "./root.jsx";

import { SentinelaDataProvider } from "./utils/SentinelaDataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
	<ThemeProvider theme={sentinelaTheme}>
		<CssBaseline />

		<SentinelaDataProvider>
			<Root />
		</SentinelaDataProvider>
	</ThemeProvider>
);
