export const categories = [
	{
		title: "Segurança Pública",
		icon: "shield-outline",
		color: "#7E57C2",
		items: [
			{
				title: "Assalto",
				icon: "robber",
				type: "emergency",
				windowHours: 24,
				push: {
					title: "🚨 Alerta de Assalto",
					message:
						"Ocorrências de assalto foram registradas recentemente na sua região. Fique atento e evite locais isolados.",
				},
			},
			{
				title: "Furto",
				icon: "wallet-outline",
				type: "incident",
				windowHours: 72,
				push: {
					title: "⚠️ Aviso de Furto",
					message:
						"Cresceram os relatos de furto na sua área. Atenção redobrada aos seus pertences.",
				},
			},
			{
				title: "Vandalismo",
				icon: "spray",
				type: "incident",
				windowHours: 168, // 7 dias
				push: {
					title: "🚧 Ocorrências de Vandalismo",
					message:
						"Foram registradas ocorrências de vandalismo na sua região recentemente.",
				},
			},
			{
				title: "Violência",
				icon: "arm-flex-outline",
				type: "emergency",
				windowHours: 48,
				push: {
					title: "🚨 Alerta de Violência",
					message:
						"Aumentaram os registros de violência na sua região. Evite ruas isoladas e redobre a atenção.",
				},
			},
		],
	},
	{
		title: "Trânsito e Transporte",
		icon: "car",
		color: "#FFA726",
		items: [
			{
				title: "Acidente",
				icon: "car-traction-control",
				type: "emergency",
				windowHours: 12,
				push: {
					title: "🚧 Alerta de Acidente",
					message:
						"Registro de acidente recente na sua área. Dirija com cuidado.",
				},
			},
			{
				title: "Buraco na rua",
				icon: "road-variant",
				type: "incident",
				windowHours: 720, // 30 dias
			},
			{
				title: "Semáforo quebrado",
				icon: "traffic-light",
				type: "incident",
				windowHours: 48,
			},
			{
				title: "Veículo abandonado",
				icon: "car-off",
				type: "incident",
				windowHours: 168,
			},
		],
	},
	{
		title: "Infraestrutura Urbana",
		icon: "city-variant-outline",
		color: "#1E88E5",
		items: [
			{
				title: "Calçada danificada",
				icon: "walk",
				type: "incident",
				windowHours: 720,
			},
			{
				title: "Esgoto",
				icon: "pipe",
				type: "incident",
				windowHours: 168,
			},
			{
				title: "Iluminação pública",
				icon: "lightbulb-outline",
				type: "incident",
				windowHours: 168,
			},
			{
				title: "Poste caído",
				icon: "sign-pole",
				type: "incident",
				windowHours: 48,
			},
		],
	},
	{
		title: "Meio Ambiente",
		icon: "leaf",
		color: "#43A047",
		items: [
			{
				title: "Árvore caída",
				icon: "tree",
				type: "incident",
				windowHours: 72,
			},
			{
				title: "Enchente",
				icon: "home-flood",
				type: "emergency",
				windowHours: 12,
				push: {
					title: "🌊 Alerta de Enchente",
					message:
						"Registros de enchente próximos. Evite áreas de alagamento.",
				},
			},
			{
				title: "Incêndio",
				icon: "fire",
				type: "emergency",
				windowHours: 6,
				push: {
					title: "🔥 Alerta de Incêndio",
					message:
						"Incêndio reportado na sua região. Mantenha distância e acione os bombeiros se necessário.",
				},
			},
			{
				title: "Lixo",
				icon: "trash-can-outline",
				type: "incident",
				windowHours: 720,
			},
			{
				title: "Mato alto",
				icon: "grass",
				type: "incident",
				windowHours: 720,
			},
			{
				title: "Queimada",
				icon: "pine-tree-fire",
				type: "emergency",
				windowHours: 12,
				push: {
					title: "🔥 Risco de Queimada",
					message:
						"Aumento de focos de queimada na região. Evite áreas com fumaça.",
				},
			},
			{
				title: "Poluição",
				icon: "factory",
				type: "incident",
				windowHours: 168,
			},
		],
	},
	{
		title: "Saúde e Bem-estar",
		icon: "heart-pulse",
		color: "#d32f2f",
		items: [
			{
				title: "Animal abandonado",
				icon: "dog",
				type: "incident",
				windowHours: 72,
			},
			{
				title: "Foco de dengue",
				icon: "tire",
				type: "incident",
				windowHours: 336,
			}, // 14 dias
			{
				title: "Más condições sanitárias",
				icon: "hospital-building",
				type: "incident",
				windowHours: 168,
			},
		],
	},
	{
		title: "Outros",
		icon: "dots-horizontal-circle-outline",
		color: "#757575",
		items: [
			{
				title: "Outro tipo de ocorrência",
				icon: "dots-horizontal",
				type: "incident",
				windowHours: 72,
			},
		],
	},
	{
		title: "Pânico",
		icon: "shield-alert-outline",
		color: "#d32f2f",
		items: [
			{
				title: "Pedido de socorro",
				icon: "shield-alert-outline",
				type: "incident",
				windowHours: 72,
			},
		],
	},
];
