const DAY = 86400000;
const days = (a, b) => (a && b) ? Math.round((new Date(b) - new Date(a)) / DAY) : null;

const STEPS = [
  { key: "fb", label: "Filed → Biometrics", from: "filed",     to: "bio" },
  { key: "bi", label: "Biometrics → Interview", from: "bio",   to: "interview" },
  { key: "fi", label: "Filed → Interview", from: "filed",      to: "interview" },
  { key: "ia", label: "Interview → Approval", from: "interview", to: "approval" },
  { key: "ac", label: "Approval → Card in hand", from: "approval", to: "card" },
  { key: "tot", label: "TOTAL: Filed → Approval", from: "filed", to: "approval" },
];

const fmt = d => d == null ? "—" : d;
const mean = a => a.length ? Math.round(a.reduce((s,x)=>s+x,0)/a.length) : null;
const median = a => {
  if (!a.length) return null;
  const s = [...a].sort((x,y)=>x-y), m = Math.floor(s.length/2);
  return s.length % 2 ? s[m] : Math.round((s[m-1]+s[m])/2);
};

function render() {
  const includeRfe = document.getElementById("includeRfe").checked;
  const pool = DATA.filter(d => !d.outlier && (includeRfe || !d.rfe));

  const stepBody = document.getElementById("stepBody");
  stepBody.innerHTML = "";
  STEPS.forEach(step => {
    const vals = pool.map(d => days(d[step.from], d[step.to])).filter(v => v != null);
    const tr = document.createElement("tr");
    const isTotal = step.key === "tot";
    tr.innerHTML = `
      <td>${isTotal ? "<strong>"+step.label+"</strong>" : step.label}</td>
      <td class="num ${isTotal ? "big" : ""}">${fmt(mean(vals))}</td>
      <td class="num">${fmt(median(vals))}</td>
      <td class="num">${vals.length ? Math.min(...vals) : "—"}</td>
      <td class="num">${vals.length ? Math.max(...vals) : "—"}</td>
      <td class="num n">${vals.length}</td>`;
    stepBody.appendChild(tr);
  });

  document.getElementById("sampleNote").textContent =
    `${pool.length} cases in averages` + (includeRfe ? " (RFE included)" : " (clean cases only)");

  const allDates = pool.flatMap(d => [d.filed, d.bio, d.interview, d.approval, d.card])
    .filter(Boolean).sort();
  document.getElementById("dateRange").textContent =
    allDates.length ? `data spans ${allDates[0]} → ${allDates[allDates.length - 1]}` : "";

  const rawBody = document.getElementById("rawBody");
  rawBody.innerHTML = "";
  DATA.forEach(d => {
    const tot = days(d.filed, d.approval);
    const tr = document.createElement("tr");
    if (d.rfe) tr.className = "rfe-row";
    const cell = v => v ? v : '<span class="miss">—</span>';
    tr.innerHTML = `
      <td>${d.name}${d.outlier ? " <span class='n'>(outlier, excl.)</span>" : ""}</td>
      <td>${cell(d.filed)}</td>
      <td>${cell(d.bio)}</td>
      <td>${cell(d.interview)}</td>
      <td>${cell(d.approval)}</td>
      <td>${cell(d.card)}</td>
      <td class="num">${fmt(tot)}</td>
      <td>${d.rfe ? "yes" : ""}</td>`;
    rawBody.appendChild(tr);
  });
  document.getElementById("rawCount").textContent = DATA.length;
}

document.getElementById("includeRfe").addEventListener("change", render);
render();
