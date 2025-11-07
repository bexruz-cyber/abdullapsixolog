document.addEventListener("DOMContentLoaded", () => {

    // 📌 User action event jo‘natish
    function sendEvent(type) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://user-action-tracker.asosit.uz/events", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                xhr.status === 200
                    ? console.log("Yuborildi:", xhr.responseText)
                    : console.error("Xatolik:", xhr.status);
            }
        };

        xhr.send(JSON.stringify({
            type,
            site_name: "Asosiy"
        }));
    }

    sendEvent("Saytga kirdi");

    // 📌 Elements
    const registerBtns = document.querySelectorAll(".registerBtn");
    const modal = document.getElementById("registrationModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const overlay = document.querySelector(".homeModalOverlay");
    const form = document.getElementById("registrationForm");
    const phone = document.getElementById("phone");
    const phoneError = document.getElementById("phoneError");
    const submitBtn = document.getElementById("submitBtn");

    const phoneRules = {
        "+998": {
            placeholder: "88 888 88 88",
            format: (value) => {
                let v = "";
                if (value.length > 0) v += value.slice(0, 2);
                if (value.length > 2) v += " " + value.slice(2, 5);
                if (value.length > 5) v += " " + value.slice(5, 7);
                if (value.length > 7) v += " " + value.slice(7, 9);
                return v;
            },
            validate: (value) => /^\d{2} \d{3} \d{2} \d{2}$/.test(value)
        }
    };

    let currentPrefix = "+998";

    // 📌 Modalni yopish
    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflowY = "scroll";
    }

    closeModalBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    // 📌 Modalni ochish
    registerBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            sendEvent("Tugmani bosdi");
            modal.style.display = "flex";
            document.body.style.overflowY = "hidden";
        });
    });

    // 📌 Form submit
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const number = phone.value;

        if (!phoneRules[currentPrefix].validate(number)) {
            phoneError.style.display = "block";
            return;
        }

        phoneError.style.display = "none";
        submitBtn.textContent = "YUBORILMOQDA...";
        submitBtn.disabled = true;

        const now = new Date();

        const data = {
            TelefonRaqam: `${currentPrefix} ${number}`,
            SanaSoat: now.toLocaleDateString("uz-UZ") + " - " + now.toLocaleTimeString("uz-UZ")
        };

        localStorage.setItem("formData", JSON.stringify(data));
        window.location.href = "/thankYou.html";
    });

    // 📌 Phone mask
    phone.addEventListener("input", function () {
        const cleaned = this.value.replace(/\D/g, "");
        this.value = phoneRules[currentPrefix].format(cleaned);
        phoneError.style.display = "none";
    });

    // 📌 Timer (02:00 dan)
    let time = 120;
    const timer = document.getElementById("timer");

    setInterval(() => {
        if (time <= 0) {
            timer.textContent = "00:00";
            return;
        }
        time--;
        const min = String(Math.floor(time / 60)).padStart(2, "0");
        const sec = String(time % 60).padStart(2, "0");
        timer.textContent = `${min}:${sec}`;
    }, 1000);

});
