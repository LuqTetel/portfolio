const PROFILE_URL = "data/profile.json";
const CERTS_URL = "data/certificates.json";
const THEME_STORAGE_KEY = "portfolio_theme";

function $(selector) {
  return document.querySelector(selector);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = value ?? "";
}

function setLink(rowId, linkId, href, label) {
  const row = document.getElementById(rowId);
  const link = document.getElementById(linkId);
  if (!row || !link) return;
  if (!href) { row.hidden = true; return; }
  link.href = href;
  link.textContent = label ?? href;
  row.hidden = false;
}

function setSpan(rowId, spanId, value) {
  const row = document.getElementById(rowId);
  const span = document.getElementById(spanId);
  if (!row || !span) return;
  if (!value) { row.hidden = true; return; }
  span.textContent = value;
  row.hidden = false;
}

function normalizeTheme(theme) {
  return theme === "light" || theme === "dark" ? theme : null;
}

function applyTheme(theme) {
  const html = document.documentElement;
  if (!theme) { html.removeAttribute("data-theme"); return; }
  html.setAttribute("data-theme", theme);
}

function initTheme() {
  const saved = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  if (saved) applyTheme(saved);
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const current = normalizeTheme(document.documentElement.getAttribute("data-theme"));
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  });
}

// Loading Screen
function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => { loader.classList.add("hidden"); }, 500);
  });
}

// Scroll Reveal Animation
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  
  reveals.forEach(el => observer.observe(el));
}

// Header Scroll Effect
function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;
  
  window.addEventListener("scroll", () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Active Nav Link
function initActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.classList.add("active");
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" });
  
  sections.forEach(section => observer.observe(section));
}

// Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function prettifyFilename(filename) {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  return withoutExt
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\(1\)/g, "")
    .replace(/^CertificateOfCompletion\s*/i, "")
    .replace(/^Certification of Completion\s*-\s*/i, "")
    .trim();
}

function inferChipsFromCertTitles(titles) {
  const keywords = new Map([
    ["Python", /python/i],
    ["Power BI", /power\s*bi/i],
    ["Data Visualization", /data\s*visual/i],
    ["Analytics", /analytics/i],
    ["Risk", /\brisk\b/i],
  ]);
  const chips = [];
  for (const [label, re] of keywords.entries()) {
    if (titles.some((t) => re.test(t))) chips.push(label);
  }
  return chips;
}

function renderChips(chips) {
  const container = document.getElementById("chips");
  if (!container) return;
  container.innerHTML = "";
  chips.forEach((chip) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = chip;
    container.appendChild(span);
  });
}

function renderCertificates(certs) {
  const grid = document.getElementById("certGrid");
  const empty = document.getElementById("certEmpty");
  const count = document.getElementById("certCount");
  if (!grid || !empty) return;
  
  grid.innerHTML = "";
  if (count) {
    count.textContent = certs.length;
  }
  
  if (!certs.length) { empty.hidden = false; return; }
  empty.hidden = true;
  
  certs.forEach((cert) => {
    const title = cert.title || prettifyFilename(cert.file || "Certificate");
    const file = cert.file || "";
    const href = cert.url ? cert.url : file ? `Certificate/${encodeURIComponent(file)}` : "#";
    
    const card = document.createElement("article");
    card.className = "card card--pad cert";
    
    card.innerHTML = `
      <div class="cert__meta">
        <h3 class="cert__title">${title}</h3>
        <p class="cert__file">${file}</p>
      </div>
      <div class="cert-embed">
        <object data="${href}" type="application/pdf" width="100%" height="100%">
          <div class="cert-embed__fallback">
            <p>PDF preview not available in your browser.</p>
            <a class="button" href="${href}" target="_blank" rel="noreferrer">Open PDF</a>
            <a class="button button--ghost" href="${href}" download>Download</a>
          </div>
        </object>
      </div>
    `;
    
    grid.appendChild(card);
  });
}

function initCertSearch(allCerts) {
  const input = document.getElementById("certSearch");
  const clear = document.getElementById("clearSearch");
  if (!input || !clear) return;
  
  function applyFilter() {
    const q = input.value.trim().toLowerCase();
    if (!q) { renderCertificates(allCerts); return; }
    const filtered = allCerts.filter((c) => (c.title || prettifyFilename(c.file || "")).toLowerCase().includes(q));
    renderCertificates(filtered);
  }
  
  input.addEventListener("input", applyFilter);
  clear.addEventListener("click", () => {
    input.value = "";
    input.focus();
    renderCertificates(allCerts);
  });
}

async function loadJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json();
}

async function main() {
  // Initialize features
  initLoader();
  initTheme();
  initScrollReveal();
  initHeaderScroll();
  initActiveNavLink();
  initSmoothScroll();
  
  setText("year", String(new Date().getFullYear()));
  
  try {
    const profile = await loadJson(PROFILE_URL);
    const displayName = profile.fullName || profile.name || "Portfolio";
    setText("brandName", profile.name || displayName);
    setText("fullName", displayName);
    setText("footerName", profile.name || displayName);
    setText("title", profile.title || "");
    setText("summary", profile.summary || "");
    setText("aboutText", profile.about || "");
    if (profile.focus) setText("focusText", profile.focus);
    if (profile.email) { setLink("contactEmailRow", "contactEmail", `mailto:${profile.email}`, profile.email); }
    if (profile.phone) { setLink("contactPhoneRow", "contactPhone", `tel:${profile.phone}`, profile.phone); }
    if (profile.location) { setSpan("contactLocationRow", "contactLocation", profile.location); }
    setLink("linkGithubRow", "linkGithub", profile.links?.github, profile.links?.githubLabel || "github.com");
    setLink("linkLinkedinRow", "linkLinkedin", profile.links?.linkedin, profile.links?.linkedinLabel || "linkedin.com");
    setLink("linkWebsiteRow", "linkWebsite", profile.links?.website, profile.links?.websiteLabel || "website");
  } catch {
    // Keep defaults
  }
  
  try {
    const data = await loadJson(CERTS_URL);
    const all = Array.isArray(data) ? data : data.items || [];
    const normalized = all.filter((c) => c && (c.file || c.title || c.url)).map((c) => ({
      file: c.file || "",
      title: c.title || "",
      url: c.url || "",
    }));
    renderCertificates(normalized);
    initCertSearch(normalized);
    const titles = normalized.map((c) => c.title || prettifyFilename(c.file));
    const chips = inferChipsFromCertTitles(titles);
    renderChips(chips);
  } catch {
    renderCertificates([]);
  }
}

main();
