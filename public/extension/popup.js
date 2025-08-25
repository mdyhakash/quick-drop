document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("open");
  const devLink = document.getElementById("options");

  // Default to production origin relative to extension popup
  const PROD_URL = "https://quick-drop.app"; // change if you deploy elsewhere
  const DEV_URL = "http://localhost:3000";

  const getTargetUrl = async () => {
    // Prefer dev when it's running; otherwise use prod
    try {
      const res = await fetch(DEV_URL, { method: "HEAD", cache: "no-store" });
      if (res.ok) return DEV_URL;
    } catch {}
    return PROD_URL;
  };

  openBtn.addEventListener("click", async () => {
    const url = await getTargetUrl();
    chrome.tabs.create({ url });
  });

  devLink.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: DEV_URL });
  });
});
