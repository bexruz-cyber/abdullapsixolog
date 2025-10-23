const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxiS6639lAkwevuqShQ4I2_uuMhrz_ADO5lP7eq1iqpEajwfj3A0BQyAe9Ee6AJgphZag/exec";

async function sendFormData() {
  const raw = localStorage.getItem("formDataList");
  if (!raw) {
    console.log("No saved submissions to send.");
    return;
  }

  let list;
  try {
    list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      console.log("formDataList is empty or not an array.");
      return;
    }
  } catch (err) {
    console.error("Failed to parse formDataList:", err);
    return;
  }

  // Iterate and send entries sequentially (so easier to debug and to avoid rate-limits)
  try {
    for (const [idx, entry] of list.entries()) {
      // Normalize keys (your saved object used these keys in previous code)
      const payload = {
        Ism: entry.Ism || entry.name || "",
        TelefonRaqam: entry.TelefonRaqam || entry.TelefonRaqam || entry.phone || "",
        SanaSoat: entry.SanaSoat || entry.Sana || entry.time || ""
      };

      // Build FormData - IMPORTANT: match keys expected by your Apps Script.
      const form = new FormData();
      form.append("sheetName", "Lead");         // change if your script expects a different sheet name field
      form.append("Ism", payload.Ism);
      form.append("Telefon raqam", payload.TelefonRaqam);
      form.append("Royhatdan o'tgan vaqti", payload.SanaSoat);

      const res = await fetch(SHEET_URL, { method: "POST", body: form });
      if (!res.ok) {
        // try to read server message for debugging
        let text = "";
        try { text = await res.text(); } catch (e) {}
        throw new Error(`Server responded with ${res.status}. ${text}`);
      }

      // Optionally log success per item
      console.log(`Entry ${idx + 1}/${list.length} sent OK.`);
    }

    // All sent successfully — clear saved submissions
    localStorage.removeItem("formDataList");
    console.log("All submissions sent and local storage cleared.");

  } catch (err) {
    console.error("Error submitting form data:", err);
    // show error UI if exists
    const errEl = document.getElementById("errorMessage");
    if (errEl) {
      errEl.style.display = "block";
      errEl.textContent = "Xatolik: ma'lumotlar jo'natilmadi. Qayta urinib ko'ring.";
    }
  }
}

// run on load
window.addEventListener("load", sendFormData);
