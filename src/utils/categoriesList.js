export const categories = [
	{
		title: "Segurança Pública",
		icon: "shield-outline",
		color: "#7E57C2",
		items: [
			{
				title: "Assalto",
				icon: "robber",
				isEmergency: true,
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
				isEmergency: true,
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
				isEmergency: true,
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
				windowHours: 720, // 30 dias
			},
			{
				title: "Semáforo quebrado",
				icon: "traffic-light",
				windowHours: 48,
			},
			{
				title: "Veículo abandonado",
				icon: "car-off",
				windowHours: 168,
			},
		],
	},
	{
		title: "Infraestrutura Urbana",
		icon: "city-variant-outline",
		color: "#1E88E5",
		items: [
			{ title: "Calçada danificada", icon: "walk", windowHours: 720 },
			{ title: "Esgoto", icon: "pipe", windowHours: 168 },
			{
				title: "Iluminação pública",
				icon: "lightbulb-outline",
				windowHours: 168,
			},
			{ title: "Poste caído", icon: "sign-pole", windowHours: 48 },
		],
	},
	{
		title: "Meio Ambiente",
		icon: "leaf",
		color: "#43A047",
		items: [
			{ title: "Árvore caída", icon: "tree", windowHours: 72 },
			{
				title: "Enchente",
				icon: "home-flood",
				isEmergency: true,
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
				isEmergency: true,
				windowHours: 6,
				push: {
					title: "🔥 Alerta de Incêndio",
					message:
						"Incêndio reportado na sua região. Mantenha distância e acione os bombeiros se necessário.",
				},
			},
			{ title: "Lixo", icon: "trash-can-outline", windowHours: 720 },
			{ title: "Mato alto", icon: "grass", windowHours: 720 },
			{
				title: "Queimada",
				icon: "pine-tree-fire",
				isEmergency: true,
				windowHours: 12,
				push: {
					title: "🔥 Risco de Queimada",
					message:
						"Aumento de focos de queimada na região. Evite áreas com fumaça.",
				},
			},
			{ title: "Poluição", icon: "factory", windowHours: 168 },
		],
	},
	{
		title: "Saúde e Bem-estar",
		icon: "heart-pulse",
		color: "#d32f2f",
		items: [
			{ title: "Animal abandonado", icon: "dog", windowHours: 72 },
			{ title: "Foco de dengue", icon: "tire", windowHours: 336 }, // 14 dias
			{
				title: "Más condições sanitárias",
				icon: "hospital-building",
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
				title: "Qualquer caso não listado acima",
				icon: "dots-horizontal",
				windowHours: 72,
			},
		],
	},
];