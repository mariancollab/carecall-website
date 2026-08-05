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

  // ---------- Modal de signup/login ----------
  const signupModal = document.getElementById("signupModal");

  function openSignupModal() {
    signupModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeSignupModal() {
    signupModal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  // Orice buton "Creează cont gratuit" din pagină (inclusiv cele din
  // secțiunea de prețuri, care sunt doar informative) deschide modalul.
  document.querySelectorAll('a[href="#signup"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openSignupModal();
    });
  });

  document.getElementById("closeSignupModal").addEventListener("click", closeSignupModal);

  // Închide și dacă apeși în afara casetei albe (pe fundalul întunecat).
  signupModal.addEventListener("click", (e) => {
    if (e.target === signupModal) {
      closeSignupModal();
    }
  });

  // ---------- Toggle semnare cont / conectare ----------
  document.getElementById("showLoginLink").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("signupIntro").classList.add("hidden");
    document.getElementById("loginIntro").classList.remove("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
  });

  document.getElementById("showSignupLink").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("loginIntro").classList.add("hidden");
    document.getElementById("signupIntro").classList.remove("hidden");
    document.getElementById("signupForm").classList.remove("hidden");
  });

  // ---------- Login + MFA ----------
  let pendingMfaEmail = null;

  document.getElementById("loginSubmitBtn").addEventListener("click", async () => {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const errorEl = document.getElementById("loginError");
    const btn = document.getElementById("loginSubmitBtn");
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    hide(errorEl);

    if (!email || !password) {
      errorEl.textContent = "Introdu adresa de email și parola.";
      show(errorEl);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se caută contul...";
    try {
      const res = await fetch(`${API_BASE_URL}/clinics/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_email: email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Cerere eșuată (${res.status})`);
      }
      const result = await res.json();
      if (result.mfa_required) {
        pendingMfaEmail = result.owner_email;
        emailInput.disabled = true;
        passwordInput.disabled = true;
        btn.classList.add("hidden");
        show(document.getElementById("mfaBox"));
      }
    } catch (err) {
      errorEl.textContent = err.message;
      show(errorEl);
    } finally {
      btn.disabled = false;
      btn.textContent = "Continuă";
    }
  });

  document.getElementById("mfaSubmitBtn").addEventListener("click", async () => {
    const codeInput = document.getElementById("mfaCode");
    const errorEl = document.getElementById("mfaError");
    const btn = document.getElementById("mfaSubmitBtn");
    const code = codeInput.value.trim();
    hide(errorEl);

    if (!code) {
      errorEl.textContent = "Introdu codul primit pe email.";
      show(errorEl);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se verifică...";
    try {
      const res = await fetch(`${API_BASE_URL}/clinics/verify-mfa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_email: pendingMfaEmail, code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Cerere eșuată (${res.status})`);
      }
      const clinic = await res.json();
      window.location.href = `${ONBOARDING_BASE_URL}/index.html?clinic_id=${clinic.id}`;
    } catch (err) {
      errorEl.textContent = err.message;
      show(errorEl);
    } finally {
      btn.disabled = false;
      btn.textContent = "Confirmă codul";
    }
  });

  // ---------- Ți-ai uitat parola ----------
  document.getElementById("showForgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("forgotPasswordBox").classList.toggle("hidden");
  });

  function updateResetPasswordChecklist(password) {
    const lengthOk = password.length >= 12;
    const uppercaseOk = /[A-Z]/.test(password);
    const digitOk = /[0-9]/.test(password);
    const specialOk = /[^A-Za-z0-9]/.test(password);

    const lengthEl = document.getElementById("resetPwCheckLength");
    const uppercaseEl = document.getElementById("resetPwCheckUppercase");
    const digitEl = document.getElementById("resetPwCheckDigit");
    const specialEl = document.getElementById("resetPwCheckSpecial");

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

  document.getElementById("resetNewPassword").addEventListener("input", (e) => {
    updateResetPasswordChecklist(e.target.value);
  });

  document.getElementById("sendResetCodeBtn").addEventListener("click", async () => {
    const emailInput = document.getElementById("forgotEmail");
    const errorEl = document.getElementById("forgotError");
    const successEl = document.getElementById("forgotSuccess");
    const btn = document.getElementById("sendResetCodeBtn");
    const email = emailInput.value.trim();
    hide(errorEl);
    hide(successEl);

    if (!email) {
      errorEl.textContent = "Introdu adresa de email.";
      show(errorEl);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se trimite...";
    try {
      const res = await fetch(`${API_BASE_URL}/clinics/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_email: email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Cerere eșuată (${res.status})`);
      }
      successEl.textContent = "Dacă acest email există, vei primi un cod de resetare.";
      show(successEl);
      document.getElementById("resetPasswordFields").classList.remove("hidden");
    } catch (err) {
      errorEl.textContent = err.message;
      show(errorEl);
    } finally {
      btn.disabled = false;
      btn.textContent = "Trimite cod de resetare";
    }
  });

  document.getElementById("confirmResetBtn").addEventListener("click", async () => {
    const errorEl = document.getElementById("forgotError");
    const btn = document.getElementById("confirmResetBtn");
    const email = document.getElementById("forgotEmail").value.trim();
    const code = document.getElementById("resetCode").value.trim();
    const newPassword = document.getElementById("resetNewPassword").value;
    hide(errorEl);

    if (!updateResetPasswordChecklist(newPassword)) {
      errorEl.textContent = "Parola nouă nu îndeplinește toate cerințele.";
      show(errorEl);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Se schimbă parola...";
    try {
      const res = await fetch(`${API_BASE_URL}/clinics/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_email: email, code, new_password: newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Cerere eșuată (${res.status})`);
      }
      alert("Parola a fost schimbată cu succes. Te poți autentifica acum cu parola nouă.");
      document.getElementById("forgotPasswordBox").classList.add("hidden");
      document.getElementById("resetPasswordFields").classList.add("hidden");
    } catch (err) {
      errorEl.textContent = err.message;
      show(errorEl);
    } finally {
      btn.disabled = false;
      btn.textContent = "Schimbă parola";
    }
  });
});
