const serverSeed = [
  ["sp-app-001", "10.20.1.11", "A-01", "online", 42, 68], ["sp-app-002", "10.20.1.12", "A-01", "online", 57, 74],
  ["sp-api-003", "10.20.1.13", "A-01", "online", 63, 61], ["sp-api-004", "10.20.1.14", "A-01", "online", 38, 55],
  ["sp-db-005", "10.20.1.15", "A-01", "online", 71, 82], ["sp-db-006", "10.20.1.16", "A-01", "offline", 0, 0],
  ["sp-cache-007", "10.20.1.17", "A-01", "online", 49, 44], ["sp-cache-008", "10.20.1.18", "A-02", "online", 35, 52],
  ["sp-web-009", "10.20.1.19", "A-02", "online", 61, 70], ["sp-web-010", "10.20.1.20", "A-02", "online", 54, 66],
  ["sp-batch-011", "10.20.1.21", "A-02", "offline", 0, 0], ["sp-auth-012", "10.20.1.22", "A-02", "maintenance", 0, 0],
  ["sp-files-013", "10.20.1.23", "A-02", "maintenance", 0, 0], ["sp-files-014", "10.20.1.24", "B-01", "maintenance", 0, 0],
  ["sp-proxy-015", "10.20.1.25", "B-01", "online", 76, 59], ["sp-proxy-016", "10.20.1.26", "B-01", "offline", 0, 0],
  ["sp-queue-017", "10.20.1.27", "B-01", "maintenance", 0, 0], ["sp-queue-018", "10.20.1.28", "B-01", "offline", 0, 0],
  ["sp-mon-019", "10.20.1.29", "B-01", "maintenance", 0, 0], ["sp-backup-020", "10.20.1.30", "B-01", "offline", 0, 0]
];
const servers = serverSeed.map(([name, ip, rack, status, cpu, memory], index) => ({ id: index + 1, name, ip, rack, status, cpu, memory }));
const alerts = [
  { id: 1, severity: "critical", title: "Temperatura acima do limite", target: "sp-db-005 · Rack A-01", age: "2 min", state: "active", time: "10:42:18" },
  { id: 2, severity: "critical", title: "Servidor sem resposta", target: "sp-batch-011 · Rack A-02", age: "8 min", state: "active", time: "10:36:04" },
  { id: 3, severity: "warning", title: "Uso de CPU elevado", target: "sp-proxy-015 · Rack B-01", age: "14 min", state: "active", time: "10:29:41" },
  { id: 4, severity: "warning", title: "Capacidade de memória em atenção", target: "sp-db-005 · Rack A-01", age: "27 min", state: "active", time: "10:16:22" },
  { id: 5, severity: "warning", title: "Espaço em disco abaixo de 20%", target: "sp-files-013 · Rack A-02", age: "41 min", state: "active", time: "10:02:13" },
  { id: 6, severity: "info", title: "Janela de manutenção programada", target: "sp-queue-017 · Rack B-01", age: "1 h", state: "active", time: "09:44:57" }
];
const resourceData = [
  { key: "ram", label: "Memória RAM", value: 73, icon: "memory-stick", color: "#21845c" },
  { key: "storage", label: "Armazenamento", value: 38, icon: "database", color: "#d4544a" },
  { key: "memory", label: "Memória em uso", value: 60, icon: "cpu", color: "#d1a21f" },
  { key: "disk", label: "Uso de disco", value: 47, icon: "hard-drive", color: "#d4544a" }
];
const metricSamples = {
  cpu: [44, 51, 46, 58, 54, 62, 49, 56, 61, 58, 69, 63, 55, 64, 72, 66, 59, 71, 75, 68, 63, 77, 69, 77],
  memory: [57, 59, 58, 61, 60, 63, 62, 65, 61, 64, 66, 65, 62, 67, 69, 66, 68, 70, 67, 69, 71, 70, 72, 73],
  network: [25, 32, 29, 37, 33, 42, 38, 48, 44, 39, 52, 47, 41, 55, 62, 50, 46, 59, 54, 63, 57, 69, 65, 61]
};
const state = { view: "overview", live: true, dark: false, metric: "cpu", period: "7d", sortAscending: true, nextServerId: 21, acknowledged: 0 };
let performanceChart;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const statusLabels = { online: "Online", offline: "Offline", maintenance: "Manutenção" };
const severityLabels = { critical: "Crítico", warning: "Atenção", info: "Informativo" };

function icon(name, className = "") { return `<i data-lucide="${name}"${className ? ` class="${className}"` : ""}></i>`; }
function drawIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } }); }
function toast(message, type = "success") {
  const item = document.createElement("div"); item.className = `toast${type === "error" ? " toast-error" : ""}`;
  item.innerHTML = `${icon(type === "error" ? "circle-alert" : "circle-check")}<span>${message}</span>`;
  $("#toast-region").append(item); drawIcons(); window.setTimeout(() => item.remove(), 3200);
}
function countByStatus(status) { return servers.filter(server => server.status === status).length; }
function activeAlerts() { return alerts.filter(alert => alert.state === "active"); }
function severityIcon(severity) { return severity === "critical" ? "octagon-alert" : severity === "warning" ? "triangle-alert" : "info"; }
function percent(value) { return `${Math.round(value)}%`; }

function renderSummary() {
  const online = countByStatus("online"); const offline = countByStatus("offline"); const maintenance = countByStatus("maintenance"); const active = activeAlerts();
  $("#online-value").innerHTML = `${online}<span class="stat-unit">/ ${servers.length}</span>`;
  $("#total-value").textContent = servers.length; $("#offline-value").textContent = offline;
  $("#alert-value").textContent = active.length; $("#critical-value").textContent = `${active.filter(a => a.severity === "critical").length} críticos`;
  $("#nav-server-count").textContent = servers.length; $("#nav-alert-count").textContent = active.length;
  $("#recent-alert-count").textContent = active.length; $("#health-online").textContent = online;
  $("#health-offline").textContent = offline; $("#health-maintenance").textContent = maintenance;
  $("#fleet-health-percent").textContent = percent(servers.length ? online / servers.length * 100 : 0);
  $("#stack-online").style.width = `${online / servers.length * 100}%`;
  $("#stack-maintenance").style.width = `${maintenance / servers.length * 100}%`;
  $("#stack-offline").style.width = `${offline / servers.length * 100}%`;
  $("#notification-dot").hidden = !active.length;
  const counts = { critical: 0, warning: 0, info: 0 };
  active.forEach(alert => counts[alert.severity]++);
  $("#alerts-critical-count").textContent = counts.critical;
  $("#alerts-warning-count").textContent = counts.warning;
  $("#alerts-info-count").textContent = counts.info;
  $("#alerts-resolved-count").textContent = state.acknowledged;
}

function resourceMarkup(resource) {
  return `<div class="resource-row"><span class="resource-icon">${icon(resource.icon)}</span><div class="resource-main"><div class="resource-label-row"><span>${resource.label}</span><strong>${percent(resource.value)}</strong></div><div class="resource-track"><span style="width:${resource.value}%;--resource-color:${resource.color}"></span></div></div></div>`;
}
function renderResources() {
  $("#resource-list").innerHTML = resourceData.map(resourceMarkup).join("");
  $("#infra-resource-list").innerHTML = resourceData.map(resourceMarkup).join("");
  drawIcons();
}

function filteredServers() {
  const query = $("#server-search").value.trim().toLowerCase(); const status = $("#server-status-filter").value; const rack = $("#server-rack-filter").value;
  return servers.filter(server => (!query || `${server.name} ${server.ip} ${server.rack}`.toLowerCase().includes(query)) && (status === "all" || server.status === status) && (rack === "all" || server.rack === rack)).sort((a, b) => (a.name.localeCompare(b.name) * (state.sortAscending ? 1 : -1)));
}
function renderServers() {
  const list = filteredServers();
  $("#server-table-body").innerHTML = list.length ? list.map(server => `<tr><td><span class="server-name"><span class="server-chip">${icon("server")}</span>${server.name}</span></td><td><span class="status-pill status-${server.status}"><span></span>${statusLabels[server.status]}</span></td><td class="mono">${server.ip}</td><td>${server.rack}</td><td class="util-cell"><span>${server.status === "online" ? `${server.cpu}%` : "—"}</span>${server.status === "online" ? `<div class="util-mini"><span style="width:${server.cpu}%;background:${server.cpu > 70 ? "#d0a01e" : "#23865e"}"></span></div>` : ""}</td><td class="util-cell"><span>${server.status === "online" ? `${server.memory}%` : "—"}</span>${server.status === "online" ? `<div class="util-mini"><span style="width:${server.memory}%;background:${server.memory > 75 ? "#d0a01e" : "#23865e"}"></span></div>` : ""}</td><td><button class="row-detail-button" data-server-detail="${server.id}" aria-label="Detalhes de ${server.name}" title="Ver detalhes">${icon("arrow-up-right")}</button></td></tr>`).join("") : `<tr><td class="empty-state" colspan="7">Nenhum servidor corresponde aos filtros.</td></tr>`;
  $("#server-result-count").textContent = `Exibindo ${list.length} de ${servers.length} servidores`;
  drawIcons();
}

function alertRowMarkup(alert, compact = false) {
  const acknowledged = alert.state === "acknowledged";
  if (compact) return `<div class="alert-row"><span class="severity-icon severity-${alert.severity}">${icon(severityIcon(alert.severity))}</span><span class="alert-copy"><strong>${alert.title}</strong><small>${alert.target}</small></span><span class="alert-age">${alert.age}</span><button class="alert-action" data-alert-action="${alert.id}">${acknowledged ? "Reconhecido" : "Reconhecer"}</button></div>`;
  return `<div class="alert-table-row"><div class="alert-table-title"><span class="severity-icon severity-${alert.severity}">${icon(severityIcon(alert.severity))}</span><span><strong>${alert.title}</strong><small>${alert.id.toString().padStart(3, "0")} · ${severityLabels[alert.severity]}</small></span></div><div class="alert-table-cell">${alert.target.split(" · ")[0]}<small>${alert.target.split(" · ")[1] || ""}</small></div><div class="alert-table-cell">${alert.time}<small>Hoje · ${alert.age} atrás</small></div><div class="alert-table-cell">${acknowledged ? `<span class="acknowledged-label">Reconhecido</span>` : `<span class="status-pill status-offline"><span></span>Ativo</span>`}</div><div class="alert-row-actions">${acknowledged ? `<button class="alert-action" data-alert-action="${alert.id}" data-action="reopen">Reabrir</button>` : `<button class="alert-action" data-alert-action="${alert.id}">Reconhecer</button>`}</div></div>`;
}
function renderAlerts() {
  const recent = [...activeAlerts()].slice(0, 4);
  $("#recent-alerts").innerHTML = recent.length ? recent.map(alert => alertRowMarkup(alert, true)).join("") : `<div class="empty-state">Nenhum alerta ativo. Operação tranquila.</div>`;
  const severity = $("#alert-severity-filter").value; const stateFilter = $("#alert-state-filter").value;
  const filtered = alerts.filter(alert => (severity === "all" || alert.severity === severity) && (stateFilter === "all" || alert.state === stateFilter));
  $("#alert-table-list").innerHTML = filtered.length ? filtered.map(alert => alertRowMarkup(alert)).join("") : `<div class="empty-state">Nenhum alerta encontrado para este filtro.</div>`;
  $("#popover-alerts").innerHTML = activeAlerts().slice(0, 3).map(alert => `<div class="popover-alert"><span class="severity-icon severity-${alert.severity}">${icon(severityIcon(alert.severity))}</span><span><strong>${alert.title}</strong><small>${alert.target} · ${alert.age}</small></span></div>`).join("") || `<div class="empty-state">Tudo em ordem por aqui.</div>`;
  renderSummary(); drawIcons();
}

function chartPoints() {
  const source = metricSamples[state.metric]; const length = state.period === "24h" ? 24 : state.period === "30d" ? 30 : 7;
  return Array.from({ length }, (_, index) => {
    const sampleIndex = Math.floor(index * (source.length - 1) / Math.max(length - 1, 1));
    return Math.round(Math.max(5, Math.min(95, source[sampleIndex] + (index === length - 1 ? 0 : Math.sin(index * 1.7) * 4))));
  });
}
function chartLabels(length) {
  if (state.period === "24h") return Array.from({ length }, (_, index) => `${String(index).padStart(2, "0")}:00`);
  if (state.period === "30d") return Array.from({ length }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (length - index - 1));
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
  });
  return ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
}
function chartColors() {
  const styles = getComputedStyle(document.body);
  return {
    line: styles.getPropertyValue(`--chart-${state.metric}`).trim(),
    grid: styles.getPropertyValue("--chart-grid").trim(),
    labels: styles.getPropertyValue("--chart-label").trim(),
    tooltip: styles.getPropertyValue("--chart-tooltip").trim()
  };
}
function drawChart() {
  const canvas = $("#performance-chart");
  if (!canvas || !window.Chart || !canvas.clientWidth) return;
  const values = chartPoints(); const labels = chartLabels(values.length); const colors = chartColors();
  const metricLabel = state.metric === "cpu" ? "Uso médio de CPU" : state.metric === "memory" ? "Uso de memória" : "Utilização de rede";
  const fill = state.metric === "cpu" ? "rgba(33,132,92,.14)" : state.metric === "memory" ? "rgba(208,160,30,.14)" : "rgba(79,120,146,.14)";
  if (!performanceChart) {
    performanceChart = new Chart(canvas, {
      type: "line",
      data: { labels, datasets: [{ label: metricLabel, data: values, borderColor: colors.line, backgroundColor: fill, borderWidth: 2, fill: true, tension: .35, pointRadius: 0, pointHoverRadius: 4, pointHoverBorderWidth: 2, pointHoverBackgroundColor: "#ffffff" }] },
      options: {
        responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: colors.tooltip, titleFont: { family: "DM Mono", size: 9 }, bodyFont: { family: "DM Mono", size: 9 }, padding: 8, displayColors: false, callbacks: { label: context => `${context.dataset.label}: ${context.parsed.y}%` } }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: colors.labels, maxTicksLimit: 7, maxRotation: 0, autoSkip: true, font: { family: "DM Mono", size: 8 } } },
          y: { min: 0, max: 100, ticks: { stepSize: 25, color: colors.labels, padding: 7, font: { family: "DM Mono", size: 8 }, callback: value => `${value}%` }, grid: { color: colors.grid, borderDash: [2, 4] }, border: { display: false } }
        }
      }
    });
  } else {
    performanceChart.data.labels = labels;
    performanceChart.data.datasets[0].data = values;
    performanceChart.data.datasets[0].label = metricLabel;
    performanceChart.data.datasets[0].borderColor = colors.line;
    performanceChart.data.datasets[0].backgroundColor = fill;
    performanceChart.options.plugins.tooltip.backgroundColor = colors.tooltip;
    performanceChart.options.scales.x.ticks.color = colors.labels;
    performanceChart.options.scales.y.ticks.color = colors.labels;
    performanceChart.options.scales.y.grid.color = colors.grid;
    performanceChart.update();
  }
  $("#chart-current").textContent = `${Math.round(values.at(-1))}%`;
  $("#chart-legend-label").textContent = metricLabel;
}
function loadDarkPreference() {
  try { return localStorage.getItem("northstar-dark-mode") === "true"; } catch { return false; }
}
function setDarkMode(enabled, notify = false) {
  state.dark = enabled;
  document.body.dataset.theme = enabled ? "dark" : "light";
  const iconName = enabled ? "sun" : "moon";
  const label = enabled ? "Ativar modo claro" : "Ativar modo escuro";
  $("#theme-toggle").setAttribute("aria-label", label);
  $("#theme-toggle").setAttribute("title", label);
  $("#theme-toggle").innerHTML = icon(iconName);
  $("#settings-theme-toggle").classList.toggle("is-on", enabled);
  $("#settings-theme-toggle").setAttribute("aria-checked", String(enabled));
  try { localStorage.setItem("northstar-dark-mode", String(enabled)); } catch { /* Storage may be unavailable for local files. */ }
  drawIcons();
  if (performanceChart) {
    const colors = chartColors();
    performanceChart.data.datasets[0].borderColor = colors.line;
    performanceChart.options.plugins.tooltip.backgroundColor = colors.tooltip;
    performanceChart.options.scales.x.ticks.color = colors.labels;
    performanceChart.options.scales.y.ticks.color = colors.labels;
    performanceChart.options.scales.y.grid.color = colors.grid;
    performanceChart.update("none");
  }
}

function switchView(view) {
  if (!$(`#view-${view}`)) return;
  state.view = view;
  $$(".view-panel").forEach(panel => { panel.hidden = panel.id !== `view-${view}`; });
  $$(".nav-link").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  const nav = $(`.nav-link[data-view="${view}"]`); $("#breadcrumb-current").textContent = nav?.querySelector("span")?.textContent || (view === "activity" ? "Registro de atividade" : "Configurações");
  $("#notification-popover").hidden = true; $("#sidebar").classList.remove("is-open");
  if (view === "servers") renderServers(); if (view === "alerts") renderAlerts(); if (view === "infrastructure") renderResources(); if (view === "activity") renderActivity();
  if (view === "overview") requestAnimationFrame(drawChart);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderActivity() {
  const records = [
    ["bell-ring", "Alerta crítico detectado", "Temperatura acima do limite em sp-db-005 · gerado automaticamente", "10:42:18"],
    ["refresh-cw", "Métricas atualizadas", "Verificação automática do site SP-01 concluída", "10:40:00"],
    ["server", "Verificação de disponibilidade", "19 de 20 servidores responderam à última sondagem", "10:35:00"],
    ["shield-check", "Integridade do sistema confirmada", "Todos os serviços centrais estão operacionais", "10:30:00"],
    ["user-round", "Sessão iniciada", "Marina Costa acessou a console de operações", "09:14:32"]
  ];
  $("#activity-list").innerHTML = records.map(([glyph, title, description, time]) => `<div class="activity-item"><span class="activity-icon">${icon(glyph)}</span><div><strong>${title}</strong><p>${description}</p></div><time>${time}</time></div>`).join(""); drawIcons();
}

function updateTimestamp() {
  $("#sync-label").textContent = "Atualizado agora";
  $("#footer-time").textContent = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}
function refreshMetrics(manual = false) {
  const nudge = () => Math.round(Math.random() * 4 - 2);
  const cpu = Math.max(30, Math.min(89, Number($("#cpu-value").textContent) + nudge())); $("#cpu-value").textContent = cpu;
  $(".cpu-card .gauge").style.setProperty("--value", cpu); $(".cpu-card .gauge").style.setProperty("--gauge-color", cpu > 80 ? "var(--red)" : "var(--yellow)");
  resourceData.forEach(resource => { resource.value = Math.max(15, Math.min(90, resource.value + nudge())); });
  renderResources(); updateTimestamp(); if (state.view === "overview") drawChart();
  if (manual) toast("Métricas atualizadas com sucesso");
}
function acknowledgeAlert(id, reopen = false) {
  const alert = alerts.find(item => item.id === Number(id)); if (!alert) return;
  if (reopen && alert.state === "acknowledged") { alert.state = "active"; state.acknowledged = Math.max(0, state.acknowledged - 1); toast("Alerta reaberto"); }
  else if (alert.state === "active") { alert.state = "acknowledged"; state.acknowledged++; toast("Alerta reconhecido"); }
  renderAlerts();
}
function exportServers() {
  const rows = [["Servidor", "Status", "Endereco IP", "Rack", "CPU (%)", "Memoria (%)"], ...filteredServers().map(server => [server.name, statusLabels[server.status], server.ip, server.rack, server.status === "online" ? server.cpu : "", server.status === "online" ? server.memory : ""])];
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "servidores-sp-01.csv"; link.click(); URL.revokeObjectURL(url); toast("Inventário exportado em CSV");
}
function detailServer(id) {
  const server = servers.find(item => item.id === Number(id)); if (!server) return;
  toast(`${server.name} · ${statusLabels[server.status]} · ${server.ip}`);
}

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) { switchView(viewButton.dataset.view); return; }
  const card = event.target.closest("[data-card-view]");
  if (card) {
    switchView(card.dataset.cardView);
    if (card.dataset.statusFilter) { $("#server-status-filter").value = card.dataset.statusFilter; renderServers(); }
    return;
  }
  const ack = event.target.closest("[data-alert-action]"); if (ack) { acknowledgeAlert(ack.dataset.alertAction, ack.dataset.action === "reopen"); return; }
  const detail = event.target.closest("[data-server-detail]"); if (detail) { detailServer(detail.dataset.serverDetail); return; }
  const metricButton = event.target.closest("[data-metric]");
  if (metricButton) { state.metric = metricButton.dataset.metric; $$("[data-metric]").forEach(button => button.classList.toggle("active", button === metricButton)); drawChart(); return; }
  if (event.target.closest("#notification-trigger")) { $("#notification-popover").hidden = !$("#notification-popover").hidden; renderAlerts(); return; }
  if (!event.target.closest("#notification-popover")) $("#notification-popover").hidden = true;
});

$("#live-toggle").addEventListener("click", () => {
  state.live = !state.live; $("#live-toggle").classList.toggle("paused", !state.live); $("#live-label").textContent = state.live ? "Tempo real" : "Pausado";
  $("#settings-live-toggle").classList.toggle("is-on", state.live); $("#settings-live-toggle").setAttribute("aria-checked", String(state.live));
  toast(state.live ? "Atualização em tempo real ativada" : "Atualização em tempo real pausada");
});
$("#settings-live-toggle").addEventListener("click", event => { $("#live-toggle").click(); event.currentTarget.setAttribute("aria-checked", String(state.live)); });
$("#theme-toggle").addEventListener("click", () => setDarkMode(!state.dark, true));
$("#settings-theme-toggle").addEventListener("click", () => setDarkMode(!state.dark, true));
$("#refresh-button").addEventListener("click", () => refreshMetrics(true));
$("#alerts-refresh-button").addEventListener("click", () => { renderAlerts(); toast("Alertas atualizados"); });
$("#period-select").addEventListener("change", event => { state.period = event.target.value; drawChart(); });
$("#server-search").addEventListener("input", renderServers);
$("#server-status-filter").addEventListener("change", renderServers);
$("#server-rack-filter").addEventListener("change", renderServers);
$("#alert-severity-filter").addEventListener("change", renderAlerts);
$("#alert-state-filter").addEventListener("change", renderAlerts);
$(".sort-button").addEventListener("click", () => { state.sortAscending = !state.sortAscending; renderServers(); });
$("#export-button").addEventListener("click", exportServers);
$("#add-server-button").addEventListener("click", () => $("#server-dialog").showModal());
$("#server-form").addEventListener("submit", event => {
  event.preventDefault(); const form = event.currentTarget; const values = new FormData(form);
  const name = String(values.get("name")).trim().toLowerCase(); const ip = String(values.get("ip")).trim();
  if (servers.some(server => server.name === name || server.ip === ip)) { toast("Já existe um servidor com esse nome ou IP", "error"); return; }
  servers.unshift({ id: state.nextServerId++, name, ip, rack: values.get("rack"), status: values.get("status"), cpu: values.get("status") === "online" ? 18 : 0, memory: values.get("status") === "online" ? 32 : 0 });
  form.reset(); $("#server-dialog").close(); renderSummary(); renderServers(); toast(`${name} adicionado ao inventário`);
});
$("#ack-all-button").addEventListener("click", () => {
  const unacknowledged = activeAlerts(); unacknowledged.forEach(alert => { alert.state = "acknowledged"; state.acknowledged++; }); renderAlerts(); toast(unacknowledged.length ? `${unacknowledged.length} alertas reconhecidos` : "Não há alertas ativos");
});
$("#mobile-menu").addEventListener("click", () => $("#sidebar").classList.toggle("is-open"));
$("#help-button").addEventListener("click", () => toast("Console de monitoramento · Ambiente demonstrativo"));
$("#profile-button").addEventListener("click", () => toast("Sessão ativa: Marina Costa"));
$("#browser-notifications-button").addEventListener("click", async event => {
  if (!("Notification" in window)) { toast("Notificações do navegador não estão disponíveis", "error"); return; }
  const permission = await Notification.requestPermission();
  if (permission === "granted") { new Notification("Northstar", { body: "Notificações de monitoramento ativadas." }); event.currentTarget.innerHTML = `${icon("check")} Ativadas`; drawIcons(); }
  else toast("Permissão de notificação não concedida", "error");
});
document.addEventListener("keydown", event => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) { event.preventDefault(); switchView("servers"); $("#server-search").focus(); }
  if (event.key === "Escape") { $("#notification-popover").hidden = true; $("#sidebar").classList.remove("is-open"); }
});
window.addEventListener("resize", () => { if (state.view === "overview") drawChart(); });

renderSummary(); renderResources(); renderServers(); renderAlerts(); updateTimestamp(); setDarkMode(loadDarkPreference()); drawIcons();
window.setInterval(() => { if (state.live) refreshMetrics(false); }, 5000);
window.setTimeout(drawChart, 100);