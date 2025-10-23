 (function () {
    // ========= Timer (120s) =========
    let remaining = 120; // seconds
    const elDays = document.getElementById("days");
    const elHours = document.getElementById("hours");
    const elMinutes = document.getElementById("minutes");
    const elSeconds = document.getElementById("seconds");

    function pad2(x){ return String(x).padStart(2, "0"); }
    function renderTime(sec){
      if (!elDays) return;
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

    // ========= Modal open/close =========
    const modal = document.getElementById("registrationModal");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalOverlay = document.getElementById("modalOverlay");

    function openModal(){
      if (!modal) return;
      modal.style.display = "block";
      modal.setAttribute("aria-hidden","false");
      document.body.style.overflowY = "hidden";
      if (openModalBtn) openModalBtn.setAttribute("aria-expanded", "true");

      const first = modal.querySelector("input");
      if (first && typeof first.focus === "function") {
        setTimeout(() => first.focus(), 50);
      }
    }
    function closeModal(){
      if (!modal) return;
      modal.style.display = "none";
      modal.setAttribute("aria-hidden","true");
      document.body.style.overflowY = "auto";
      if (openModalBtn) openModalBtn.setAttribute("aria-expanded", "false");
      if (openModalBtn && typeof openModalBtn.focus === "function") openModalBtn.focus();
    }
    if (openModalBtn) {
      openModalBtn.addEventListener("click", openModal);
      openModalBtn.addEventListener("keydown", (e)=>{ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openModal(); }});
    }
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

    // ========= Phone formatting helpers =========
    // Accepts any input; returns formatted "+998-XX-XXX-XX-XX"
    function onlyDigits(str){
      return String(str || "").replace(/\D/g, "");
    }

    function formatUzPhone(raw){
      // raw can contain + and digits and separators
      if (!raw) return "+998-";
      // remove non-digits
      let digits = onlyDigits(raw);

      // If user started with country code (like 998...), ensure strip leading 998 if present later
      // We want final digits = 9 subscriber digits (after 998)
      if (digits.startsWith("998")) {
        digits = digits.slice(3);
      } else if (digits.startsWith("0")) {
        // if someone types leading 0 (unlikely), keep as-is (we'll still format after forcing 998)
        digits = digits.replace(/^0+/, "");
      }

      // Keep only up to 9 digits for subscriber number
      digits = digits.slice(0, 9);

      // Build groups: XX | XXX | XX | XX  (2-3-2-2) total 9
      const g1 = digits.slice(0,2); // operator
      const g2 = digits.slice(2,5);
      const g3 = digits.slice(5,7);
      const g4 = digits.slice(7,9);

      let out = "+998";
      if (g1.length) out += "-" + g1;
      if (g2.length) out += "-" + g2;
      if (g3.length) out += "-" + g3;
      if (g4.length) out += "-" + g4;

      // If only +998 and nothing else, ensure trailing dash for UX
      if (out === "+998") out = "+998-";
      return out;
    }

    // Validate formatted phone corresponds to +998-XXXXXXXXX (9 digits)
    function isValidUzPhone(formatted){
      // Extract digits
      const digits = onlyDigits(formatted);
      // Expect 12 digits total if full with country code (998 + 9 digits)
      return digits.length === 12 && digits.startsWith("998");
    }

    // Attach formatting to an input element (formats on input/paste/blur)
    function attachFormattedPhone(inputEl, errEl){
      if (!inputEl) return;
      if (errEl && !errEl.hasAttribute("aria-live")) errEl.setAttribute("aria-live", "polite");

      // On focus, if empty, set to "+998-"
      inputEl.addEventListener("focus", () => {
        if (!inputEl.value || inputEl.value.trim() === "") {
          inputEl.value = "+998-";
        }
      });

      // Format on input
      inputEl.addEventListener("input", (e) => {
        const cur = inputEl.value;
        // preserve selection roughly by moving caret to end (simple approach)
        const formatted = formatUzPhone(cur);
        inputEl.value = formatted;
        if (errEl) clearError(inputEl, errEl);
        // move caret to end
        try { inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length; } catch (err) {}
      });

      // Handle paste: sanitize and format
      inputEl.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text") || "";
        inputEl.value = formatUzPhone(text);
        if (errEl) clearError(inputEl, errEl);
        try { inputEl.selectionStart = inputEl.selectionEnd = inputEl.value.length; } catch (err) {}
      });

      // Prevent typing invalid characters except + at very start (but we keep caret-to-end so simpler)
      inputEl.addEventListener("keypress", (e) => {
        const ch = String.fromCharCode(e.which || e.keyCode);
        if (!/\d/.test(ch)) {
          e.preventDefault();
        }
      });

      // On blur, if only prefix exists, clear (optional)
      inputEl.addEventListener("blur", () => {
        // If user left only "+998-" or shorter, keep as-is or clear? We'll keep as-is but you can clear by uncommenting.
        // if (inputEl.value === "+998-" || inputEl.value.trim() === "+998") inputEl.value = "";
      });
    }

    // ========= Reusable validation / localStorage from previous version =========
    function showError(inputEl, errEl, msg){
      if (inputEl) inputEl.classList.add("error");
      if (errEl) {
        errEl.textContent = msg || "Xatolik";
        errEl.style.display = "block";
        errEl.style.visibility = "visible";
      }
    }
    function clearError(inputEl, errEl){
      if (inputEl) inputEl.classList.remove("error");
      if (errEl) {
        errEl.textContent = "";
        errEl.style.display = "none";
        errEl.style.visibility = "hidden";
      }
    }

    function saveToLocal({name, phone}){
      const payload = {
        Ism: name,
        TelefonRaqam: phone,
        SanaSoat: new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })
      };
      try {
        const prev = localStorage.getItem("formDataList");
        const list = prev ? JSON.parse(prev) : [];
        list.push(payload);
        localStorage.setItem("formDataList", JSON.stringify(list));
        return true;
      } catch (e) {
        console.error("LocalStorage xatosi:", e);
        return false;
      }
    }

    function _setBtnLoading(btn, loading, loadingText){
      if (!btn) return;
      if (loading) {
        if (!btn.dataset.origText) btn.dataset.origText = btn.textContent;
        btn.disabled = true;
        btn.textContent = loadingText || "Saqlanmoqda...";
        btn.setAttribute("aria-busy", "true");
      } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.origText || btn.textContent;
        btn.removeAttribute("aria-busy");
      }
    }

    // ========= Form binding =========
    function bindForm(formId, nameId, telId, errNameId, errTelId, submitBtnId){
      const form = document.getElementById(formId);
      const nameEl = document.getElementById(nameId);
      const telEl  = document.getElementById(telId);
      const errName = document.getElementById(errNameId);
      const errTel  = document.getElementById(errTelId);
      const submitBtn = document.getElementById(submitBtnId);

      if (!form) return;

      if (errName) { errName.style.display = "none"; errName.style.visibility = "hidden"; }
      if (errTel)  { errTel.style.display = "none";  errTel.style.visibility = "hidden"; }

      // Attach special formatted phone handler
      attachFormattedPhone(telEl, errTel);
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
          showError(telEl, errTel, "Telefon raqami noto‘g‘ri formatda! To'liq: +998-XX-XXX-XX-XX");
          hasError = true;
        } else {
          clearError(telEl, errTel);
        }

        if (hasError) return;

        _setBtnLoading(submitBtn, true, "Saqlanmoqda...");

        try{
          const ok = saveToLocal({name, phone});
          if (!ok) throw new Error("save failed");
          setTimeout(() => {
            if (formId === "modalForm") {
              // close modal if present
              const modalElem = document.getElementById("registrationModal");
              if (modalElem) modalElem.style.display = "none";
            }
            // redirect
            window.location.href = "thankYou.html";
          }, 300);
        } catch (err){
          console.error(err);
          _setBtnLoading(submitBtn, false);
          alert("Uzr, saqlashda muammo yuz berdi. Qayta urinib ko'ring.");
        }
      });
    }

    // Bind both forms
    bindForm("mainForm",  "nameMain",  "telMain",  "errNameMain",  "errTelMain",  "submitMain");
    bindForm("modalForm", "nameModal", "telModal", "errNameModal", "errTelModal", "submitModal");

    // Initialize default phone placeholders for inputs if empty
    document.querySelectorAll('input.tel').forEach(i => {
      if (!i.value || i.value.trim() === "") i.value = "+998-";
    });

  })();