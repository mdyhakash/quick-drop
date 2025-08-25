document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open");
  const devLink = document.getElementById("options");

  // Default to your hosted app
  const PROD_URL = "https://quick-drop-xi.vercel.app/"; // provided hosting URL

  const getTargetUrl = async () => PROD_URL;

  openBtn.addEventListener("click", async () => {
    const url = await getTargetUrl();
    // Reuse existing Quick Drop window if one is already open
    const [origin] = url.split("?", 1);
    const targetOrigins = [origin.replace(/\/$/, "")];

    chrome.windows.getAll({ populate: true }, (wins) => {
      for (const w of wins) {
        for (const t of w.tabs || []) {
          const tabUrl = (t.url || "").replace(/\/$/, "");
          if (targetOrigins.some((o) => tabUrl.startsWith(o))) {
            // Focus existing window/tab
            if (w.id) chrome.windows.update(w.id, { focused: true });
            if (t.id) chrome.tabs.update(t.id, { active: true });
            return;
          }
        }
      }
      // Otherwise open as a floating popup window for quick note taking
      chrome.windows.create({
        url,
        type: "popup",
        width: 520,
        height: 840,
        focused: true,
      });
    });
  });

  devLink.addEventListener("click", (e) => {
    e.preventDefault();
    // Dev link removed; keep no-op to avoid errors if element exists
  });
});
