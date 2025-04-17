let collectedData = {};

function createCard(title, content, link, id) {
  return `
    <div class="card-header">
      <h2>${title}</h2>
      <div class="card-actions">
        <button class="copy-btn" onclick="copyCardContent('${id}')">Copy</button>
        <button class="collapse-btn" onclick="toggleCollapse('${id}')">Toggle</button>
        ${link ? `<a href="${link}" target="_blank">More Info</a>` : ""}
      </div>
    </div>
    <div class="card-body" id="${id}-body">${content}</div>
  `;
}

function toggleCollapse(id) {
  const body = document.getElementById(`${id}-body`);
  body.style.display = body.style.display === "none" ? "block" : "none";
}

function copyCardContent(id) {
  const text = document.getElementById(`${id}-body`).innerText;
  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
}

async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

function exportToFile(data, type) {
  const content = type === "json"
    ? JSON.stringify(data, null, 2)
    : Object.entries(data).map(([k, v]) => `${k}:\n${v}\n`).join("\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `netinformer.${type}`;
  link.click();
}

function setupUI() {
  document.getElementById("exportTxt").onclick = () => exportToFile(collectedData, "txt");
  document.getElementById("exportJson").onclick = () => exportToFile(collectedData, "json");

  document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("light-theme");
  };

  const scrollBtn = document.getElementById("scrollTop");
  window.onscroll = () => {
    scrollBtn.style.display = window.scrollY > 200 ? "block" : "none";
  };
  scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateTime() {
  const local = new Date();
  const utc = new Date().toUTCString();

  const timeHtml = `
    <ul>
      <li><strong>Local Time:</strong> ${local.toLocaleString()}</li>
      <li><strong>UTC Time:</strong> ${utc}</li>
    </ul>
  `;
  document.getElementById("timeCard").innerHTML = createCard("Current Time", timeHtml, null, "time");

  collectedData["Local Time"] = local.toLocaleString();
  collectedData["UTC Time"] = utc;
}

async function init() {
  setupUI();
  updateTime();
  setInterval(updateTime, 60000);

  const ipCard = document.getElementById("ipCard");
  const hostnameCard = document.getElementById("hostnameCard");
  const uaCard = document.getElementById("uaCard");
  const headersCard = document.getElementById("headersCard");
  const whoisCard = document.getElementById("whoisCard");
  const blacklistCard = document.getElementById("blacklistCard");

  const ipData = await fetchData("https://api.ipify.org?format=json");
  const ip = ipData?.ip || "Unavailable";
  ipCard.innerHTML = createCard("IP Address", `<p>${ip}</p>`, `https://whatismyipaddress.com/ip/${ip}`, "ip");
  collectedData["IP Address"] = ip;

  const hostnameData = await fetchData("https://whatismyhostname.com/json/");
  const hostname = hostnameData?.hostname || "Unavailable";
  hostnameCard.innerHTML = createCard("Hostname", `<p>${hostname}</p>`, "https://whatismyhostname.com", "hostname");
  collectedData["Hostname"] = hostname;

  const ua = navigator.userAgent;
  uaCard.innerHTML = createCard("User Agent", `<p>${ua}</p>`, "https://www.whatismybrowser.com", "ua");
  collectedData["User Agent"] = ua;

  const headersData = await fetchData("https://httpbingo.org/headers");
  if (headersData?.headers) {
    const headerList = Object.entries(headersData.headers)
      .map(([key, val]) => `<li><strong>${key}:</strong> ${Array.isArray(val) ? val.join(', ') : val}</li>`)
      .join("");
    headersCard.innerHTML = createCard("Server Headers", `<ul>${headerList}</ul>`, "https://httpbingo.org", "headers");
    collectedData["Server Headers"] = JSON.stringify(headersData.headers, null, 2);
  }

  const whoisData = await fetchData(`https://rdap.org/ip/${ip}`);
  if (whoisData) {
    const whoisInfo = {
      Name: whoisData.name || "N/A",
      Handle: whoisData.handle || "N/A",
      Country: whoisData?.country || "N/A",
      Org: whoisData?.entities?.[0]?.vcardArray?.[1]?.find(([type]) => type === "fn")?.[3] || "N/A",
      Type: whoisData.type || "N/A",
      "Start Address": whoisData.startAddress || "N/A",
      "End Address": whoisData.endAddress || "N/A"
    };

    const whoisList = Object.entries(whoisInfo)
      .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
      .join("");
    whoisCard.innerHTML = createCard("WHOIS Info", `<ul>${whoisList}</ul>`, `https://who.is/whois-ip/ip-address/${ip}`, "whois");
    collectedData["WHOIS Info"] = whoisInfo;
  }

  blacklistCard.innerHTML = createCard("Blacklist Check", `<p>Check your blacklist status at the link below.</p>`, `https://whatismyipaddress.com/blacklist-check/${ip}`, "blacklist");
  collectedData["Blacklist Check"] = `https://whatismyipaddress.com/blacklist-check/${ip}`;
}

init();
