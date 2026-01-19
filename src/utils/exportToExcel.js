import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportIncidentsToExcel(rows) {
	if (!rows || rows.length === 0) {
		alert("Nenhum dado para gerar o relatório");
		return;
	}

	const statusLabels = {
		pending: "Pendente",
		open: "Em Aberto",
		closed: "Fechado",
		resolved: "Resolvido",
	};

	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Incidentes");

	/* ================= CABEÇALHO ================= */
	worksheet.mergeCells("A1:I1");
	const titleCell = worksheet.getCell("A1");
	titleCell.value = "SENTINELA — Relatório de Incidentes";
	titleCell.font = { size: 16, bold: true };
	titleCell.alignment = { horizontal: "center", vertical: "middle" };

	worksheet.mergeCells("A2:I2");
	const subTitle = worksheet.getCell("A2");
	subTitle.value = `Gerado em ${new Date().toLocaleDateString("pt-BR")}`;
	subTitle.font = { italic: true };
	subTitle.alignment = { horizontal: "center" };

	/* ================= HEADER ================= */
	const headerRowIndex = 4;
	const headerRow = worksheet.getRow(headerRowIndex);

	headerRow.values = [
		"ID",
		"Status",
		"Categoria",
		"Tipo",
		"Descrição",
		"Data",
		"Local",
		"CEP",
		"Emergência",
	];

	headerRow.eachCell((cell) => {
		cell.font = { bold: true };
		cell.alignment = { horizontal: "center", vertical: "middle" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFEFEFEF" },
		};
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	});

	/* ================= DADOS ================= */
	let rowIndex = headerRowIndex + 1;

	rows.forEach((item) => {
		worksheet.getRow(rowIndex).values = [
			item.id,
			statusLabels[item.status] || item.status,
			item.ocorrencia?.categoria || "",
			item.ocorrencia?.tipo || "",
			item.desc,
			item.data || "",
			item.geoloc?.address || "",
			item.geoloc?.postalCode || "",
			item.isEmergency ? "Sim" : "Não",
		];
		rowIndex++;
	});

	/* ================= COLUNAS ================= */
	worksheet.columns = [
		{ width: 12 },
		{ width: 14 },
		{ width: 20 },
		{ width: 18 },
		{ width: 45 },
		{ width: 15 },
		{ width: 35 },
		{ width: 14 },
		{ width: 14 },
	];

	worksheet.getColumn(6).numFmt = "dd/mm/yyyy";

	/* ================= FILTRO & FREEZE ================= */
	worksheet.autoFilter = {
		from: "A4",
		to: "I4",
	};

	worksheet.views = [{ state: "frozen", ySplit: 4 }];

	/* ================= EXPORT ================= */
	const buffer = await workbook.xlsx.writeBuffer();
	saveAs(
		new Blob([buffer]),
		`relatorio-incidentes-${new Date()
			.toISOString()
			.slice(0, 10)}.xlsx`
	);
}
