let companyCounter = 0;

document.addEventListener("DOMContentLoaded", function () {
  // Add initial company
  addCompany();

  // Load saved theme
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    document.getElementById("themeIcon").className = "fas fa-sun";
  }
});

// Form submission
document.getElementById("paymentForm").addEventListener("submit", function (e) {
  e.preventDefault();
  showPreview();
});

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

function addCompany() {
  companyCounter++;
  const companyId = `company-${companyCounter}`;

  const companyHTML = `
                <div class="company-item" id="${companyId}">
                    <div class="company-header">
                        <span class="company-title"><i class="fas fa-building"></i> Empresa ${companyCounter}</span>
                        <button type="button" class="btn btn-danger btn-small" onclick="removeCompany('${companyId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="company-fields">
                        <div>
                            <label>Nome da Empresa</label>
                            <input type="text" class="form-control company-name" placeholder="Ex: L'occitane" required>
                        </div>
                        <div class="row">
                            <div>
                                <label>Data de Início</label>
                                <input type="date" class="form-control company-start-date" required>
                            </div>
                            <div>
                                <label>Data de Fim</label>
                                <input type="date" class="form-control company-end-date" required>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Models Section for this Company -->
                    <div class="models-section">
                        <div class="models-header">
                            <h4><i class="fas fa-users"></i> Modelos</h4>
                            <button type="button" class="btn btn-primary btn-small" onclick="addModelToCompany('${companyId}')">
                                <i class="fas fa-plus"></i> Adicionar Modelo
                            </button>
                        </div>
                        <div class="models-list" id="modelsList-${companyId}">
                            <!-- Models for this company will be added here -->
                        </div>
                    </div>
                </div>
            `;

  document
    .getElementById("companiesList")
    .insertAdjacentHTML("beforeend", companyHTML);

  // Add initial model to this company
  addModelToCompany(companyId);
}

function removeCompany(companyId) {
  const companyElement = document.getElementById(companyId);
  companyElement.remove();
  calculateEventTotal();
}

function addModelToCompany(companyId) {
  const modelsList = document.getElementById(`modelsList-${companyId}`);
  const modelCounter = modelsList.querySelectorAll(".model-item").length + 1;
  const modelId = `${companyId}-model-${modelCounter}`;

  const modelHTML = `
                <div class="model-item" id="${modelId}">
                    <div class="model-header">
                        <span class="model-title">Modelo ${modelCounter}</span>
                        <button type="button" class="btn btn-danger btn-small" onclick="removeModel('${modelId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="model-fields">
                        <div>
                            <label>Nome</label>
                            <input type="text" class="form-control model-name" placeholder="Nome completo" required>
                        </div>
                        <div>
                            <label>Chave PIX</label>
                            <input type="text" class="form-control model-pix" placeholder="CPF/CNPJ/Email/Telefone" required>
                        </div>
                        <div>
                            <label>Cachê (R$)</label>
                            <input type="number" class="form-control model-cache" placeholder="0,00" step="0.01" min="0" required>
                        </div>
                        <div>
                            <label>Diárias</label>
                            <input type="number" class="form-control model-days" placeholder="1" min="1" value="1" required>
                        </div>
                        <div>
                            <label>Total</label>
                            <input type="text" class="form-control model-total" readonly>
                        </div>
                    </div>
                    <div class="form-group" style="margin-top: 10px;">
                        <label>Status de Pagamento</label>
                        <select class="form-control model-payment-status">
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-top: 10px;">
                        <label>Observações</label>
                        <textarea class="form-control model-observations" placeholder="Observações sobre o contratado..." rows="2"></textarea>
                    </div>
                </div>
            `;

  modelsList.insertAdjacentHTML("beforeend", modelHTML);

  // Add event listeners to calculate total
  const modelElement = document.getElementById(modelId);
  const cacheInput = modelElement.querySelector(".model-cache");
  const daysInput = modelElement.querySelector(".model-days");

  cacheInput.addEventListener("input", function () {
    calculateModelTotal(modelId);
    calculateEventTotal();
  });

  daysInput.addEventListener("input", function () {
    calculateModelTotal(modelId);
    calculateEventTotal();
  });
}

function removeModel(modelId) {
  const modelElement = document.getElementById(modelId);
  modelElement.remove();
  calculateEventTotal();
}

function calculateModelTotal(modelId) {
  const modelElement = document.getElementById(modelId);
  const cache =
    parseFloat(modelElement.querySelector(".model-cache").value) || 0;
  const days = parseFloat(modelElement.querySelector(".model-days").value) || 0;
  const total = cache * days;

  modelElement.querySelector(".model-total").value = formatCurrency(total);
}

function calculateEventTotal() {
  const companyElements = document.querySelectorAll(".company-item");
  let total = 0;

  companyElements.forEach((company) => {
    const modelElements = company.querySelectorAll(".model-item");
    modelElements.forEach((model) => {
      const cache = parseFloat(model.querySelector(".model-cache").value) || 0;
      const days = parseFloat(model.querySelector(".model-days").value) || 0;
      total += cache * days;
    });
  });

  document.getElementById("totalValue").value = formatCurrency(total);
}

function showPreview() {
  const eventName = document.getElementById("eventName").value;

  if (!eventName) {
    showToast("Preencha o nome do evento!");
    return;
  }

  const companies = [];
  const companyElements = document.querySelectorAll(".company-item");

  companyElements.forEach((company) => {
    const companyName = company.querySelector(".company-name").value;
    const startDate = company.querySelector(".company-start-date").value;
    const endDate = company.querySelector(".company-end-date").value;

    if (!companyName || !startDate || !endDate) return;

    const models = [];
    const modelElements = company.querySelectorAll(".model-item");

    modelElements.forEach((model) => {
      const name = model.querySelector(".model-name").value;
      const pix = model.querySelector(".model-pix").value;
      const cache = parseFloat(model.querySelector(".model-cache").value) || 0;
      const days = parseFloat(model.querySelector(".model-days").value) || 0;
      const total = cache * days;
      const paymentStatus = model.querySelector(".model-payment-status").value;
      const observations =
        model.querySelector(".model-observations").value || "";

      if (name && pix && cache > 0 && days > 0) {
        models.push({
          name,
          pix,
          cache,
          days,
          total,
          paymentStatus,
          observations,
        });
      }
    });

    if (models.length > 0) {
      companies.push({ name: companyName, startDate, endDate, models });
    }
  });

  if (companies.length === 0) {
    showToast("Adicione pelo menos uma empresa com modelos!");
    return;
  }

  // Gerar visualização
  let previewHTML = "";

  // Calcular totais gerais
  let eventTotal = 0;
  const modelTotals = {};

  companies.forEach((company) => {
    let companyTotal = 0;
    const formattedStartDate = formatDate(company.startDate);
    const formattedEndDate = formatDate(company.endDate);
    const dateRange =
      formattedStartDate === formattedEndDate
        ? formattedStartDate
        : `${formattedStartDate} a ${formattedEndDate}`;

    previewHTML += `
                    <div class="company-preview">
                        <div class="company-preview-header">
                            <i class="fas fa-building"></i> ${company.name} - ${dateRange}
                        </div>
                        <div class="company-models">
                            <table class="payments-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Chave PIX</th>
                                        <th>Cachê</th>
                                        <th>Diárias</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;

    company.models.forEach((model) => {
      const statusClass =
        model.paymentStatus === "paid" ? "status-paid" : "status-pending";
      const statusText = model.paymentStatus === "paid" ? "Pago" : "Pendente";

      previewHTML += `
                        <tr>
                            <td>${model.name}</td>
                            <td>${model.pix}</td>
                            <td>${formatCurrency(model.cache)}</td>
                            <td>${model.days}</td>
                            <td>${formatCurrency(model.total)}</td>
                            <td class="${statusClass}">${statusText}</td>
                        </tr>
                    `;

      // Acumular totais
      companyTotal += model.total;
      eventTotal += model.total;

      if (!modelTotals[model.name]) {
        modelTotals[model.name] = {
          name: model.name,
          pix: model.pix,
          total: 0,
        };
      }
      modelTotals[model.name].total += model.total;
    });

    previewHTML += `
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="4" style="text-align: right">Total da Empresa</td>
                                        <td>${formatCurrency(companyTotal)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                `;
  });

  // Adicionar tabela consolidada
  previewHTML += `
                <div class="excel-preview">
                    <table class="excel-table">
                        <thead>
                            <tr>
                                <td class="excel-header" colspan="9">PAGAMENTO MISS_EVENTOS- MODELOS</td>
                            </tr>
                            <tr>
                                <td class="excel-header">Cliente</td>
                                <td class="excel-header">Nome</td>
                                <td class="excel-header">Ação</td>
                                <td class="excel-header">Chave PIX</td>
                                <td class="excel-header">Data</td>
                                <td class="excel-header">Cachê</td>
                                <td class="excel-header">Diária</td>
                                <td class="excel-header">Total</td>
                                <td class="excel-header">Status</td>
                            </tr>
                        </thead>
                        <tbody>
            `;

  companies.forEach((company) => {
    const formattedStartDate = formatDate(company.startDate);
    company.models.forEach((model) => {
      const statusText = model.paymentStatus === "paid" ? "Pago" : "Pendente";
      previewHTML += `
                        <tr>
                            <td>${company.name}</td>
                            <td>${model.name}</td>
                            <td>${eventName}</td>
                            <td>${model.pix}</td>
                            <td>${formattedStartDate}</td>
                            <td>${formatCurrency(model.cache)}</td>
                            <td>${model.days}</td>
                            <td>${formatCurrency(model.total)}</td>
                            <td>${statusText}</td>
                        </tr>
                    `;
    });
  });

  // Adicionar linhas em branco como no exemplo
  for (let i = 0; i < 3; i++) {
    previewHTML += `
                    <tr>
                        <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                        <td>${formatCurrency(0)}</td><td></td>
                    </tr>
                `;
  }

  // Adicionar seção de totais por modelo
  previewHTML += `
                        </tbody>
                    </table>
                    
                    <table class="excel-table" style="margin-top: 20px;">
                        <thead>
                            <tr>
                                <td class="excel-section-header" colspan="3">TOTAL- PAGAMENTO</td>
                            </tr>
                        </thead>
                        <tbody>
            `;

  Object.values(modelTotals).forEach((model) => {
    previewHTML += `
                    <tr>
                        <td>Nome: ${model.name}</td>
                        <td>Chave PIX: ${model.pix}</td>
                        <td>Total: ${formatCurrency(model.total)}</td>
                    </tr>
                `;
  });

  // Adicionar total geral do evento
  previewHTML += `
                        </tbody>
                    </table>
                    
                    <div class="total-section">
                        TOTAL GERAL DO EVENTO: ${formatCurrency(eventTotal)}
                    </div>
                </div>
            `;

  document.getElementById("previewContent").innerHTML = previewHTML;
  document.getElementById("previewContainer").classList.add("active");

  // Scroll to preview
  document
    .getElementById("previewContainer")
    .scrollIntoView({ behavior: "smooth" });
}

// ========================================
// FUNÇÃO EXCEL COM EXCELJS CORRIGIDA! 🔥
// ========================================
async function generateExcel() {
  const eventName = document.getElementById("eventName").value;

  if (!eventName.trim()) {
    showToast("Nome do evento é obrigatório");
    return;
  }

  // Coletar dados
  const companies = [];
  const companyElements = document.querySelectorAll(".company-item");

  companyElements.forEach((company) => {
    const companyName = company.querySelector(".company-name").value;
    const startDate = company.querySelector(".company-start-date").value;
    const endDate = company.querySelector(".company-end-date").value;

    if (!companyName || !startDate || !endDate) return;

    const models = [];
    const modelElements = company.querySelectorAll(".model-item");

    modelElements.forEach((model) => {
      const name = model.querySelector(".model-name").value;
      const pix = model.querySelector(".model-pix").value;
      const cache = parseFloat(model.querySelector(".model-cache").value) || 0;
      const days = parseFloat(model.querySelector(".model-days").value) || 0;
      const total = cache * days;
      const paymentStatus = model.querySelector(".model-payment-status").value;
      const observations =
        model.querySelector(".model-observations").value || "";

      if (name && pix && cache > 0 && days > 0) {
        models.push({
          name,
          pix,
          cache,
          days,
          total,
          paymentStatus,
          observations,
        });
      }
    });

    if (models.length > 0) {
      companies.push({ name: companyName, startDate, endDate, models });
    }
  });

  if (companies.length === 0) {
    showToast("Nenhum dado válido encontrado");
    return;
  }

  try {
    // Criar workbook com ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Miss Eventos - Dinâmico");

    // Horário brasileiro
    const now = new Date();
    const horarioBrasil =
      now.toLocaleDateString("pt-BR") +
      " às " +
      now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Configurar colunas
    worksheet.columns = [
      { header: "Cliente", key: "cliente", width: 18 },
      { header: "Ação", key: "acao", width: 40 },
      { header: "Data", key: "data", width: 14 },
      { header: "Diária", key: "diaria", width: 10 },
      { header: "Nome do Modelo", key: "nome", width: 28 },
      { header: "Chave PIX", key: "pix", width: 35 },
      { header: "Cachê", key: "cache", width: 14 },
      { header: "Total", key: "total", width: 14 },
      { header: "STATUS ▼", key: "status", width: 18 },
    ];

    // Título principal
    worksheet.mergeCells("A1:I3");
    worksheet.getCell("A1").value = "MISS EVENTOS - RESUMO DINÂMICO";
    worksheet.getCell("A1").font = {
      size: 18,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    worksheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF000000" },
    };
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").border = {
      top: { style: "thick", color: { argb: "FFFFBE0B" } },
      left: { style: "thick", color: { argb: "FFFFBE0B" } },
      bottom: { style: "thick", color: { argb: "FFFFBE0B" } },
      right: { style: "thick", color: { argb: "FFFFBE0B" } },
    };

    // Subtítulo
    worksheet.mergeCells("A4:I4");
    worksheet.getCell("A4").value = "📊 RESUMO SE ATUALIZA AUTOMATICAMENTE!";
    worksheet.getCell("A4").font = {
      size: 14,
      bold: true,
      color: { argb: "FFFFBE0B" },
    };
    worksheet.getCell("A4").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2C2C2C" },
    };
    worksheet.getCell("A4").alignment = {
      horizontal: "left",
      vertical: "center",
    };

    // Headers da tabela (linha 6)
    const headerRow = worksheet.getRow(6);
    headerRow.values = [
      "Cliente",
      "Ação",
      "Data",
      "Diária",
      "Nome do Modelo",
      "Chave PIX",
      "Cachê",
      "Total",
      "STATUS ▼",
      "Observações",
    ];
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.font = { size: 12, bold: true, color: { argb: "FF000000" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFBE0B" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFFFFFFF" } },
        left: { style: "thin", color: { argb: "FFFFFFFF" } },
        bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
        right: { style: "thin", color: { argb: "FFFFFFFF" } },
      };
    });

    // Adicionar dados
    let currentRow = 7;
    const dataStartRow = currentRow;

    companies.forEach((company) => {
      const formattedStartDate = formatDate(company.startDate);
      company.models.forEach((model) => {
        const row = worksheet.getRow(currentRow);
        const statusText = model.paymentStatus === "paid" ? "PAGO" : "PENDENTE";

        row.values = [
          company.name,
          eventName,
          formattedStartDate,
          model.days,
          model.name,
          model.pix,
          model.cache,
          model.total,
          statusText,
          model.observations || "",
        ];

        row.height = 20;

        // Estilo das células de dados
        row.eachCell((cell, colNumber) => {
          cell.font = { size: 10, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1A1A1A" },
          };
          cell.alignment = { horizontal: "left", vertical: "center" };
          cell.border = {
            top: { style: "thin", color: { argb: "FF444444" } },
            left: { style: "thin", color: { argb: "FF444444" } },
            bottom: { style: "thin", color: { argb: "FF444444" } },
            right: { style: "thin", color: { argb: "FF444444" } },
          };

          // Formatação especial para valores monetários
          if (colNumber === 7 || colNumber === 8) {
            cell.numFmt = '"R$ "#,##0.00';
          }
        });

        // Formatação especial para status
        const statusCell = row.getCell(9);
        statusCell.font = { size: 11, bold: true, color: { argb: "FF121010" } }; // Preto quase puro para leitura
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFBE0B" },
        }; // Amarelo ffbe0b para todas
        statusCell.alignment = { horizontal: "center", vertical: "middle" };

        // Adicionar validação de dados (dropdown)
        statusCell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: ['"PAGO,PENDENTE"'],
          showErrorMessage: true,
          errorTitle: "Status Inválido",
          error: "Use apenas: PAGO ou PENDENTE",
        };

        currentRow++;
      });
    });

    const dataEndRow = currentRow - 1;

    // Seção de resumo
    currentRow += 2;
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "📊 RESUMO AUTOMÁTICO (SE ATUALIZA SOZINHO!)";
    worksheet.getCell(`A${currentRow}`).font = {
      size: 14,
      bold: true,
      color: { argb: "FFFFBE0B" },
    };
    worksheet.getCell(`A${currentRow}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2C2C2C" },
    };
    worksheet.getCell(`A${currentRow}`).alignment = {
      horizontal: "left",
      vertical: "center",
    };

    currentRow += 2;

    // Fórmulas dinâmicas
    const formulaRows = [
      {
        label: "💚 TOTAL PAGO:",
        formula: `SUMIF(I${dataStartRow}:I${dataEndRow},"PAGO",H${dataStartRow}:H${dataEndRow})`,
        color: "FF28A745",
      },
      {
        label: "🔴 TOTAL PENDENTE:",
        formula: `SUMIF(I${dataStartRow}:I${dataEndRow},"PENDENTE",H${dataStartRow}:H${dataEndRow})`,
        color: "FFDC3545",
      },
      {
        label: "💰 TOTAL GERAL:",
        formula: `SUM(H${dataStartRow}:H${dataEndRow})`,
        color: "FFFFBE0B",
      },
    ];

    formulaRows.forEach((item) => {
      const labelCell = worksheet.getCell(`A${currentRow}`);
      const valueCell = worksheet.getCell(`B${currentRow}`);

      labelCell.value = item.label;
      labelCell.font = { size: 12, bold: true, color: { argb: item.color } };

      valueCell.value = { formula: item.formula };
      valueCell.font = { size: 12, bold: true, color: { argb: item.color } };
      valueCell.numFmt = '"R$ "#,##0.00';

      currentRow++;
    });

    // Instruções
    currentRow += 2;
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "🎯 COMO USAR: Clique na setinha ▼ da coluna STATUS e escolha!";
    worksheet.getCell(`A${currentRow}`).font = {
      size: 14,
      bold: true,
      color: { argb: "FFFFBE0B" },
    };
    worksheet.getCell(`A${currentRow}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2C2C2C" },
    };

    currentRow++;
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value =
      "⚡ O RESUMO SE ATUALIZA AUTOMATICAMENTE quando você muda o status!";
    worksheet.getCell(`A${currentRow}`).font = {
      size: 11,
      bold: true,
      color: { argb: "FFFFBE0B" },
    };
    worksheet.getCell(`A${currentRow}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A1A1A" },
    };
    worksheet.getCell(`A${currentRow}`).alignment = {
      horizontal: "center",
      vertical: "center",
    };

    // Footer
    currentRow += 3;
    worksheet.getCell(
      `A${currentRow}`
    ).value = `⚡ Criado em: ${horarioBrasil} (Horário do Brasil) - Miss Eventos ⚡`;
    worksheet.getCell(`A${currentRow}`).font = {
      size: 9,
      italic: true,
      color: { argb: "FF888888" },
    };

    // Salvar arquivo usando download nativo (SEM FileSaver)
    const fileName = `${eventName.replace(
      /[/\\?%*:|"<>]/g,
      ""
    )}-Dinamico-${horarioBrasil.split(" ")[0].replace(/\//g, "-")}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();

    // Download nativo sem FileSaver
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast("✨ Excel dinâmico criado com formatação completa!");
  } catch (error) {
    console.error("Erro ao gerar Excel:", error);
    showToast("❌ Erro ao gerar Excel: " + error.message);
  }
}

// ========================================
// FUNÇÃO PDF CORRIGIDA! 🔥
// ========================================
function generatePDF() {
  const eventName = document.getElementById("eventName").value;

  if (!eventName.trim()) {
    showToast("Nome do evento é obrigatório");
    return;
  }

  // Coletar dados
  const companies = [];
  const companyElements = document.querySelectorAll(".company-item");

  companyElements.forEach((company) => {
    const companyName = company.querySelector(".company-name").value;
    const startDate = company.querySelector(".company-start-date").value;
    const endDate = company.querySelector(".company-end-date").value;

    if (!companyName || !startDate || !endDate) return;

    const models = [];
    const modelElements = company.querySelectorAll(".model-item");

    modelElements.forEach((model) => {
      const name = model.querySelector(".model-name").value;
      const pix = model.querySelector(".model-pix").value;
      const cache = parseFloat(model.querySelector(".model-cache").value) || 0;
      const days = parseFloat(model.querySelector(".model-days").value) || 0;
      const total = cache * days;
      const paymentStatus = model.querySelector(".model-payment-status").value;
      const observations =
        model.querySelector(".model-observations").value || "";

      if (name && pix && cache > 0 && days > 0) {
        models.push({
          name,
          pix,
          cache,
          days,
          total,
          paymentStatus,
          observations,
        });
      }
    });

    if (models.length > 0) {
      companies.push({ name: companyName, startDate, endDate, models });
    }
  });

  if (companies.length === 0) {
    showToast("Nenhum dado válido encontrado");
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Horário brasileiro
    const now = new Date();
    const horarioBrasil =
      now.toLocaleDateString("pt-BR") +
      " às " +
      now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Título
    doc.setFontSize(20);
    doc.setTextColor(255, 190, 11);
    doc.text("MISS EVENTOS - RELATÓRIO", 20, 30);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Evento: ${eventName}`, 20, 45);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Gerado em: ${horarioBrasil}`, 20, 55);

    let yPosition = 70;

    companies.forEach((company) => {
      // Título da empresa
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Empresa: ${company.name}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(
        `Período: ${formatDate(company.startDate)} a ${formatDate(
          company.endDate
        )}`,
        20,
        yPosition
      );
      yPosition += 15;

      // Cabeçalho da tabela
      doc.setFillColor(255, 190, 11);
      doc.rect(20, yPosition - 5, 170, 8, "F");

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("Modelo", 25, yPosition);
      doc.text("PIX", 80, yPosition);
      doc.text("Cachê", 130, yPosition);
      doc.text("Total", 150, yPosition);
      doc.text("Status", 170, yPosition);
      yPosition += 10;

      // Dados dos modelos
      company.models.forEach((model) => {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 30;
        }

        doc.setTextColor(0, 0, 0);
        doc.text(model.name, 25, yPosition);
        doc.text(model.pix.substring(0, 20), 80, yPosition);
        doc.text(`R$ ${model.cache.toFixed(2)}`, 130, yPosition);
        doc.text(`R$ ${model.total.toFixed(2)}`, 150, yPosition);

        // Status com cor
        if (model.paymentStatus === "paid") {
          doc.setTextColor(40, 167, 69);
          doc.text("PAGO", 170, yPosition);
        } else {
          doc.setTextColor(220, 53, 69);
          doc.text("PENDENTE", 170, yPosition);
        }

        yPosition += 8;
      });

      yPosition += 10;
    });

    // Calcular totais
    let totalPago = 0;
    let totalPendente = 0;

    companies.forEach((company) => {
      company.models.forEach((model) => {
        if (model.paymentStatus === "paid") {
          totalPago += model.total;
        } else {
          totalPendente += model.total;
        }
      });
    });

    // Resumo final
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 30;
    }

    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("RESUMO FINANCEIRO:", 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setTextColor(40, 167, 69);
    doc.text(`Total Pago: R$ ${totalPago.toFixed(2)}`, 20, yPosition);
    yPosition += 10;

    doc.setTextColor(220, 53, 69);
    doc.text(`Total Pendente: R$ ${totalPendente.toFixed(2)}`, 20, yPosition);
    yPosition += 10;

    doc.setTextColor(255, 190, 11);
    doc.text(
      `Total Geral: R$ ${(totalPago + totalPendente).toFixed(2)}`,
      20,
      yPosition
    );

    // Salvar PDF
    const fileName = `${eventName.replace(
      /[/\\?%*:|"<>]/g,
      ""
    )}-Relatorio-${horarioBrasil.split(" ")[0].replace(/\//g, "-")}.pdf`;
    doc.save(fileName);

    showToast("✨ PDF gerado com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    showToast("❌ Erro ao gerar PDF: " + error.message);
  }
}

// ========================================
// FUNCIONALIDADE REGISTROS SALVOS! 🔥
// ========================================
function saveCurrentEvent() {
  const eventName = document.getElementById("eventName").value;

  if (!eventName) {
    showToast("Preencha o nome do evento!");
    return;
  }

  const companies = [];
  const companyElements = document.querySelectorAll(".company-item");

  companyElements.forEach((company) => {
    const companyName = company.querySelector(".company-name").value;
    const startDate = company.querySelector(".company-start-date").value;
    const endDate = company.querySelector(".company-end-date").value;

    if (!companyName || !startDate || !endDate) return;

    const models = [];
    const modelElements = company.querySelectorAll(".model-item");

    modelElements.forEach((model) => {
      const name = model.querySelector(".model-name").value;
      const pix = model.querySelector(".model-pix").value;
      const cache = parseFloat(model.querySelector(".model-cache").value) || 0;
      const days = parseFloat(model.querySelector(".model-days").value) || 0;
      const total = cache * days;
      const paymentStatus = model.querySelector(".model-payment-status").value;
      const observations =
        model.querySelector(".model-observations").value || "";

      if (name && pix && cache > 0 && days > 0) {
        models.push({
          name,
          pix,
          cache,
          days,
          total,
          paymentStatus,
          observations,
        });
      }
    });

    if (models.length > 0) {
      companies.push({ name: companyName, startDate, endDate, models });
    }
  });

  if (companies.length === 0) {
    showToast("Adicione pelo menos uma empresa com modelos!");
    return;
  }

  const eventData = {
    eventName,
    companies,
    timestamp: new Date().toISOString(),
  };

  // Salvar no localStorage
  let savedEvents = JSON.parse(localStorage.getItem("paymentEvents")) || [];
  savedEvents.push(eventData);
  localStorage.setItem("paymentEvents", JSON.stringify(savedEvents));

  showToast("Evento salvo com sucesso!");
}

function viewSavedEvents() {
  const savedEvents = JSON.parse(localStorage.getItem("paymentEvents")) || [];

  if (savedEvents.length === 0) {
    showToast("Nenhum evento salvo encontrado!");
    return;
  }

  let eventsHTML = "";

  savedEvents.forEach((event, index) => {
    let total = 0;
    let totalModels = 0;
    let dateInfo = "";

    if (event.companies && event.companies.length > 0) {
      if (event.companies.length === 1) {
        const company = event.companies[0];
        const startDate = formatDate(company.startDate);
        const endDate = formatDate(company.endDate);
        dateInfo =
          startDate === endDate ? startDate : `${startDate} a ${endDate}`;
      } else {
        dateInfo = `${event.companies.length} empresas`;
      }

      event.companies.forEach((company) => {
        if (company.models && company.models.length > 0) {
          company.models.forEach((model) => {
            total += model.total;
            totalModels++;
          });
        }
      });
    }

    eventsHTML += `
                    <div class="event-item">
                        <div class="event-header">
                            <div>
                                <strong>${event.eventName}</strong>
                                <div class="event-date">${dateInfo}</div>
                            </div>
                            <div>
                                <strong>${formatCurrency(total)}</strong>
                            </div>
                        </div>
                        <div class="event-details">
                            <p><strong>Modelos:</strong> ${totalModels}</p>
                        </div>
                        <div class="event-actions">
                            <button class="btn btn-primary btn-small" onclick="loadEvent(${index})">
                                <i class="fas fa-edit"></i> Carregar
                            </button>
                            <button class="btn btn-danger btn-small" onclick="deleteEvent(${index})">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                `;
  });

  document.getElementById("savedEventsList").innerHTML = eventsHTML;
  document.getElementById("eventsModal").classList.add("active");
}

function loadEvent(index) {
  const savedEvents = JSON.parse(localStorage.getItem("paymentEvents")) || [];
  const event = savedEvents[index];

  if (!event || !event.companies) return;

  // Preencher formulário
  document.getElementById("eventName").value = event.eventName;

  // Limpar empresas existentes
  document.getElementById("companiesList").innerHTML = "";
  companyCounter = 0;

  // Adicionar empresas e modelos
  event.companies.forEach((company) => {
    addCompany();

    const lastCompany = document.querySelector(".company-item:last-child");
    lastCompany.querySelector(".company-name").value = company.name;
    lastCompany.querySelector(".company-start-date").value = company.startDate;
    lastCompany.querySelector(".company-end-date").value = company.endDate;

    // Limpar modelos existentes na empresa
    const modelsList = lastCompany.querySelector(".models-list");
    modelsList.innerHTML = "";

    // Adicionar modelos
    company.models.forEach((model) => {
      addModelToCompany(lastCompany.id);

      const lastModel = modelsList.querySelector(".model-item:last-child");
      lastModel.querySelector(".model-name").value = model.name;
      lastModel.querySelector(".model-pix").value = model.pix;
      lastModel.querySelector(".model-cache").value = model.cache;
      lastModel.querySelector(".model-days").value = model.days;
      lastModel.querySelector(".model-payment-status").value =
        model.paymentStatus;

      calculateModelTotal(lastModel.id);
    });
  });

  calculateEventTotal();
  closeEventsModal();
  showToast("Evento carregado com sucesso!");
}

function deleteEvent(index) {
  if (confirm("Tem certeza que deseja excluir este evento?")) {
    let savedEvents = JSON.parse(localStorage.getItem("paymentEvents")) || [];
    savedEvents.splice(index, 1);
    localStorage.setItem("paymentEvents", JSON.stringify(savedEvents));
    viewSavedEvents(); // Atualizar lista
    showToast("Evento excluído com sucesso!");
  }
}

function closeEventsModal() {
  document.getElementById("eventsModal").classList.remove("active");
}

function hidePreview() {
  document.getElementById("previewContainer").classList.remove("active");
}

function clearForm() {
  if (confirm("Tem certeza que deseja limpar todos os dados do formulário?")) {
    document.getElementById("paymentForm").reset();
    document.getElementById("companiesList").innerHTML = "";
    companyCounter = 0;
    addCompany();
    calculateEventTotal();
    hidePreview();
    showToast("Formulário limpo com sucesso!");
  }
}

function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById("themeIcon");

  if (body.classList.contains("light-mode")) {
    body.classList.remove("light-mode");
    themeIcon.className = "fas fa-moon";
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.add("light-mode");
    themeIcon.className = "fas fa-sun";
    localStorage.setItem("theme", "light");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Inicializar com uma empresa
addCompany();
