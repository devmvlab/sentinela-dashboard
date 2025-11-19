import { createTheme } from "@mui/material/styles";

export const sentinelaTheme = createTheme({
	palette: {
		mode: "dark",

		// PRINCIPAL
		primary: {
			main: "#A1EC2F", // verde Sentinela
			contrastText: "#20284E",
		},

		// FUNDO
		background: {
			default: "#20284E", // fundo geral
			paper: "#2B335D", // equivalente ao backgroundLight
			dark: "#0F1428", // recomendado para AppBar e Sidebar
		},

		// SUPERFÍCIES
		surface: {
			main: "#20284E",
			light: "#2B335D",
			dark: "#5062b7",
		},

		// TEXTO
		text: {
			primary: "#FFFFFF",
			secondary: "rgba(255,255,255,0.7)",
			disabled: "rgba(255,255,255,0.5)",
		},

		// OUTRAS CORES
		error: { main: "#d32f2f" },
		warning: { main: "#FFC107" },
		divider: "#ffffff33",
	},

	shape: { borderRadius: 4 },

	typography: {
		fontFamily: "Montserrat, sans-serif",
		fontWeightLight: 400,
		fontWeightRegular: 400,
		fontWeightMedium: 500,
		fontWeightBold: 700,
	},

	components: {
		// 🔹 Removendo overlay automático do modo dark
		// MuiAppBar: {
		// 	styleOverrides: {
		// 		root: {
		// 			backgroundImage: "none",
		// 			backgroundColor: "#0F1428",
		// 		},
		// 	},
		// },
		// MuiDrawer: {
		// 	styleOverrides: {
		// 		paper: {
		// 			backgroundImage: "none",
		// 			backgroundColor: "#0F1428",
		// 		},
		// 	},
		// },

		// INPUTS
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: "#FFFFFF",
						opacity: 0.4,
					},
					"&:hover .MuiOutlinedInput-notchedOutline": {
						borderColor: "#FFFFFF",
						opacity: 0.8,
					},
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: "#A1EC2F",
						opacity: 1,
					},
				},
				input: { color: "#FFFFFF" },
			},
		},

		// BOTÕES
		MuiButton: {
			styleOverrides: {
				contained: {
					backgroundColor: "#A1EC2F",
					color: "#20284E",
					"&:hover": { backgroundColor: "#8fd72a" },
				},
				outlined: {
					borderColor: "#A1EC2F",
					color: "#A1EC2F",
					"&:hover": {
						borderColor: "#C5FF6A",
						color: "#C5FF6A",
					},
				},
			},
		},

		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					backgroundColor: "#2B335D",
					color: "#fff",
					fontSize: "0.9rem",
				},
			},
		},

		// CARDS
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: "#2B335D",
					borderRadius: 12,
					backgroundImage: "none", // remove overlay
				},
			},
		},
	},
});
