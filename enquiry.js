// ---------------------------------------------------------------------------
// "Get in touch" enquiry form.
// Submissions go to a Cloudflare Worker (see /worker), which holds the
// Airtable key and creates the CRM record. Set the Worker's URL here.
// ---------------------------------------------------------------------------
const ENQUIRY_ENDPOINT = "";
const ENQUIRY_TYPE = "Software";

(() => {
  const dialog = document.getElementById("enquiry");
  const form = document.getElementById("enquiry-form");
  const done = document.getElementById("enquiry-done");
  const errorEl = document.getElementById("enquiry-error");
  const submit = form.querySelector(".enquiry__submit");

  function open() {
    form.hidden = false;
    done.hidden = true;
    errorEl.textContent = "";
    dialog.showModal();
    form.querySelector("input[name=name]").focus();
  }

  document.querySelectorAll("[data-open-enquiry]").forEach((b) => b.addEventListener("click", open));
  dialog.querySelectorAll("[data-close-enquiry]").forEach((b) => b.addEventListener("click", () => dialog.close()));

  // Close when clicking the dimmed backdrop
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  const checks = {
    name: (v) => v.length >= 2 || "Please enter your name.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Please enter a valid email address.",
    phone: (v) => v.replace(/\D/g, "").length >= 7 || "Please enter a valid phone number.",
    postcode: (v) => /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/.test(v) || "Please enter a valid UK postcode.",
    message: (v) => v.length >= 2 || "Please tell us a little about your enquiry.",
  };

  function validate() {
    let firstError = null;
    for (const [name, check] of Object.entries(checks)) {
      const input = form.elements[name];
      const result = check(input.value.trim());
      const ok = result === true;
      input.closest(".field").classList.toggle("is-invalid", !ok);
      if (!ok && !firstError) firstError = { input, message: result };
    }
    if (firstError) {
      errorEl.textContent = firstError.message;
      firstError.input.focus();
      return false;
    }
    errorEl.textContent = "";
    return true;
  }

  form.addEventListener("input", (e) => {
    e.target.closest(".field")?.classList.remove("is-invalid");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = Object.fromEntries(
      ["name", "email", "phone", "postcode", "message", "company_website"].map((k) => [k, form.elements[k].value.trim()])
    );
    data.postcode = data.postcode.toUpperCase();
    data.enquiryType = ENQUIRY_TYPE;

    submit.disabled = true;
    submit.classList.add("is-sending");
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      form.hidden = true;
      done.hidden = false;
    } catch (err) {
      console.error("Enquiry failed:", err);
      errorEl.textContent = "Sorry, something went wrong sending your enquiry. Please try again in a moment.";
    } finally {
      submit.disabled = false;
      submit.classList.remove("is-sending");
    }
  });
})();
