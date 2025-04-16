async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch from ${url}:`, err);
    return null;
  }
}

function createCard(title, content, link) {
  return `
    <h2>${title}</h2>
    ${content}
    ${link ? `<a href="${link}" target="_blank">More Info</a>` : ''}
  `;
}

async function init() {
  const ipCard = document.getElementById("ipCard");
  const hostnameCard = document.getElementById("hostnameCard");
  const uaCard = document.getElementById("uaCard");
  const headersCard = document.getElementById("headersCard");
  const whoisCard = document.getElementById("whoisCard");
  const blacklistCard = document.getElementById("blacklistCard");

  try {
    // IP Address
    const ipData = await fetchData("https://api.ipify.org?format=json");
    const ip = ipData?.ip || "Unavailable";
    ipCard.innerHTML = createCard("IP Address", `<p>${ip}</p>`, `https://whatismyipaddress.com/ip/${ip}`);

    // Hostname
    const hostnameData = await fetchData("https://whatismyhostname.com/json/");
    hostnameCard.innerHTML = createCard(
      "Hostname",
      `<p>${hostnameData?.hostname || "Unavailable"}</p>`,
      "https://whatismyhostname.com/"
    );

    // User Agent
    const ua = navigator.userAgent;
    uaCard.innerHTML = createCard(
      "User Agent",
      `<p>${ua}</p>`,
      "https://www.whatismybrowser.com/detect/what-is-my-user-agent"
    );

    // Server Headers
    const headersData = await fetchData("https://httpbingo.org/headers");
    if (headersData?.headers) {
      const headerList = Object.entries(headersData.headers)
        .map(([key, val]) => `<li><strong>${key}:</strong> ${Array.isArray(val) ? val.join(', ') : val}</li>`)
        .join("");
      headersCard.innerHTML = createCard(
        "Server Headers",
        `<ul>${headerList}</ul>`,
        "https://httpbingo.org/headers"
      );
    } else {
      headersCard.innerHTML = createCard("Server Headers", "<p>Unavailable</p>", null);
    }

    // WHOIS Info (cleaned)
    const whoisData = await fetchData(`https://rdap.org/ip/${ip}`);
    if (whoisData) {
      const whoisInfo = {
        Name: whoisData.name || "N/A",
        Handle: whoisData.handle || "N/A",
        Country: whoisData?.country || whoisData?.entities?.[0]?.vcardArray?.[1]?.find(([type]) => type === "country")?.[3] || "N/A",
        Org: whoisData?.entities?.[0]?.vcardArray?.[1]?.find(([type]) => type === "fn")?.[3] || "N/A",
        Type: whoisData.type || "N/A",
        "Start Address": whoisData.startAddress || "N/A",
        "End Address": whoisData.endAddress || "N/A"
      };

      const infoList = Object.entries(whoisInfo)
        .map(([key, val]) => `<li><strong>${key}:</strong> ${val}</li>`)
        .join("");
      whoisCard.innerHTML = createCard(
        "WHOIS Info",
        `<ul>${infoList}</ul>`,
        `https://who.is/whois-ip/ip-address/${ip}`
      );
    } else {
      whoisCard.innerHTML = createCard("WHOIS Info", "<p>Unavailable</p>", `https://who.is/whois-ip/ip-address/${ip}`);
    }

    // Blacklist Check
    const blacklistLink = `https://whatismyipaddress.com/blacklist-check/${ip}`;
    blacklistCard.innerHTML = createCard(
      "Blacklist Status",
      `<p>Click below to view blacklist info.</p>`,
      blacklistLink
    );
  } catch (error) {
    console.error("Error initializing netinformer:", error);
  }
}

init();
