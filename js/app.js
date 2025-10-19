(function () {
  // ========= Timer (120s) =========
  let remaining = 120; // soniyalarda
  const elDays = document.getElementById("days");
  const elHours = document.getElementById("hours");
  const elMinutes = document.getElementById("minutes");
  const elSeconds = document.getElementById("seconds");

  function pad2(x){ return String(x).padStart(2, "0"); }
  function renderTime(sec){
    if (!elDays) return; // sahifada taymer bo'lmasa jim
    if (sec < 0) sec = 0;
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    elDays.textContent = pad2(d);
    elHours.textContent = pad2(h);
    elMinutes.textContent = pad2(m);
    elSeconds.textContent = pad2(s);
  }
  renderTime(remaining);
  let last = performance.now();
  const iv = setInterval(() => {
    const now = performance.now();
    const diff = (now - last) / 1000;
    last = now;
    remaining -= diff;
    if (remaining <= 0){
      clearInterval(iv);
      renderTime(0);
    } else {
      renderTime(Math.ceil(remaining));
    }
  }, 250);

  // ========= Modal ochish/yopish =========
  const modal = document.getElementById("registrationModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const modalOverlay = document.getElementById("modalOverlay");

  function openModal(){
    if (!modal) return;
    modal.style.display = "block";
    document.body.style.overflowY = "hidden";
    if (openModalBtn) openModalBtn.setAttribute("aria-expanded", "true");
  }
  function closeModal(){
    if (!modal) return;
    modal.style.display = "none";
    document.body.style.overflowY = "auto";
    if (openModalBtn) openModalBtn.setAttribute("aria-expanded", "false");
  }
  if (openModalBtn) {
    openModalBtn.addEventListener("click", openModal);
    openModalBtn.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openModal(); }});
  }
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

  // ========= Telefon inputni faqat raqamga (va boshida ixtiyoriy '+') cheklash =========
  function sanitizePhone(raw){
    // faqat raqam va bitta boshidagi + ga ruxsat
    let v = String(raw).replace(/[^\d+]/g, "");
    if (v.indexOf("+") > 0) v = v.replace(/\+/g, ""); // o'rtadagi + larni olib tashla
    if (v.indexOf("+") === 0) {
      const rest = v.slice(1).replace(/[^\d]/g, "");
      v = "+" + rest;
    } else {
      v = v.replace(/[^\d]/g, "");
    }
    return v;
  }

  function attachPhoneGuards(inputEl, errEl){
    if (!inputEl) return;
    inputEl.addEventListener("input", () => {
      const cur = inputEl.value;
      const clean = sanitizePhone(cur);
      if (cur !== clean) inputEl.value = clean; // harflarni olib tashlaydi
      if (errEl) errEl.textContent = "";
      inputEl.classList.remove("error");
    });
    inputEl.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData("text");
      inputEl.value = sanitizePhone(text);
    });
  }

  // ========= Validatsiya =========
  function showError(inputEl, errEl, msg){
    if (inputEl) inputEl.classList.add("error");
    if (errEl) { errEl.textContent = msg || "Xatolik"; }
  }
  function clearError(inputEl, errEl){
    if (inputEl) inputEl.classList.remove("error");
    if (errEl) { errEl.textContent = ""; }
  }
  // O'zbekiston formati: 998 + 9 ta raqam (umumiy 12 belgi)
  function isValidUzPhone(v){
    const only = v && v.startsWith("+") ? v.slice(1) : v;
    return /^998\d{9}$/.test(only || "");
  }

  // ========= LocalStorage ga saqlash (Sheets o'rniga) =========
  function saveToLocal({name, phone}){
    const payload = {
      Ism: name,
      TelefonRaqam: phone,
      SanaSoat: new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })
    };
    try {
      localStorage.setItem("formData", JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error("LocalStorage xatosi:", e);
      return false;
    }
  }

  function bindForm(formId, nameId, telId, errNameId, errTelId, submitBtnId){
    const form = document.getElementById(formId);
    const nameEl = document.getElementById(nameId);
    const telEl  = document.getElementById(telId);
    const errName = document.getElementById(errNameId);
    const errTel  = document.getElementById(errTelId);
    const submitBtn = document.getElementById(submitBtnId);

    if (!form) return;

    attachPhoneGuards(telEl, errTel);
    if (nameEl) nameEl.addEventListener("input", ()=> clearError(nameEl, errName));

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (nameEl && nameEl.value || "").trim();
      const phone = (telEl && telEl.value || "").trim();

      let hasError = false;
      if (!name){
        showError(nameEl, errName, "Iltimos, ismingizni kiriting!");
        hasError = true;
      } else {
        clearError(nameEl, errName);
      }

      if (!phone){
        showError(telEl, errTel, "Iltimos, telefon raqamingizni kiriting!");
        hasError = true;
      } else if (!isValidUzPhone(phone)){
        showError(telEl, errTel, "Telefon raqami noto‘g‘ri formatda! (998XXXXXXXXX)");
        hasError = true;
      } else {
        clearError(telEl, errTel);
      }

      if (hasError) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saqlanmoqda...";
      }
      try{
        saveToLocal({name, phone});
        window.location.href = "thankYou.html"; // thank you sahifa
      } catch (err){
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = formId === "modalForm" ? "→ BEPUL RO‘YXATDAN O‘TISH" : "-> BEPUL RO'YXATDAN O'TISH";
        }
        alert("Uzr, saqlashda muammo yuz berdi. Qayta urinib ko'ring.");
      }
    });
  }

  // Ikki formani bog'laymiz
  bindForm("mainForm",  "nameMain",  "telMain",  "errNameMain",  "errTelMain",  "submitMain");
  bindForm("modalForm", "nameModal", "telModal", "errNameModal", "errTelModal", "submitModal");
})();
