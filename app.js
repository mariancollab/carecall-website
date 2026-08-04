// carecall. official website — calculator de pierdere din neprezentări la programare
// No backend calls needed here, pure front-end math.

const PLUS_PLAN_MONTHLY_PRICE = 299;

function formatLei(amount) {
  return Math.round(amount).toLocaleString("ro-RO") + " lei";
}

function recalculate() {
  const appointments = Number(document.getElementById("calcAppointments").value) || 0;
  const price = Number(document.getElementById("calcPrice").value) || 0;
  const ratePercent = Number(document.getElementById("calcRate").value) || 0;

  document.getElementById("calcRateValue").textContent = ratePercent + "%";

  const monthlyLoss = appointments * price * (ratePercent / 100);
  const yearlyLoss = monthlyLoss * 12;

  document.getElementById("calcMonthlyLoss").textContent = formatLei(monthlyLoss);
  document.getElementById("calcYearlyLoss").textContent = formatLei(yearlyLoss);

  const savingsMessageEl = document.getElementById("calcSavingsMessage");
  if (monthlyLoss > PLUS_PLAN_MONTHLY_PRICE) {
    const netSavings = monthlyLoss - PLUS_PLAN_MONTHLY_PRICE;
    savingsMessageEl.textContent = `Chiar dacă ai preveni doar jumătate din aceste pierderi, tot ai economisi aproximativ ${formatLei(netSavings)}/lună.`;
  } else {
    savingsMessageEl.textContent = "";
  }
}

// ---------- Signup ----------

function updatePasswordChecklist(password) {
  const lengthOk = password.length >= 12;
  const uppercaseOk = /[A-Z]/.test(password);
  const digitOk = /[0-9]/.test(password);
  const specialOk = /[^A-Za-z0-9]/.test(password);

  const lengthEl = document.getElementById("pwCheckLength");
  const uppercaseEl = document.getElementById("pwCheckUppercase");
  const digitEl = document.getElementById("pwCheckDigit");
  const specialEl = document.getElementById("pwCheckSpecial");

  lengthEl.textContent = (lengthOk ? "✓" : "✗") + " Minim 12 caractere";
  lengthEl.style.color = lengthOk ? "#16a34a" : "#dc2626";

  uppercaseEl.textContent = (uppercaseOk ? "✓" : "✗") + " O literă mare (A-Z)";
  uppercaseEl.style.color = uppercaseOk ? "#16a34a" : "#dc2626";

  digitEl.textContent = (digitOk ? "✓" : "✗") + " O cifră (0-9)";
  digitEl.style.color = digitOk ? "#16a34a" : "#dc2626";

  specialEl.textContent = (specialOk ? "✓" : "✗") + " Un simbol special (ex. ! @ # $ %)";
  specialEl.style.color = specialOk ? "#16a34a" : "#dc2626";

  return lengthOk && uppercaseOk && digitOk && specialOk;
}

function show(el) {
  el.classList.remove("hidden");
}
function hide(el) {
  el.classList.add("hidden");
}

async function handleSignup(e) {
  e.preventDefault();
  const errorEl = document.getElementById("signupError");
  hide(errorEl);

  const name = document.getElementById("clinicName").value.trim();
  const ownerEmail = document.getElementById("ownerEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  if (!updatePasswordChecklist(password)) {
    errorEl.textContent = "Parola nu îndeplinește toate cerințele de mai sus.";
    show(errorEl);
    return;
  }

  // Trimitem și cifrele din calculatorul de pierdere, ca bază de comparație
  // pentru raportul de rezultate de la finalul pilotului de 30 de zile.
  const avgAppointmentPrice = Number(document.getElementById("calcPrice").value) || null;
  const estimatedNoshowRate = Number(document.getElementById("calcRate").value) || null;

  const submitBtn = document.getElementById("signupSubmit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Se configurează contul tău...";

  try {
    const res = await fetch(`${API_BASE_URL}/clinics/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        owner_email: ownerEmail,
        password,
        avg_appointment_price: avgAppointmentPrice,
        estimated_noshow_rate: estimatedNoshowRate,
      }),
    });
    if (!res.ok) {
      let detail = `Cerere eșuată (${res.status})`;
      try {
        const body = await res.json();
        if (body && body.detail) detail = body.detail;
      } catch (_) {
        /* ignore parse errors */
      }
      throw new Error(detail);
    }
    const clinic = await res.json();
    // Redirecționăm direct spre dashboard, deja autentificată.
    window.location.href = `${ONBOARDING_BASE_URL}/index.html?clinic_id=${clinic.id}`;
  } catch (err) {
    errorEl.textContent = "Nu am putut crea contul tău: " + err.message;
    show(errorEl);
    submitBtn.disabled = false;
    submitBtn.textContent = "Creează-ți contul gratuit";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ["calcAppointments", "calcPrice", "calcRate"].forEach((id) => {
    document.getElementById(id).addEventListener("input", recalculate);
  });
  recalculate();

  document.getElementById("signupPassword").addEventListener("input", (e) => {
    updatePasswordChecklist(e.target.value);
  });

  document.getElementById("signupForm").addEventListener("submit", handleSignup);

  // Butoanele din secțiunea de prețuri preselectează planul ales, apoi
  // derulează pagina spre formularul de signup.
  document.querySelectorAll("a[data-plan]").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("signupPlan").value = link.dataset.plan;
    });
  });
});
