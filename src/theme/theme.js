import { createTheme } from "@mui/material/styles";

export const sentinelaTheme = createTheme({
	palette: {
		mode: "dark",

		// PRINCIPAL
		primary: {
			main: "#A1EC2F", // verde Sentinela
			contrastText: "#20284E", // mesmo do onPrimary
		},

		// FUNDO
		background: {
			default: "#20284E", // background igual ao app
			paper: "#2B335D", // backgroundLight
		},

		// SUPERFÍCIES / CARDS
		surface: {
			main: "#20284E", // equivalente
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
		divider: "#ffffff33", // lineSeparator
	},

	shape: {
		borderRadius: 12,
	},

	typography: {
		fontFamily: "Montserrat, sans-serif",
		fontWeightLight: 400,
		fontWeightRegular: 400,
		fontWeightMedium: 500,
		fontWeightBold: 700,
	},

	components: {
		// TEXTFIELD / INPUTS → outline branco igual ao app
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
						borderColor: "#A1EC2F", // primary
						opacity: 1,
					},
				},
				input: {
					color: "#FFFFFF",
				},
			},
		},

		// BOTÕES → verde padrão
		MuiButton: {
			styleOverrides: {
				contained: {
					backgroundColor: "#A1EC2F",
					color: "#20284E",
					"&:hover": {
						backgroundColor: "#8fd72a",
					},
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

		// CARDS → mesmo estilo do app
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundColor: "#2B335D",
					borderRadius: 12,
				},
			},
		},
	},
});
