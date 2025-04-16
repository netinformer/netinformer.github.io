async function fetchData(url) {
  const res = await fetch(url);
  return await res.json();
}

function createCard(title, content, link) {
  return `
    <h2>${title}</h2>
    <p>${content}</p>
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
    const ipData = await fetchData("https://api.ipify.org?format=json");
    ipCard.innerHTML = createCard("IP Address", ipData.ip, `https://whatismyipaddress.com/ip/${ipData.ip}`);

    const hostnameData = await fetchData("https://whatismyhostname.com/json/");
    hostnameCard.innerHTML = createCard("Hostname", hostnameData.hostname, "https://whatismyhostname.com");

    const ua = navigator.userAgent;
    uaCard.innerHTML = createCard("User Agent", ua, "https://www.whatismybrowser.com/detect/what-is-my-user-agent");

    const headersData = await fetchData("https://httpbingo.org/headers");
    headersCard.innerHTML = createCard("Server Headers", JSON.stringify(headersData.headers, null, 2), "https://httpbingo.org/headers");

    const whoisData = await fetchData(`https://rdap.org/ip/${ipData.ip}`);
    whoisCard.innerHTML = createCard("WHOIS Info", JSON.stringify(whoisData, null, 2), `https://who.is/whois-ip/ip-address/${ipData.ip}`);

    const blacklistLink = `https://whatismyipaddress.com/blacklist-check/${ipData.ip}`;
    blacklistCard.innerHTML = createCard("Blacklist Status", "Click to check blacklist info.", blacklistLink);

  } catch (error) {
    console.error("Error loading data:", error);
  }
}

init();
