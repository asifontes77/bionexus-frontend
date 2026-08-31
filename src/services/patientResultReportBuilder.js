function replaceAllToken(value, token, replacement) {
  return String(value ?? "").split(token).join(String(replacement ?? ""));
}
function assetUrl(value) {
  const path = String(value ?? "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
  return `/images/${path}`;
}
function approverBlock(template, user) {
  let html = template;
  if (!user || Number(user.status) === 404) {
    html = replaceAllToken(html, "[Label_bionalista]", "");
    return html.replace(/<img[^>]*\[firma\][^>]*>/gi, "");
  }
  html = replaceAllToken(html, "[Label_bionalista]", `${user.name ?? ""}<br>${user.college_number ?? user.collegeNumber ?? ""}`);
  return replaceAllToken(html, "[firma]", assetUrl(user.url_signature ?? user.signature));
}
export async function buildPatientResultHtml(patient, laboratory, getApprover) {
  const exams = Array.isArray(patient?.exams) ? patient.exams.filter((exam) => Number(exam.approved_id) > 0) : [];
  if (!exams.length) throw new Error("PATIENT_RESULTS_EMAIL_NOT_APPROVED");
  let header = String(laboratory?.head_html ?? "");
  if (!header.trim()) throw new Error("PATIENT_RESULTS_EMAIL_TEMPLATE_INVALID");
  let address = `${laboratory.address ?? ""}<br>TelÃ©fonos: ${laboratory.phone_1 ?? ""}`;
  if (laboratory.phone_2) address += `  --  ${laboratory.phone_2}`;
  address += `<br>Correo: ${laboratory.email ?? ""}`;
  if (laboratory.url) address += `<br>${laboratory.url}`;
  header = replaceAllToken(header, "[logo]", assetUrl(laboratory.logo));
  header = replaceAllToken(header, "[Label_Laboratorio]", laboratory.business_name ?? laboratory.name ?? "");
  header = replaceAllToken(header, "[Label_domicilio]", address);
  header = replaceAllToken(header, "[NoPaciente]", patient.patient_position);
  header = replaceAllToken(header, "[Nombre]", patient.name);
  header = replaceAllToken(header, "[Edad]", `${patient.age ?? ""} ${patient.month_year ?? ""}`.trim());
  header = replaceAllToken(header, "[CI]", patient.document_number);
  header = replaceAllToken(header, "[Fecha]", patient.admission_date);
  header = replaceAllToken(header, "[alto_body]", "680px");
  const maximumRows = Math.max(1, Number(laboratory.maximum_rows_report) || 34);
  let content = "", body = "", remaining = maximumRows, approverId = null, page = "";
  async function openPage(id) { const user = await getApprover(id); page = approverBlock(header, user); body = ""; remaining = maximumRows; }
  function closePage(pageBreak = false) {
    const pageContent = page.includes("[body]") ? replaceAllToken(page, "[body]", body) : `${page}${body}`;
    content += pageContent;
    if (pageBreak) content += '<div style="page-break-after: always;"></div>';
  }
  for (const exam of exams) {
    const id = Number(exam.approved_id);
    const size = Math.max(1, Number(exam.size) || 1);
    if (approverId === null) { approverId = id; await openPage(id); }
    if (id !== approverId || remaining - size < 1) { closePage(true); approverId = id; await openPage(id); }
    const result = String(exam.result ?? "").trim();
    if (!result) continue;
    body += result.replace(/<p>/g, '<p style="font-size: 10px;">');
    remaining -= size;
  }
  closePage(false);
  const visibleText = content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim();
  if (visibleText.length < 20) throw new Error("PATIENT_RESULTS_EMAIL_CONTENT_EMPTY");
  return `<div style="padding:20px;background:white;color:#111;">${content}</div>`;
}
