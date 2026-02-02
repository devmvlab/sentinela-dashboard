import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { typesList } from "./typesList";

export async function exportIncidentsToPdf(rows) {
	if (!rows || rows.length === 0) {
		alert("Nenhum dado para gerar o relatório");
		return;
	}

	const doc = new jsPDF({
		orientation: "landscape", // melhor pra tabelas largas
		unit: "mm",
		format: "a4",
	});

	/* ================= LOGO ================= */
	const logo = await loadImage("/logo.png");

	const logoWidth = 30;
	const logoHeight = logoWidth;
	const tableStartY = 8 + logoHeight + 10;

	doc.addImage(logo, "PNG", 10, 8, logoWidth, logoHeight);

	/* ================= TÍTULO ================= */
	doc.setFontSize(16);
	doc.setFont("Montserrat", "bold");
	doc.text("Relatório de Incidentes", 148, 18, { align: "center" });

	doc.setFontSize(10);
	doc.setFont("Montserrat", "normal");
	doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 148, 24, {
		align: "center",
	});

	/* ================= DADOS ================= */
	const tableBody = rows.map((item) => [
		item.id,
		typesList[item.status]?.label || item.status,
		item.ocorrencia?.categoria || "",
		item.ocorrencia?.tipo || "",
		item.desc || "",
		item.data || "",
		item.geoloc?.address || "",
		item.geoloc?.postalCode || "",
		item.isEmergency ? "Sim" : "Não",
	]);

	/* ================= TABELA ================= */
	autoTable(doc, {
		startY: tableStartY,
		head: [
			[
				"ID",
				"Status",
				"Categoria",
				"Tipo",
				"Descrição",
				"Data",
				"Local",
				"CEP",
				"Emergência",
			],
		],
		body: tableBody,
		styles: {
			font: "Montserrat",
			fontSize: 8,
			cellPadding: 2,
			valign: "middle",
		},
		headStyles: {
			fillColor: [230, 230, 230],
			textColor: 20,
			fontStyle: "bold",
		},
		alternateRowStyles: {
			fillColor: [245, 245, 245],
		},
		columnStyles: {
			0: { cellWidth: 15 },
			1: { cellWidth: 20 },
			2: { cellWidth: 30 },
			3: { cellWidth: 25 },
			4: { cellWidth: 70 },
			5: { cellWidth: 20 },
			6: { cellWidth: 60 },
			7: { cellWidth: 20 },
			8: { cellWidth: 20 },
		},
		margin: { left: 10, right: 10 },
		didDrawPage: (data) => {
			// Footer
			const pageCount = doc.getNumberOfPages();
			doc.setFontSize(8);
			doc.text(`Página ${data.pageNumber} de ${pageCount}`, 148, 200, {
				align: "center",
			});
		},
	});

	/* ================= EXPORT ================= */
	doc.save(
		`relatorio-incidentes-${new Date().toISOString().slice(0, 10)}.pdf`,
	);
}

/* ================= UTIL ================= */
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}
