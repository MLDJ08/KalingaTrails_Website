/* Kalinga Trails — browser-only interactive prototype. Data is local to this browser.
   Not suitable for real customer records or secure authentication. */
(() => {
  "use strict";
  const KEY = "kalinga-trails-demo-v3";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const today = () => new Date().toISOString().slice(0, 10);
  const future = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const image = (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
  function initial() {
    return {
      users: [
        {
          id: 1,
          name: "Alex Rivera",
          email: "guide@kalinga.demo",
          role: "guide",
          bio: "Local hiking guide",
          level: "Experienced",
        },
        {
          id: 2,
          name: "Kalinga Administrator",
          email: "admin@kalinga.demo",
          role: "admin",
          bio: "",
          level: "",
        },
      ],
      session: null,
      nextId: 25,
      trails: [
        {
          id: 1,
          name: "Mount Ulap Adventure",
          location: "Itogon, Benguet",
          difficulty: "Moderate",
          distance: 8,
          elevation: 1846,
          duration: "4–5 hours",
          description: "Scenic mountain ridge experience with guided support.",
          image: image("photo-1551632811-561732d1e306"),
          meeting: "Mount Ulap trailhead gate",
          bring: "Water, food, sturdy shoes, sun protection and rain gear",
        },
        {
          id: 2,
          name: "Forest Ridge Walk",
          location: "Baguio, Benguet",
          difficulty: "Easy",
          distance: 5,
          elevation: 900,
          duration: "3 hours",
          description: "A relaxed nature trail for beginner hikers.",
          image: image("photo-1448375240586-882707db888b"),
          meeting: "Forest Ridge visitor center",
          bring: "Water, snacks and walking shoes",
        },
        {
          id: 3,
          name: "Highland Summit",
          location: "Benguet",
          difficulty: "Challenging",
          distance: 11,
          elevation: 2100,
          duration: "6–7 hours",
          description: "A demanding full-day mountain hike.",
          image: image("photo-1464278533981-50106e6176b1"),
          meeting: "Highland base camp",
          bring:
            "2L water, trail snacks, rain jacket, headlamp and first-aid kit",
        },
      ],
      hikes: [
        {
          id: 1,
          trailId: 1,
          date: future(12),
          capacity: 12,
          guideId: 1,
          status: "active",
          weather: "Check the local weather forecast before departure.",
        },
        {
          id: 2,
          trailId: 2,
          date: future(15),
          capacity: 15,
          guideId: 1,
          status: "active",
          weather: "Weather may change; bring rain protection.",
        },
        {
          id: 3,
          trailId: 3,
          date: future(21),
          capacity: 8,
          guideId: 1,
          status: "active",
          weather: "Summit weather can change quickly.",
        },
      ],
      bookings: [],
      notifications: [],
      posts: [],
      comments: [],
      kudos: [],
      friends: [],
      achievements: [
        {
          id: 1,
          name: "First Trail",
          count: 1,
          description: "Complete your first verified Kalinga Trails hike.",
        },
        {
          id: 2,
          name: "Trail Explorer",
          count: 5,
          description: "Complete 5 verified Kalinga Trails hikes.",
        },
        {
          id: 3,
          name: "Summit Seeker",
          count: 10,
          description: "Complete 10 verified Kalinga Trails hikes.",
        },
      ],
      inquiries: [],
      gallery: [],
      content: {
        headline: "Sa Bawat Lakad, Kalinga ang Kasama!",
        featured: [1, 2, 3],
      },
    };
  }
  let state;
  try {
    state = JSON.parse(localStorage.getItem(KEY)) || initial();
  } catch {
    state = initial();
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      toast("Storage is full. Use smaller photos or clear demo data.", true);
    }
  }
  const next = () => state.nextId++;
  const me = () => state.users.find((u) => u.id === state.session) || null;
  const trail = (id) => state.trails.find((t) => t.id === Number(id));
  const hike = (id) => state.hikes.find((h) => h.id === Number(id));
  const slots = (h) =>
    Math.max(
      0,
      h.capacity -
        state.bookings
          .filter(
            (b) =>
              b.hikeId === h.id &&
              !["cancelled", "rejected"].includes(b.status),
          )
          .reduce((n, b) => n + b.participants.length, 0),
    );
  const hikeTitle = (h) => trail(h?.trailId)?.name || "Removed trail";
  const who = (id) => state.users.find((u) => u.id === id);
  const fullDate = (v) =>
    v
      ? new Date(`${v}T12:00:00`).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";
  const notice = (userId, message) => {
    state.notifications.unshift({
      id: next(),
      userId,
      message,
      date: new Date().toISOString(),
      read: false,
    });
  };
  function toast(message, error = false) {
    let x = $("#kt-toast");
    if (!x) {
      x = document.createElement("div");
      x.id = "kt-toast";
      x.setAttribute("role", "status");
      document.body.append(x);
    }
    x.textContent = message;
    x.className = error ? "error show" : "show";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => (x.className = ""), 4500);
  }
  function updateNav() {
    const nav = $(".nav-actions");
    if (!nav) return;
    const u = me();
    nav.innerHTML = u
      ? `<a class="btn btn-outline" href="dashboard.html">${esc(u.name.split(" ")[0])}'s Dashboard</a><button class="btn btn-primary" type="button" data-action="logout">Log Out</button>`
      : '<a class="btn btn-outline" href="auth.html">Log In</a><a class="btn btn-primary" href="auth.html?mode=signup">Sign Up</a>';
  }
  function guard(role) {
    const u = me();
    if (!u) {
      location.href =
        "auth.html?next=" +
        encodeURIComponent(
          location.pathname.split("/").pop() + location.search,
        );
      return false;
    }
    if (role && u.role !== role) {
      location.href = "dashboard.html";
      return false;
    }
    return true;
  }
  function field(label, name, type = "text", value = "", more = "") {
    return `<label class="kt-field">${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" ${more}></label>`;
  }
  function select(label, name, options, value) {
    return `<label class="kt-field">${esc(label)}<select name="${name}">${options.map(([v, l]) => `<option value="${esc(v)}" ${String(value) === String(v) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
  }
  function panel(title, content) {
    return `<section class="kt-panel"><h2>${esc(title)}</h2>${content}</section>`;
  }
  function empty(message) {
    return `<p class="kt-muted">${esc(message)}</p>`;
  }
  function stats(items) {
    return `<div class="kt-stats">${items.map(([name, value]) => `<div class="kt-stat"><span>${esc(name)}</span><strong>${esc(value)}</strong></div>`).join("")}</div>`;
  }
  function badge(txt) {
    return `<span class="tag">${esc(txt)}</span>`;
  }
  function btn(action, label, id = "", cls = "btn btn-secondary") {
    return `<button type="button" class="${cls}" data-action="${action}" ${id !== "" ? `data-id="${esc(id)}"` : ""}>${esc(label)}</button>`;
  }
  function formValues(el) {
    return Object.fromEntries(new FormData(el).entries());
  }
  function displayAuth() {
    const wrap = $("#auth-app");
    if (!wrap) return;
    const signing =
      new URLSearchParams(location.search).get("mode") === "signup";
    wrap.innerHTML = `<div class="kt-panel kt-auth"><h2>${signing ? "Create a hiker account" : "Welcome back"}</h2><p class="kt-muted">Browser-only classroom demonstration. Do not enter real passwords or medical details.</p><form id="auth-form"><div class="kt-fields">${signing ? field("Full name", "name", "text", "", 'required minlength="2" maxlength="80"') : ""}${field("Email", "email", "email", "", "required")}${field("Password", "password", "password", "", 'required minlength="6" maxlength="100" autocomplete="' + (signing ? "new-password" : "current-password") + '"')}</div><label class="kt-show-password"><input type="checkbox" id="kt-show-password"> Show password</label><button class="btn btn-primary" type="submit">${signing ? "Sign Up" : "Log In"}</button></form><p style="margin-top:16px">${signing ? "Already registered?" : "New to Kalinga Trails?"} <a class="kt-link" href="auth.html${signing ? "" : "?mode=signup"}">${signing ? "Log in" : "Create an account"}</a></p><hr class="kt-separator"><h3>Local demo access</h3><p class="kt-muted">These shortcuts only simulate roles in this browser. They are not secure logins.</p><div class="kt-actions">${btn("demo-role", "Preview Guide Dashboard", "guide")}${btn("demo-role", "Preview Admin Dashboard", "admin")}</div></div>`;
    $("#kt-show-password")?.addEventListener("change", (e) => {
      const input = $('#auth-form [name="password"]');
      if (input) input.type = e.target.checked ? "text" : "password";
    });
    $("#auth-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = formValues(e.target),
        email = v.email.trim().toLowerCase();
      if (!e.target.reportValidity()) return;
      let u = state.users.find((x) => x.email === email);
      if (signing) {
        if (u) return toast("An account with that email exists.", true);
        u = {
          id: next(),
          name: v.name.trim(),
          email,
          role: "hiker",
          bio: "",
          level: "Beginner",
          photo: "",
          pass: await digest(v.password + email),
        };
        state.users.push(u);
        notice(u.id, "Welcome to Kalinga Trails!");
      } else {
        if (
          !u ||
          u.role !== "hiker" ||
          u.pass !== (await digest(v.password + email))
        )
          return toast("Email or password is incorrect.", true);
      }
      state.session = u.id;
      save();
      location.href = safeNext();
    });
  }
  function safeNext() {
    const requested = new URLSearchParams(location.search).get("next") || "";
    return /^(book\.html\?hike=\d+|dashboard\.html)$/.test(requested)
      ? requested
      : "dashboard.html";
  }
  async function digest(s) {
    const arr = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(s),
    );
    return [...new Uint8Array(arr)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  }
  function renderTrails() {
    const host = $("#kt-trail-list");
    if (!host) return;
    const dif = $("#difficulty-filter")?.value || "",
      loc = ($("#location-filter")?.value || "").toLowerCase(),
      date = $("#date-filter")?.value || "";
    let count = 0;
    host.innerHTML = state.hikes
      .filter((h) => h.status === "active")
      .map((h) => ({ h, t: trail(h.trailId) }))
      .filter(
        ({ h, t }) =>
          t &&
          (!dif || t.difficulty === dif) &&
          (!loc || t.location.toLowerCase().includes(loc)) &&
          (!date || h.date >= date),
      )
      .map(({ h, t }) => {
        count++;
        return `<article class="card"><img class="card-image" src="${esc(t.image)}" alt="${esc(t.name)} mountain trail"><div class="card-body">${badge(t.difficulty)}<h3>${esc(t.name)}</h3><p>${esc(t.description)}</p><div class="card-meta">${badge(t.distance + " km")}${badge("Elevation " + t.elevation + " m")}${badge(t.duration)}${badge(slots(h) + " slots")}</div><p><strong>Schedule:</strong> ${fullDate(h.date)}</p><p><strong>Location:</strong> ${esc(t.location)}</p><p><strong>Guide:</strong> ${esc(who(h.guideId)?.name || "To be assigned")}</p><a class="btn btn-primary" href="hike-details.html?hike=${h.id}">View Hike</a></div></article>`;
      })
      .join("");
    $("#kt-no-results").hidden = !!count;
  }
  // The prototype has no GPS tracks or surveyed trail coordinates. This
  // downloadable overview intentionally contains no invented trail route.
  function mapLines(value, maxCharacters = 39, maxLines = 2) {
    const words = String(value ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const lines = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxCharacters) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current =
          word.length > maxCharacters
            ? word.slice(0, maxCharacters - 1) + "…"
            : word;
      }
    }
    if (current) lines.push(current);
    if (!lines.length) return ["—"];
    if (lines.length > maxLines) {
      lines.length = maxLines;
      lines[maxLines - 1] = lines[maxLines - 1].replace(/…$/, "") + "…";
    }
    return lines;
  }
  function mapSvgLines(
    value,
    x,
    y,
    maxCharacters = 39,
    maxLines = 2,
    step = 31,
  ) {
    return mapLines(value, maxCharacters, maxLines)
      .map(
        (line, i) => `<tspan x="${x}" y="${y + i * step}">${esc(line)}</tspan>`,
      )
      .join("");
  }
  function trailMapSvg(t, h) {
    // A self-contained SVG can be previewed, saved, and opened without a map API.
    // Decorative contour shapes do NOT represent real trail or terrain data.
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680" role="img" aria-label="Illustrative trail location overview for ${esc(t.name)}">
      <title>${esc(t.name)} — illustrative trail overview</title>
      <desc>General trail information for ${esc(t.location)}. No GPS route or surveyed map data is available. Not suitable for navigation.</desc>
      <defs>
        <linearGradient id="kt-map-terrain" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#e4ece3"/><stop offset="1" stop-color="#c2d7cb"/></linearGradient>
        <clipPath id="kt-map-clip"><rect x="48" y="170" width="904" height="302" rx="22"/></clipPath>
      </defs>
      <rect width="1000" height="680" fill="#f8f7f3"/>
      <rect width="1000" height="14" fill="#2f5d50"/>
      <text x="48" y="55" fill="#2f5d50" font-family="Arial,sans-serif" font-weight="700" font-size="19" letter-spacing="3">KALINGA TRAILS</text>
      <text x="951" y="55" text-anchor="end" fill="#486b7a" font-family="Arial,sans-serif" font-size="17">TRAIL OVERVIEW</text>
      <text fill="#242424" font-family="Arial,sans-serif" font-size="38" font-weight="700">${mapSvgLines(t.name, 48, 110, 45, 2, 37)}</text>
      <rect x="48" y="170" width="904" height="302" rx="22" fill="url(#kt-map-terrain)"/>
      <g clip-path="url(#kt-map-clip)">
        <path d="M-15 410 Q140 235 270 345 T575 308 T1045 260 V485 H-15Z" fill="#91b1a0" opacity=".4"/>
        <path d="M-10 480 Q165 305 335 423 T690 335 T1010 390 V495 H-10Z" fill="#6b9b85" opacity=".35"/>
        <g fill="none" stroke="#557d6a" stroke-width="2.2" opacity=".31">
          <ellipse cx="192" cy="300" rx="235" ry="115" transform="rotate(-19 192 300)"/>
          <ellipse cx="192" cy="300" rx="200" ry="87" transform="rotate(-19 192 300)"/>
          <ellipse cx="192" cy="300" rx="165" ry="60" transform="rotate(-19 192 300)"/>
          <ellipse cx="782" cy="370" rx="260" ry="135" transform="rotate(14 782 370)"/>
          <ellipse cx="782" cy="370" rx="218" ry="105" transform="rotate(14 782 370)"/>
          <ellipse cx="782" cy="370" rx="174" ry="74" transform="rotate(14 782 370)"/>
        </g>
      </g>
      <rect x="80" y="199" width="224" height="37" rx="18" fill="#f8f7f3" opacity=".96"/>
      <text x="100" y="224" fill="#2f5d50" font-family="Arial,sans-serif" font-size="15" font-weight="700">ILLUSTRATIVE TERRAIN</text>
      <rect x="80" y="296" width="570" height="127" rx="18" fill="#ffffff" opacity=".92"/>
      <text x="102" y="331" fill="#486b7a" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="1">TRAIL LOCATION</text>
      <text fill="#203b2d" font-family="Arial,sans-serif" font-size="31" font-weight="700">${mapSvgLines(t.location, 102, 372, 32, 2, 33)}</text>
      <text x="720" y="433" fill="#203b2d" font-family="Arial,sans-serif" font-size="16" font-weight="700">NO GPS ROUTE</text>
      <text x="720" y="454" fill="#203b2d" font-family="Arial,sans-serif" font-size="16" font-weight="700">PROVIDED</text>
      <rect x="48" y="495" width="904" height="92" rx="16" fill="#ffffff" stroke="#d9ddd8"/>
      <g font-family="Arial,sans-serif">
        <text x="75" y="523" fill="#486b7a" font-size="15">DISTANCE</text>
        <text x="75" y="555" fill="#242424" font-size="23" font-weight="700">${esc(t.distance)} km</text>
        <text x="286" y="523" fill="#486b7a" font-size="15">DIFFICULTY</text>
        <text x="286" y="555" fill="#242424" font-size="23" font-weight="700">${esc(t.difficulty)}</text>
        <text x="527" y="523" fill="#486b7a" font-size="15">ELEVATION</text>
        <text x="527" y="555" fill="#242424" font-size="23" font-weight="700">${esc(t.elevation)} m</text>
        <text x="750" y="523" fill="#486b7a" font-size="15">SCHEDULE</text>
        <text x="750" y="555" fill="#242424" font-size="18" font-weight="700">${esc(fullDate(h.date))}</text>
      </g>
      <text x="48" y="621" fill="#2f5d50" font-family="Arial,sans-serif" font-size="17" font-weight="700">For planning only — NOT a navigation map.</text>
      <text x="48" y="647" fill="#5d6460" font-family="Arial,sans-serif" font-size="16">There is no verified route data. Follow your guide and request an official trail map.</text>
    </svg>`;
  }
  function trailDownloadSvg(t, h) {
    const seedSource = `${t?.name || "Trail"}|${t?.location || "Location"}|${h?.date || "Date"}`;
    let seed = 0;
    for (let i = 0; i < seedSource.length; i += 1) {
      seed = (seed * 31 + seedSource.charCodeAt(i)) >>> 0;
    }
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const formatRoutePoint = (value) => value.toFixed(1);
    const routePoints = [];
    let x = 140 + random() * 90;
    let y = 690 + random() * 80;
    routePoints.push([x, y]);
    for (let i = 1; i < 9; i += 1) {
      x += 95 + random() * 85;
      y += (random() - 0.5) * 190 - 20;
      x = Math.max(120, Math.min(940, x));
      y = Math.max(120, Math.min(760, y));
      routePoints.push([x, y]);
    }
    routePoints[routePoints.length - 1][0] = Math.max(
      routePoints[routePoints.length - 1][0],
      895,
    );
    routePoints[routePoints.length - 1][1] = 135 + random() * 90;

    const routePath = routePoints
      .map((coords, index) => {
        const [px, py] = coords;
        if (index === 0)
          return `M ${formatRoutePoint(px)} ${formatRoutePoint(py)}`;
        const [prevX, prevY] = routePoints[index - 1];
        const cp1x = prevX + (px - prevX) * (0.28 + random() * 0.18);
        const cp1y = prevY + (random() - 0.5) * 96;
        const cp2x = prevX + (px - prevX) * (0.64 + random() * 0.18);
        const cp2y = py + (random() - 0.5) * 96;
        return `C ${formatRoutePoint(cp1x)} ${formatRoutePoint(cp1y)} ${formatRoutePoint(cp2x)} ${formatRoutePoint(cp2y)} ${formatRoutePoint(px)} ${formatRoutePoint(py)}`;
      })
      .join(" ");

    const contourPaths = Array.from({ length: 12 }, (_, index) => {
      const startX = -80 + random() * 180;
      const startY = 95 + index * 54 + random() * 40;
      const c1x = 260 + random() * 180;
      const c1y = startY - 85 + random() * 140;
      const c2x = 640 + random() * 180;
      const c2y = startY - 85 + random() * 140;
      const endX = 1080 - random() * 70;
      const endY = startY + (random() - 0.5) * 48;
      return `<path d="M ${formatRoutePoint(startX)} ${formatRoutePoint(startY)} C ${formatRoutePoint(c1x)} ${formatRoutePoint(c1y)} ${formatRoutePoint(c2x)} ${formatRoutePoint(c2y)} ${formatRoutePoint(endX)} ${formatRoutePoint(endY)}"/>`;
    }).join("");

    const treeClusters = Array.from({ length: 15 }, () => {
      const tx = 120 + random() * 800;
      const ty = 120 + random() * 610;
      const scale = 0.8 + random() * 0.75;
      return `<g transform="translate(${formatRoutePoint(tx)} ${formatRoutePoint(ty)}) scale(${scale.toFixed(2)})">
        <circle cx="0" cy="0" r="16" fill="#6d9a7b" opacity="0.92"/>
        <circle cx="12" cy="-12" r="14" fill="#80ab8c" opacity="0.92"/>
        <circle cx="-12" cy="-10" r="13" fill="#7ba889" opacity="0.92"/>
        <rect x="-3.5" y="9" width="7" height="20" rx="2" fill="#7e6048"/>
      </g>`;
    }).join("");

    const lakeShapes = Array.from({ length: 3 }, () => {
      const lx = 170 + random() * 670;
      const ly = 180 + random() * 500;
      const rx = 50 + random() * 80;
      const ry = 24 + random() * 46;
      const rot = -30 + random() * 60;
      return `<ellipse cx="${formatRoutePoint(lx)}" cy="${formatRoutePoint(ly)}" rx="${formatRoutePoint(rx)}" ry="${formatRoutePoint(ry)}" transform="rotate(${rot.toFixed(1)} ${formatRoutePoint(lx)} ${formatRoutePoint(ly)})" fill="#cfe6e6" stroke="#9dc4c6" stroke-width="2" opacity="0.8"/>`;
    }).join("");

    const waypointDots = routePoints
      .slice(1, -1)
      .map(([px, py], index) => {
        const label = index + 1;
        return `<g>
        <circle cx="${formatRoutePoint(px)}" cy="${formatRoutePoint(py)}" r="8.5" fill="#fff8ee" stroke="#275346" stroke-width="2.8"/>
        <text x="${formatRoutePoint(px + 16)}" y="${formatRoutePoint(py - 12)}" fill="#275346" font-family="Arial,sans-serif" font-size="13" font-weight="700">WP ${label}</text>
      </g>`;
      })
      .join("");

    const [startX, startY] = routePoints[0];
    const [endX, endY] = routePoints[routePoints.length - 1];
    const profileHeights = Array.from({ length: 8 }, (_, index) => {
      const progress = index / 7;
      return (
        95 -
        (Math.sin(progress * Math.PI * 1.35 + random()) * 22 +
          random() * 16 +
          index * 2.4)
      );
    });
    const profilePoints = profileHeights
      .map((value, index) => `${76 + index * 33},${value.toFixed(1)}`)
      .join(" ");
    const safeDistance = Number(t?.distance) || 4 + Math.round(random() * 8);
    const safeElevation =
      Number(t?.elevation) || 600 + Math.round(random() * 700);
    const estHours = Math.max(2, Math.round(safeDistance / 2 + random() * 3));
    const stageNames = [
      "Trailhead",
      "Pine Bend",
      "Ridge Turn",
      "View Deck",
      "Summit Zone",
    ];

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000" width="1400" height="1000" role="img" aria-label="Detailed trail map">
      <defs>
        <linearGradient id="kt-dl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f7faf5"/>
          <stop offset="1" stop-color="#edf3ed"/>
        </linearGradient>
        <linearGradient id="kt-route-shadow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#95b6a3"/>
          <stop offset="1" stop-color="#c5d8cb"/>
        </linearGradient>
      </defs>
      <rect width="1400" height="1000" fill="url(#kt-dl-bg)"/>
      <rect x="34" y="34" width="1332" height="932" rx="28" fill="#fbfcf9" stroke="#bccabf" stroke-width="3"/>
      <text x="74" y="86" fill="#2f5d50" font-family="Arial,sans-serif" font-size="18" letter-spacing="4" font-weight="700">KALINGA TRAILS</text>
      <text x="74" y="138" fill="#1f2e2b" font-family="Arial,sans-serif" font-size="42" font-weight="700">Adventure Trail Map</text>
      <text x="74" y="172" fill="#4b5b55" font-family="Arial,sans-serif" font-size="20">${esc(t?.name || "Scenic Route")} · ${esc(t?.location || "Mountain Region")}</text>
      <text x="1230" y="86" text-anchor="end" fill="#587569" font-family="Arial,sans-serif" font-size="17" font-weight="700" letter-spacing="2">FIELD COPY</text>
      <text x="1230" y="114" text-anchor="end" fill="#6a7772" font-family="Arial,sans-serif" font-size="15">Generated for confirmed booking</text>

      <rect x="70" y="210" width="960" height="690" rx="24" fill="#dfe9df" stroke="#c3d1c5" stroke-width="3"/>
      <g opacity="0.22" stroke="#93aa98" stroke-width="1.4">
        ${Array.from({ length: 10 }, (_, i) => `<line x1="70" y1="${260 + i * 60}" x2="1030" y2="${260 + i * 60}"/>`).join("")}
        ${Array.from({ length: 12 }, (_, i) => `<line x1="${120 + i * 75}" y1="210" x2="${120 + i * 75}" y2="900"/>`).join("")}
      </g>
      <g fill="none" stroke="#99ae9d" stroke-width="3" opacity="0.65">${contourPaths}</g>
      <g>${lakeShapes}</g>
      <g>${treeClusters}</g>
      <path d="${routePath}" fill="none" stroke="url(#kt-route-shadow)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
      <path d="${routePath}" fill="none" stroke="#fff5e4" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${routePath}" fill="none" stroke="#29594a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="18 14"/>
      ${waypointDots}
      <g>
        <circle cx="${formatRoutePoint(startX)}" cy="${formatRoutePoint(startY)}" r="18" fill="#ffffff" stroke="#2f5d50" stroke-width="5"/>
        <circle cx="${formatRoutePoint(startX)}" cy="${formatRoutePoint(startY)}" r="6" fill="#2f5d50"/>
        <text x="${formatRoutePoint(startX + 22)}" y="${formatRoutePoint(startY + 6)}" fill="#2f5d50" font-family="Arial,sans-serif" font-size="16" font-weight="700">START · ${stageNames[0]}</text>
      </g>
      <g>
        <circle cx="${formatRoutePoint(endX)}" cy="${formatRoutePoint(endY)}" r="21" fill="#ffffff" stroke="#c96a3d" stroke-width="6"/>
        <circle cx="${formatRoutePoint(endX)}" cy="${formatRoutePoint(endY)}" r="7" fill="#c96a3d"/>
        <text x="${formatRoutePoint(endX - 18)}" y="${formatRoutePoint(endY - 28)}" text-anchor="end" fill="#9a562f" font-family="Arial,sans-serif" font-size="16" font-weight="700">FINISH · ${stageNames[4]}</text>
      </g>

      <rect x="1060" y="210" width="268" height="325" rx="20" fill="#ffffff" stroke="#d7dfd8" stroke-width="2.5"/>
      <text x="1090" y="250" fill="#355f52" font-family="Arial,sans-serif" font-size="22" font-weight="700">Trail Snapshot</text>
      <text x="1090" y="286" fill="#64736d" font-family="Arial,sans-serif" font-size="15">Type</text>
      <text x="1090" y="312" fill="#1e2d29" font-family="Arial,sans-serif" font-size="24" font-weight="700">Guided Scenic Route</text>
      <text x="1090" y="354" fill="#64736d" font-family="Arial,sans-serif" font-size="15">Distance</text>
      <text x="1090" y="382" fill="#1e2d29" font-family="Arial,sans-serif" font-size="24" font-weight="700">${esc(String(safeDistance))} km</text>
      <text x="1090" y="423" fill="#64736d" font-family="Arial,sans-serif" font-size="15">Elevation Gain</text>
      <text x="1090" y="451" fill="#1e2d29" font-family="Arial,sans-serif" font-size="24" font-weight="700">${esc(String(safeElevation))} m</text>
      <text x="1090" y="492" fill="#64736d" font-family="Arial,sans-serif" font-size="15">Estimated Time</text>
      <text x="1090" y="520" fill="#1e2d29" font-family="Arial,sans-serif" font-size="24" font-weight="700">${esc(String(estHours))} hrs</text>

      <rect x="1060" y="556" width="268" height="156" rx="20" fill="#ffffff" stroke="#d7dfd8" stroke-width="2.5"/>
      <text x="1090" y="595" fill="#355f52" font-family="Arial,sans-serif" font-size="22" font-weight="700">Legend</text>
      <line x1="1092" y1="630" x2="1162" y2="630" stroke="#29594a" stroke-width="7" stroke-dasharray="16 13" stroke-linecap="round"/>
      <text x="1178" y="636" fill="#23332f" font-family="Arial,sans-serif" font-size="15">Main hiking route</text>
      <circle cx="1100" cy="667" r="8" fill="#fff8ee" stroke="#29594a" stroke-width="2.5"/>
      <text x="1178" y="672" fill="#23332f" font-family="Arial,sans-serif" font-size="15">Waypoint / rest stop</text>
      <rect x="1090" y="693" width="26" height="16" rx="8" fill="#cfe6e6" stroke="#9dc4c6" stroke-width="2"/>
      <text x="1178" y="706" fill="#23332f" font-family="Arial,sans-serif" font-size="15">Water or open feature</text>

      <rect x="1060" y="734" width="268" height="166" rx="20" fill="#ffffff" stroke="#d7dfd8" stroke-width="2.5"/>
      <text x="1090" y="773" fill="#355f52" font-family="Arial,sans-serif" font-size="22" font-weight="700">Compass</text>
      <circle cx="1190" cy="836" r="48" fill="#f6faf5" stroke="#d5ddd6" stroke-width="3"/>
      <line x1="1190" y1="792" x2="1190" y2="880" stroke="#274b40" stroke-width="3"/>
      <line x1="1146" y1="836" x2="1234" y2="836" stroke="#274b40" stroke-width="3"/>
      <polygon points="1190,787 1203,824 1190,816 1177,824" fill="#c96a3d"/>
      <text x="1190" y="771" text-anchor="middle" fill="#274b40" font-family="Arial,sans-serif" font-size="17" font-weight="700">N</text>
      <text x="1248" y="842" text-anchor="middle" fill="#274b40" font-family="Arial,sans-serif" font-size="15" font-weight="700">E</text>
      <text x="1190" y="904" text-anchor="middle" fill="#274b40" font-family="Arial,sans-serif" font-size="15" font-weight="700">S</text>
      <text x="1131" y="842" text-anchor="middle" fill="#274b40" font-family="Arial,sans-serif" font-size="15" font-weight="700">W</text>

      <rect x="70" y="920" width="650" height="34" rx="17" fill="#e8efe7"/>
      <text x="92" y="943" fill="#486356" font-family="Arial,sans-serif" font-size="15">Suggested stages: ${stageNames.join(" · ")} · Route pattern generated for visual planning</text>

      <rect x="740" y="920" width="290" height="34" rx="17" fill="#f4eadc"/>
      <text x="760" y="943" fill="#8a5b34" font-family="Arial,sans-serif" font-size="15" font-weight="700">Not for navigation · Coordinate with your guide</text>

      <rect x="70" y="728" width="274" height="150" rx="18" fill="#ffffff" fill-opacity="0.94" stroke="#d5ddd7" stroke-width="2"/>
      <text x="94" y="762" fill="#355f52" font-family="Arial,sans-serif" font-size="20" font-weight="700">Elevation Profile</text>
      <polyline points="82,846 315,846" fill="none" stroke="#ccd7cf" stroke-width="2"/>
      <polyline points="82,790 315,790" fill="none" stroke="#e0e7e1" stroke-width="1.5"/>
      <polyline points="82,734 315,734" fill="none" stroke="#e0e7e1" stroke-width="1.5"/>
      <polyline points="${profilePoints}" fill="none" stroke="#c96a3d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="96" y="870" fill="#63716b" font-family="Arial,sans-serif" font-size="13">0 km</text>
      <text x="294" y="870" text-anchor="end" fill="#63716b" font-family="Arial,sans-serif" font-size="13">${esc(String(safeDistance))} km</text>
      <text x="92" y="807" fill="#6b7771" font-family="Arial,sans-serif" font-size="12">mid</text>
      <text x="92" y="751" fill="#6b7771" font-family="Arial,sans-serif" font-size="12">high</text>

      <rect x="362" y="728" width="320" height="150" rx="18" fill="#ffffff" fill-opacity="0.94" stroke="#d5ddd7" stroke-width="2"/>
      <text x="386" y="762" fill="#355f52" font-family="Arial,sans-serif" font-size="20" font-weight="700">Quick Notes</text>
      <text x="386" y="797" fill="#3d4b46" font-family="Arial,sans-serif" font-size="15">• Scenic route with marked waypoints and flexible pacing.</text>
      <text x="386" y="827" fill="#3d4b46" font-family="Arial,sans-serif" font-size="15">• Best used as a visual trip reference for the booking.</text>
      <text x="386" y="857" fill="#3d4b46" font-family="Arial,sans-serif" font-size="15">• Final trail movement still depends on guide direction.</text>
    </svg>`;
  }
  function downloadTrailMap(t, h) {
    const svg = trailDownloadSvg(t, h);
    const source = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(source);
    const filename = `Kalinga-Trails-${
      String(t.name)
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "") || "Trail"
    }-Map`;
    const saveFile = (fileUrl, extension) => {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `${filename}.${extension}`;
      document.body.append(link);
      link.click();
      link.remove();
    };
    const fallback = () => {
      saveFile(svgUrl, "svg");
      setTimeout(() => URL.revokeObjectURL(svgUrl), 3000);
      toast("The trail map was downloaded as SVG.");
    };
    const preview = new Image();
    preview.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1400;
        canvas.height = 1000;
        const context = canvas.getContext("2d");
        if (!context || !canvas.toBlob) return fallback();
        context.drawImage(preview, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((png) => {
          if (!png) return fallback();
          const pngUrl = URL.createObjectURL(png);
          saveFile(pngUrl, "png");
          setTimeout(() => {
            URL.revokeObjectURL(pngUrl);
            URL.revokeObjectURL(svgUrl);
          }, 3000);
          toast("Trail map downloaded as PNG.");
        }, "image/png");
      } catch {
        fallback();
      }
    };
    preview.onerror = fallback;
    preview.src = svgUrl;
  }
  function renderDetail() {
    const host = $("#kt-detail");
    if (!host) return;
    let id = Number(new URLSearchParams(location.search).get("hike")) || 1;
    const h = hike(id),
      t = h && trail(h.trailId);
    if (!t) {
      host.innerHTML = empty("This scheduled hike is not available.");
      return;
    }
    $(".page-hero h1").textContent = t.name;
    host.innerHTML = `<div><img class="details-image" src="${esc(t.image)}" alt="Scenic trail on ${esc(t.name)}"><div style="margin-top:30px"><h2>About the hike</h2><p>${esc(t.description)}</p><h3 style="margin-top:24px">What to bring</h3><p>${esc(t.bring)}</p><h3 style="margin-top:24px">Safety reminders</h3><p>Follow the assigned guide, stay with the group, respect trail rules and check conditions before departure.</p><h3 style="margin-top:24px">Weather advisory</h3><p>${esc(h.weather || "Check local weather before departure.")}</p><h3 style="margin-top:24px">Emergency contacts</h3><p>Contact your guide at the meeting point. For emergencies in the Philippines, call 911.</p></div></div><aside class="detail-panel"><h2>${esc(t.name)}</h2><div class="card-meta">${badge(t.difficulty)}${badge(slots(h) + " slots available")}</div>${[
      ["Distance", t.distance + " km"],
      ["Elevation", t.elevation + " m"],
      ["Duration", t.duration],
      ["Schedule", fullDate(h.date)],
      ["Location", t.location],
      ["Meeting Point", t.meeting],
      ["Guide", who(h.guideId)?.name || "To be assigned"],
    ]
      .map(
        ([a, b]) =>
          `<div class="detail-row"><strong>${a}</strong><span>${esc(b)}</span></div>`,
      )
      .join(
        "",
      )}<a class="btn btn-primary kt-wide" href="book.html?hike=${h.id}" ${slots(h) === 0 ? 'aria-disabled="true"' : ""}>${slots(h) ? "Book This Hike" : "Fully Booked"}</a></aside>`;
  }
  function renderBooking() {
    const host = $("#booking-app");
    if (!host) return;
    if (!guard("hiker")) return;
    const h = hike(Number(new URLSearchParams(location.search).get("hike"))),
      t = h && trail(h.trailId);
    if (!t || h.status !== "active") {
      host.innerHTML = panel(
        "Unavailable",
        'This hike is no longer accepting bookings. <a href="trails.html">View available hikes</a>',
      );
      return;
    }
    const free = slots(h);
    host.innerHTML = panel(
      "Booking confirmation",
      `<p><strong>${esc(t.name)}</strong> · ${fullDate(h.date)} · ${esc(t.meeting)}</p><p>${free} slot(s) available. Bookings remain pending until an administrator confirms them. Put your account name first in the participant list. Only the account holder's guide-verified completion affects this profile.</p>${!free ? empty("Fully booked. Please choose another hike.") : `<form id="book-form"><div class="kt-fields">${field("Number of participants", "count", "number", 1, `min="1" max="${free}" required`)}<label class="kt-field kt-full">Participant names (one per line)<textarea name="participants" required rows="3" placeholder="One full name per participant">${esc(me().name)}</textarea></label>${field("Contact phone", "phone", "tel", "", 'required minlength="7"')}${field("Emergency contact name", "emergencyName", "text", "", "required")}${field("Emergency contact phone", "emergencyPhone", "tel", "", 'required minlength="7"')}<label class="kt-field kt-full">Health declaration (demo only — do not enter sensitive medical details)<select name="health" required><option value="">Select an answer</option><option value="declared">I will inform the guide privately of any relevant concerns</option><option value="none">No concerns to declare</option></select></label><label class="kt-field kt-full">Additional notes<textarea name="notes" rows="3" maxlength="500" placeholder="Optional scheduling or accessibility notes"></textarea></label></div><label class="kt-check"><input type="checkbox" required name="agree"> I understand guide instructions and the cancellation policy.</label><button class="btn btn-primary" type="submit">Confirm Booking Request</button></form>`}`,
    );
    $("#book-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = formValues(e.target),
        names = v.participants
          .split("\n")
          .map((n) => n.trim())
          .filter(Boolean),
        count = Number(v.count);
      if (!e.target.reportValidity()) return;
      if (h.date < today()) return toast("You cannot book a past hike.", true);
      if (!Number.isInteger(count) || count < 1 || count > slots(h))
        return toast("Not enough remaining slots.", true);
      if (names.length !== count || names.some((n) => n.length < 2))
        return toast(
          "Provide exactly one valid participant name per line.",
          true,
        );
      if (names[0].toLocaleLowerCase() !== me().name.toLocaleLowerCase())
        return toast(
          "The first participant must be the account holder. Other participants do not earn account progress.",
          true,
        );
      const b = {
        id: next(),
        userId: me().id,
        hikeId: h.id,
        participants: names.map((n, i) => ({
          name: n,
          accountUserId: i === 0 ? me().id : null,
          attendance: "pending",
          completion: "pending",
        })),
        phone: v.phone.trim(),
        emergencyName: v.emergencyName.trim(),
        emergencyPhone: v.emergencyPhone.trim(),
        health: v.health,
        notes: v.notes.trim(),
        status: "pending",
        created: new Date().toISOString(),
        guideNotes: "",
        incident: "",
      };
      state.bookings.push(b);
      notice(
        me().id,
        `Booking #${b.id} requested for ${t.name}. Awaiting administrator confirmation.`,
      );
      state.users
        .filter((u) => u.role === "admin")
        .forEach((u) => notice(u.id, `New booking #${b.id} for ${t.name}.`));
      save();
      location.href = "dashboard.html?tab=bookings";
    });
  }
  function completed(u) {
    return state.bookings
      .filter((b) => b.userId === u.id && b.status === "confirmed")
      .flatMap((b) =>
        b.participants
          .filter(
            (p, i) =>
              i === 0 &&
              p.completion === "completed" &&
              p.accountUserId === u.id,
          )
          .map((p) => ({ h: hike(b.hikeId), p, b })),
      )
      .filter((x) => x.h);
  }
  function accomplishments(u) {
    const n = completed(u).length;
    return state.achievements.map((a) => ({ ...a, earned: n >= a.count }));
  }
  function myBookings(u) {
    const list = state.bookings.filter((b) => b.userId === u.id);
    return panel(
      "My Bookings",
      list.length
        ? list
            .map((b) => {
              const h = hike(b.hikeId);
              const mapButton =
                b.status === "confirmed" && h && trail(h.trailId)
                  ? btn(
                      "view-map",
                      "View Map",
                      b.id,
                      "btn btn-primary kt-view-map-btn",
                    )
                  : "";
              const cancelButton = ["pending", "confirmed"].includes(b.status)
                ? btn("cancel-booking", "Cancel booking", b.id)
                : "";
              return `<article class="kt-item kt-my-booking"><div><strong>#${b.id} · ${esc(hikeTitle(h))}</strong><p>${fullDate(h?.date)} · ${b.participants.length} participant(s) · ${badge(b.status)}</p><p>Emergency contact: ${esc(b.emergencyName)} (${esc(b.emergencyPhone)})</p><p>Health declaration: ${esc(b.health)} · Notes: ${esc(b.notes || "None")}</p></div><div class="kt-actions kt-my-booking-actions">${mapButton}${cancelButton}</div></article>`;
            })
            .join("")
        : empty(
            'You have no bookings yet. <a href="trails.html">Explore hikes</a>.',
          ),
    );
  }
  function myProfile(u) {
    return panel(
      "My Profile",
      `<form id="profile-form" class="kt-profile-form"><div class="kt-profile-top">${u.photo ? `<img class="kt-avatar" src="${esc(u.photo)}" alt="Your profile picture">` : '<div class="kt-avatar kt-avatar-fallback">⛰</div>'}<label class="kt-field">Profile picture (up to 350 KB)<input id="profile-photo" accept="image/png,image/jpeg,image/webp" type="file"></label></div><div class="kt-fields">${field("Full name", "name", "text", u.name, 'required minlength="2" maxlength="80"')}${field("Contact phone", "phone", "tel", u.phone || "")}${select(
        "Hiking level",
        "level",
        [
          ["Beginner", "Beginner"],
          ["Intermediate", "Intermediate"],
          ["Experienced", "Experienced"],
        ],
        u.level,
      )}<label class="kt-field kt-full">Bio<textarea name="bio" maxlength="300" rows="3">${esc(u.bio)}</textarea></label></div><button class="btn btn-primary" type="submit">Save Profile</button></form>`,
    );
  }
  function feedPosts() {
    return (
      state.posts
        .slice()
        .reverse()
        .map((p) => {
          const author = who(p.userId),
            comments = state.comments.filter((c) => c.postId === p.id),
            kudos = state.kudos.filter((k) => k.postId === p.id),
            hasPhoto = !!p.photo;
          return `<article class="kt-post kt-post-card"><div class="kt-post-header"><div class="kt-post-author"><h3>${esc(author?.name || "Hiker")}</h3><p class="kt-post-meta">Shared with the Kalinga Trails community</p></div>${hasPhoto ? '<span class="tag">Photo post</span>' : '<span class="tag">Post</span>'}</div><p class="kt-post-text">${esc(p.text)}</p>${hasPhoto ? `<img class="kt-post-photo" src="${esc(p.photo)}" alt="Hiking photo shared by ${esc(author?.name || "a hiker")}">` : ""}<div class="kt-actions kt-post-actions">${btn("kudo", `Kudos (${kudos.length})`, p.id)}<span class="kt-muted">${comments.length} comment${comments.length === 1 ? "" : "s"}</span></div><div class="kt-comments">${comments.length ? comments.map((c) => `<p><strong>${esc(who(c.userId)?.name || "Hiker")}:</strong> ${esc(c.text)}</p>`).join("") : '<p class="kt-muted">No comments yet.</p>'}</div>${me() ? `<form class="kt-comment-form" data-post="${p.id}"><input name="text" required maxlength="300" placeholder="Write a comment" aria-label="Comment"><button class="btn btn-secondary" type="submit">Comment</button></form>` : ""}</article>`;
        })
        .join("") ||
      empty("No community posts yet. Be the first to share an experience.")
    );
  }
  function communityPane(u) {
    return panel(
      "Friends & Activity",
      `<h3>Friend requests</h3><div class="kt-items">${
        state.friends
          .filter((f) => f.to === u.id && f.status === "pending")
          .map(
            (f) =>
              `<div class="kt-item"><strong>${esc(who(f.from)?.name)}</strong>${btn("friend-accept", "Accept", f.id)}</div>`,
          )
          .join("") || empty("No pending requests.")
      }</div><h3>Find hikers</h3><div class="kt-items">${
        state.users
          .filter((x) => x.role === "hiker" && x.id !== u.id)
          .map((x) => {
            const f = state.friends.find(
              (f) =>
                (f.from === u.id && f.to === x.id) ||
                (f.to === u.id && f.from === x.id),
            );
            return `<div class="kt-item"><strong>${esc(x.name)}</strong>${f ? badge(f.status === "accepted" ? "Friends" : "Request pending") : btn("friend-request", "Add Friend", x.id)}</div>`;
          })
          .join("") || empty("No other hikers registered in this browser.")
      }</div><h3>Share a hiking experience</h3><p class="kt-muted">Community posts are personal stories; they do not update official hiking history.</p><form id="post-form"><label class="kt-field">Your post<textarea name="text" required maxlength="600" rows="3"></textarea></label><label class="kt-field">Photo (optional, 350 KB maximum)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label><button type="submit" class="btn btn-primary">Share Post</button></form><h3>Recent activity</h3><div id="kt-posts">${feedPosts()}</div>`,
    );
  }
  function notificationsPane(u) {
    return panel(
      "Notifications",
      state.notifications
        .filter((n) => n.userId === u.id)
        .map(
          (n) =>
            `<div class="kt-item"><p>${esc(n.message)}<small class="kt-muted"> · ${fullDate(n.date.slice(0, 10))}</small></p>${!n.read ? btn("read-notification", "Mark read", n.id) : badge("Read")}</div>`,
        )
        .join("") || empty("No notifications."),
    );
  }
  function hikerPane(tab, u) {
    const done = completed(u),
      totalDistance = done.reduce(
        (sum, x) => sum + (trail(x.h.trailId)?.distance || 0),
        0,
      ),
      totalElev = done.reduce(
        (sum, x) => sum + (trail(x.h.trailId)?.elevation || 0),
        0,
      );
    if (tab === "bookings") return myBookings(u);
    if (tab === "profile") return myProfile(u);
    if (tab === "history")
      return panel(
        "Hiking History & Statistics",
        stats([
          ["Verified completions", done.length],
          ["Distance", totalDistance + " km"],
          ["Elevation", totalElev + " m"],
        ]) +
          done
            .map(
              (x) =>
                `<div class="kt-item"><strong>${esc(hikeTitle(x.h))}</strong><span>${fullDate(x.h.date)} · ${esc(x.p.name)} · Guide verified</span></div>`,
            )
            .join("") +
          (done.length ? "" : empty("No guide-verified hikes yet.")),
      );
    if (tab === "achievements")
      return panel(
        "Achievements & Progress",
        `<p>${done.length} verified completions</p>${accomplishments(u)
          .map(
            (a) =>
              `<div class="kt-item"><div><strong>${a.earned ? "🏅" : "🔒"} ${esc(a.name)}</strong><p>${esc(a.description)}</p><progress value="${Math.min(done.length, a.count)}" max="${a.count}"></progress> ${Math.min(done.length, a.count)}/${a.count}</div>${badge(a.earned ? "Unlocked" : "Locked")}</div>`,
          )
          .join("")}`,
      );
    if (tab === "friends") return communityPane(u);
    if (tab === "notifications") return notificationsPane(u);
    return panel(
      "Hiker Dashboard",
      stats([
        [
          "Upcoming bookings",
          state.bookings.filter(
            (b) =>
              b.userId === u.id && ["pending", "confirmed"].includes(b.status),
          ).length,
        ],
        ["Completed hikes", done.length],
        ["Achievements", accomplishments(u).filter((a) => a.earned).length],
        [
          "Friends",
          state.friends.filter(
            (f) =>
              f.status === "accepted" && (f.to === u.id || f.from === u.id),
          ).length,
        ],
      ]) +
        `<p>Welcome, ${esc(u.name)}! Browse upcoming adventures or review your bookings and progress.</p><div class="kt-actions"><a href="trails.html" class="btn btn-primary">Explore Hikes</a><a href="dashboard.html?tab=bookings" class="btn btn-secondary">My Bookings</a></div>`,
    );
  }
  function guidePane(tab, u) {
    const assigned = state.hikes.filter((h) => h.guideId === u.id);
    const bookings = state.bookings.filter(
      (b) =>
        assigned.some((h) => h.id === b.hikeId) && b.status === "confirmed",
    );
    if (tab === "notifications") return notificationsPane(u);
    if (tab === "reports") {
      return panel(
        "Guide Reports",
        stats([
          ["Assigned hikes", assigned.length],
          ["Confirmed bookings", bookings.length],
          [
            "Present participants",
            bookings
              .flatMap((b) => b.participants)
              .filter((p) => p.attendance === "present").length,
          ],
          [
            "Completed participants",
            bookings
              .flatMap((b) => b.participants)
              .filter((p) => p.completion === "completed").length,
          ],
        ]) +
          bookings
            .map(
              (b) =>
                `<div class="kt-item"><div><strong>${esc(hikeTitle(hike(b.hikeId)))} · Booking #${b.id}</strong><p>Guide notes: ${esc(b.guideNotes || "None")}</p><p>Incident report: ${esc(b.incident || "None")}</p></div><a class="btn btn-secondary" href="dashboard.html?tab=completion&amp;booking=${b.id}">View Record</a></div>`,
            )
            .join(""),
      );
    }
    if (["participants", "attendance", "completion"].includes(tab)) {
      return guideBookingWorkspace(tab, bookings);
    }
    return panel(
      tab === "assigned" ? "Assigned Hikes" : "Guide Dashboard",
      stats([
        ["Assigned hikes", assigned.length],
        ["Confirmed bookings", bookings.length],
        ["Upcoming hikes", assigned.filter((h) => h.date >= today()).length],
      ]) +
        assigned
          .map(
            (h) =>
              `<div class="kt-item"><div><strong>${esc(hikeTitle(h))}</strong><p>${fullDate(h.date)} · ${esc(h.status)} · ${state.bookings.filter((b) => b.hikeId === h.id && b.status === "confirmed").reduce((n, b) => n + b.participants.length, 0)} confirmed participants</p></div><a class="btn btn-secondary" href="dashboard.html?tab=attendance&amp;hike=${h.id}">Check In</a></div>`,
          )
          .join(""),
    );
  }
  function guideBookingWorkspace(tab, bookings) {
    const titles = {
      participants: "Participant Lists",
      attendance: "Attendance Check-in",
      completion: "Completion Records",
    };
    const query = new URLSearchParams(location.search);
    const requested = Number(query.get("booking"));
    const booking = bookings.find((b) => b.id === requested);
    const url = (id) =>
      `dashboard.html?tab=${tab}${id ? "&amp;booking=" + id : ""}`;
    const heading =
      tab === "attendance"
        ? "Manage attendance and completion"
        : tab === "participants"
          ? "Review participant information"
          : "Review completion records";
    if (!booking) {
      const requestedHike = Number(query.get("hike"));
      const visible = requestedHike
        ? bookings.filter((b) => b.hikeId === requestedHike)
        : bookings;
      return panel(
        titles[tab],
        `<p class="kt-muted">${heading}. Choose a booking below; you can return here at any time.</p>` +
          (requestedHike
            ? `<p><a class="kt-guide-back" href="${url(null)}">← All assigned bookings</a></p>`
            : "") +
          (visible.length
            ? `<div class="kt-guide-booking-list">${visible
                .map((b) => {
                  const h = hike(b.hikeId);
                  const present = b.participants.filter(
                    (p) => p.attendance === "present",
                  ).length;
                  const finished = b.participants.filter(
                    (p) => p.completion === "completed",
                  ).length;
                  return `<article class="kt-guide-booking-card"><div class="kt-guide-booking-info"><h3>${esc(hikeTitle(h))}</h3><p>Booking #${b.id} · ${fullDate(h?.date)}</p><p>Customer: ${esc(who(b.userId)?.name || "Hiker")} · ${b.participants.length} participant(s)</p><p class="kt-muted">${present} present · ${finished} completed</p></div><a class="btn btn-primary" href="${url(b.id)}">${tab === "participants" ? "View Participants" : tab === "completion" ? "View Completion" : "Open Check-in"}</a></article>`;
                })
                .join("")}</div>`
            : empty("No confirmed bookings are available for this selection.")),
      );
    }
    const index = bookings.findIndex((b) => b.id === booking.id);
    const before = index > 0 ? bookings[index - 1] : null;
    const after = index < bookings.length - 1 ? bookings[index + 1] : null;
    const h = hike(booking.hikeId);
    const nav = `<div class="kt-guide-workspace-nav"><a class="kt-guide-back" href="${url(null)}">← Back to all bookings</a><label class="kt-field kt-guide-picker">Select booking<select id="kt-guide-booking-select" aria-label="Select a confirmed booking">${bookings.map((b) => `<option value="${b.id}" ${b.id === booking.id ? "selected" : ""}>#${b.id} · ${esc(hikeTitle(hike(b.hikeId)))}</option>`).join("")}</select></label></div>`;
    const controls = `<div class="kt-guide-pagination"><a class="btn btn-secondary" href="${before ? url(before.id) : url(null)}">${before ? "← Previous booking" : "← All bookings"}</a>${after ? `<a class="btn btn-secondary" href="${url(after.id)}">Next booking →</a>` : ""}</div>`;
    const details = `<div class="kt-guide-booking-context"><h3>${esc(hikeTitle(h))} · Booking #${booking.id}</h3><p>${fullDate(h?.date)} · Customer ${esc(who(booking.userId)?.name || "Hiker")} · Phone ${esc(booking.phone || "—")}</p><p>Emergency: ${esc(booking.emergencyName || "—")} (${esc(booking.emergencyPhone || "—")})</p><p>Health declaration: ${esc(booking.health || "—")}</p></div>`;
    const participants = booking.participants
      .map(
        (p, i) =>
          `<div class="kt-participant"><strong>${esc(p.name)}</strong>${select(
            "Attendance",
            "att-" + booking.id + "-" + i,
            [
              ["pending", "Pending"],
              ["present", "Present"],
              ["absent", "Absent"],
            ],
            p.attendance,
          )}${select(
            "Completion",
            "comp-" + booking.id + "-" + i,
            [
              ["pending", "Pending"],
              ["completed", "Completed"],
              ["not-completed", "Not completed"],
            ],
            p.completion,
          )}</div>`,
      )
      .join("");
    const form = `<div class="kt-guide-checkin-form">${participants}<label class="kt-field">Guide notes<textarea data-notes="${booking.id}" maxlength="800">${esc(booking.guideNotes || "")}</textarea></label><label class="kt-field">Incident report<textarea data-incident="${booking.id}" maxlength="800">${esc(booking.incident || "")}</textarea></label><div class="kt-actions">${btn("save-checkin", "Save attendance & completion", booking.id, "btn btn-primary")}</div></div>`;
    return panel(titles[tab], nav + details + form + controls);
  }
  function adminPane(tab, u) {
    const bs = state.bookings;
    const allParticipants = bs
      .filter((b) => b.status === "confirmed")
      .flatMap((b) => b.participants);
    if (tab === "notifications") return notificationsPane(u);
    if (tab === "bookings")
      return panel(
        "Manage Bookings",
        `<p class="kt-muted">Review the participant list, customer contact, emergency details, and booking declarations before making a decision.</p>${
          bs.length
            ? bs
                .slice()
                .reverse()
                .map(
                  (b) =>
                    `<article class="kt-item kt-booking-row"><div class="kt-booking-summary"><strong>#${b.id} · ${esc(hikeTitle(hike(b.hikeId)))}</strong><p>${esc(who(b.userId)?.name || "Unknown customer")} · ${b.participants.length} participant(s) · ${badge(b.status)}</p><p>${fullDate(hike(b.hikeId)?.date)}</p></div><div class="kt-actions">${btn("view-booking", "View Details", b.id, "btn btn-secondary")}${b.status === "pending" ? btn("confirm-booking", "Confirm", b.id, "btn btn-primary") : ""}${["pending", "confirmed"].includes(b.status) ? btn("reject-booking", "Cancel", b.id) : ""}</div></article>`,
                )
                .join("")
            : empty("No booking requests.")
        }`,
      );
    if (tab === "hikes")
      return panel(
        "Manage Scheduled Hikes",
        `<form id="admin-hike-form"><div class="kt-fields">${select(
          "Trail",
          "trailId",
          state.trails.map((t) => [t.id, t.name]),
        )}${field("Date", "date", "date", future(14), "required")}${field("Capacity", "capacity", "number", "12", 'min="1" max="100" required')}${select(
          "Assigned guide",
          "guideId",
          state.users
            .filter((u) => u.role === "guide")
            .map((u) => [u.id, u.name]),
        )}</div><button class="btn btn-primary" type="submit">Add Hike</button></form>${state.hikes.map((h) => `<div class="kt-item"><div><strong>${esc(hikeTitle(h))}</strong><p>${fullDate(h.date)} · ${slots(h)}/${h.capacity} slots · Guide: ${esc(who(h.guideId)?.name || "None")} · ${esc(h.status)}</p></div><div class="kt-actions">${btn("edit-hike", "Edit", h.id)}${btn("toggle-hike", h.status === "active" ? "Close" : "Reopen", h.id)}${btn("delete-hike", "Delete", h.id)}</div></div>`).join("")}`,
      );
    if (tab === "trails")
      return panel(
        "Manage Trails",
        `<form id="admin-trail-form"><div class="kt-fields">${field("Trail name", "name", "text", "", "required")}${field("Location", "location", "text", "", "required")}${select(
          "Difficulty",
          "difficulty",
          [
            ["Easy", "Easy"],
            ["Moderate", "Moderate"],
            ["Challenging", "Challenging"],
          ],
        )}${field("Distance (km)", "distance", "number", "5", 'min="0.1" step="0.1" required')}${field("Elevation (m)", "elevation", "number", "500", 'min="0" required')}${field("Duration", "duration", "text", "3 hours", "required")}${field("Image URL", "image", "url", image("photo-1464822759023-fed622ff2c3b"), "required")}<label class="kt-field kt-full">Description<textarea name="description" required></textarea></label>${field("Meeting point", "meeting", "text", "", "required")}${field("What to bring", "bring", "text", "", "required")}</div><button class="btn btn-primary">Add Trail</button></form>${state.trails.map((t) => `<div class="kt-item"><div><strong>${esc(t.name)}</strong><p>${esc(t.location)} · ${esc(t.difficulty)}</p></div><div class="kt-actions">${btn("edit-trail", "Edit", t.id)}${btn("delete-trail", "Delete", t.id)}</div></div>`).join("")}`,
      );
    if (tab === "customers" || tab === "guides")
      return panel(
        tab === "customers" ? "Manage Customers" : "Manage Guides",
        `${tab === "guides" ? `<form id="admin-guide-form"><div class="kt-fields">${field("Guide name", "name", "text", "", "required")}${field("Guide email", "email", "email", "", "required")}</div><button class="btn btn-primary">Add Demo Guide</button></form>` : ""}${
          state.users
            .filter((x) => x.role === (tab === "customers" ? "hiker" : "guide"))
            .map(
              (x) =>
                `<div class="kt-item"><div><strong>${esc(x.name)}</strong><p>${esc(x.email)} · ${tab === "customers" ? state.bookings.filter((b) => b.userId === x.id).length + " bookings" : state.hikes.filter((h) => h.guideId === x.id).length + " assigned hikes"}</p></div>${tab === "guides" ? `<div class="kt-actions">${btn("edit-guide", "Edit", x.id)}${btn("delete-guide", "Remove", x.id)}</div>` : `<div class="kt-actions">${btn("customer-history", "Booking history", x.id)}${btn("delete-customer", "Remove", x.id)}</div>`}</div>`,
            )
            .join("") || empty("No records yet.")
        }`,
      );
    if (tab === "achievements")
      return panel(
        "Manage Achievements",
        `<form id="admin-achievement-form"><div class="kt-fields">${field("Badge name", "name", "text", "", "required")}${field("Verified completions required", "count", "number", "1", 'min="1" required')}${field("Description", "description", "text", "", "required")}</div><button class="btn btn-primary">Add Badge</button></form>${state.achievements.map((a) => `<div class="kt-item"><div><strong>${esc(a.name)}</strong><p>${esc(a.description)} (${a.count} completions)</p></div><div class="kt-actions">${btn("edit-achievement", "Edit", a.id)}${btn("delete-achievement", "Delete", a.id)}</div></div>`).join("")}`,
      );
    if (tab === "reports") {
      const byTrail = state.trails.map((t) => [
        t.name,
        bs.filter((b) => hike(b.hikeId)?.trailId === t.id).length,
      ]);
      const booked = state.hikes.reduce((n, h) => n + h.capacity - slots(h), 0),
        capacity = state.hikes.reduce((n, h) => n + h.capacity, 0);
      return panel(
        "Operational Reports",
        stats([
          ["Total bookings", bs.length],
          [
            "Active hikes",
            state.hikes.filter((h) => h.status === "active").length,
          ],
          ["Customers", state.users.filter((x) => x.role === "hiker").length],
          ["Guides", state.users.filter((x) => x.role === "guide").length],
          [
            "Attendance rate",
            allParticipants.length
              ? Math.round(
                  (allParticipants.filter((p) => p.attendance === "present")
                    .length /
                    allParticipants.length) *
                    100,
                ) + "%"
              : "N/A",
          ],
          [
            "Completion rate",
            allParticipants.length
              ? Math.round(
                  (allParticipants.filter((p) => p.completion === "completed")
                    .length /
                    allParticipants.length) *
                    100,
                ) + "%"
              : "N/A",
          ],
          [
            "Slot utilization",
            capacity ? Math.round((booked / capacity) * 100) + "%" : "0%",
          ],
        ]) +
          `<h3>Popular trails</h3>${byTrail
            .sort((a, b) => b[1] - a[1])
            .map(
              ([t, n]) =>
                `<div class="kt-item"><span>${esc(t)}</span><strong>${n} bookings</strong></div>`,
            )
            .join("")}<h3>Guide workload</h3>${state.users
            .filter((x) => x.role === "guide")
            .map(
              (g) =>
                `<div class="kt-item"><span>${esc(g.name)}</span><strong>${state.hikes.filter((h) => h.guideId === g.id).length} hikes</strong></div>`,
            )
            .join("")}`,
      );
    }
    if (tab === "content")
      return panel(
        "Website Content",
        `<form id="admin-content-form">${field("Homepage headline", "headline", "text", state.content.headline, 'required maxlength="120"')}<h3>Featured hikes (choose up to three)</h3><p class="kt-muted">These cards appear on the public homepage and link to the next active schedule for each trail.</p><div class="featured-hike-options">${state.trails.map((t) => `<label><input type="checkbox" name="featuredTrailId" value="${t.id}" ${state.content.featured.includes(t.id) ? "checked" : ""}> ${esc(t.name)}</label>`).join("")}</div><button class="btn btn-primary" type="submit">Save Website Content</button></form><h3>Gallery photographs</h3><form id="admin-gallery-form"><div class="kt-fields">${field("Caption", "caption", "text", "", "required")}${select(
          "Category",
          "category",
          [
            ["Trails", "Trails"],
            ["Mountains", "Mountains"],
            ["Groups", "Groups"],
            ["Guides", "Guides"],
          ],
        )}${field("Photo URL", "image", "url", "", "required")}</div><button class="btn btn-primary">Add Gallery Photo</button></form>${state.gallery.map((g) => `<div class="kt-item"><strong>${esc(g.caption)}</strong>${btn("remove-gallery", "Remove", g.id)}</div>`).join("")}`,
      );
    return panel(
      "Administrator Dashboard",
      stats([
        ["Total bookings", bs.length],
        ["Pending bookings", bs.filter((b) => b.status === "pending").length],
        [
          "Active hikes",
          state.hikes.filter((h) => h.status === "active").length,
        ],
        ["Customers", state.users.filter((x) => x.role === "hiker").length],
      ]) +
        `<p>Review requests, assign guides, maintain trails, and monitor verified hiking operations.</p><div class="kt-actions"><a class="btn btn-primary" href="dashboard.html?tab=bookings">Review Bookings</a><a class="btn btn-secondary" href="dashboard.html?tab=reports">View Reports</a></div><h3>Contact inquiries</h3>${state.inquiries.map((i) => `<div class="kt-item"><div><strong>${esc(i.name)} · ${esc(i.topic)}</strong><p>${esc(i.message)}</p><small>${esc(i.email)}</small></div>${btn("delete-inquiry", "Archive", i.id)}</div>`).join("") || empty("No inquiries received in this browser.")}`,
    );
  }
  const tabConfig = {
    hiker: [
      ["overview", "Dashboard"],
      ["bookings", "My Bookings"],
      ["profile", "My Profile"],
      ["history", "Hiking History & Stats"],
      ["achievements", "Achievements"],
      ["friends", "Friends & Activity"],
      ["notifications", "Notifications"],
    ],
    guide: [
      ["overview", "Dashboard"],
      ["assigned", "Assigned Hikes"],
      ["participants", "Participant List"],
      ["attendance", "Check-in"],
      ["completion", "Completion Records"],
      ["reports", "Hike Reports"],
      ["notifications", "Notifications"],
    ],
    admin: [
      ["overview", "Dashboard"],
      ["hikes", "Manage Hikes"],
      ["trails", "Manage Trails"],
      ["bookings", "Manage Bookings"],
      ["customers", "Manage Customers"],
      ["guides", "Manage Guides"],
      ["achievements", "Manage Achievements"],
      ["reports", "Reports"],
      ["notifications", "Notifications"],
      ["content", "Website Content"],
    ],
  };
  function setDashboardHeading(u) {
    const hero = $(".page-hero");
    if (!hero) return;
    const heading = $("h1", hero),
      description = $("p:not(.eyebrow)", hero);
    const headings = {
      hiker: "Your Dashboard",
      guide: "Guide Dashboard",
      admin: "Administrator Dashboard",
    };
    const descriptions = {
      hiker: "Manage your hiking activities in one place.",
      guide: "Manage your assigned hikes, participants, and check-ins.",
      admin: "Review bookings, manage hikes, and monitor operations.",
    };
    if (heading) heading.textContent = headings[u.role] || "Your Dashboard";
    if (description)
      description.textContent = descriptions[u.role] || descriptions.hiker;
    document.title =
      (headings[u.role] || "Your Dashboard") + " | Kalinga Trails";
  }
  function renderDashboard() {
    const host = $("#dashboard-app");
    if (!host) return;
    if (!guard()) return;
    const u = me();
    setDashboardHeading(u);
    const tabs = tabConfig[u.role],
      requested = new URLSearchParams(location.search).get("tab") || "overview",
      tab = tabs.some((x) => x[0] === requested) ? requested : "overview";
    host.innerHTML = `<div class="kt-dashboard"><aside class="kt-sidebar"><div class="kt-user"><strong>${esc(u.name)}</strong><p>${esc(u.role.toUpperCase())}</p></div><label class="kt-mobile-section-control" for="kt-mobile-section"><span>Dashboard section</span><select id="kt-mobile-section" aria-label="Choose dashboard section">${tabs.map(([slug, name]) => `<option value="${slug}" ${slug === tab ? "selected" : ""}>${esc(name)}</option>`).join("")}</select></label><nav aria-label="Dashboard sections">${tabs.map(([slug, name]) => `<a class="${slug === tab ? "selected" : ""}" ${slug === tab ? 'aria-current="page"' : ""} href="dashboard.html?tab=${slug}">${esc(name)}${slug === "notifications" ? ` (${state.notifications.filter((n) => n.userId === u.id && !n.read).length})` : ""}</a>`).join("")}</nav></aside><div class="kt-dashboard-content">${u.role === "hiker" ? hikerPane(tab, u) : u.role === "guide" ? guidePane(tab, u) : adminPane(tab, u)}</div></div>`;
    bindForms();
  }
  function dashboardTabUrl(tab, bookingId = null, hikeId = null) {
    const q = new URLSearchParams({ tab });
    if (bookingId) q.set("booking", bookingId);
    else if (hikeId) q.set("hike", hikeId);
    return "dashboard.html?" + q.toString();
  }
  /* Switch dashboard tabs without reloading the entire page or jumping to the hero. */
  function navigateDashboardTab(
    nextTab,
    updateHistory = true,
    bookingId = null,
    hikeId = null,
  ) {
    const host = $("#dashboard-app");
    if (!host || !me()) return;
    const u = me();
    const tabs = tabConfig[u.role] || [];
    const tab = tabs.some(([slug]) => slug === nextTab) ? nextTab : "overview";
    const current = $(".kt-dashboard-content", host);
    if (!current) {
      if (updateHistory)
        history.pushState({ tab }, "", dashboardTabUrl(tab, bookingId, hikeId));
      renderDashboard();
      return;
    }
    if (updateHistory)
      history.pushState({ tab }, "", dashboardTabUrl(tab, bookingId, hikeId));
    const savedScroll = window.scrollY;
    current.innerHTML =
      u.role === "hiker"
        ? hikerPane(tab, u)
        : u.role === "guide"
          ? guidePane(tab, u)
          : adminPane(tab, u);
    // Keep the viewport steady while switching panels; never scroll the banner into view.
    window.scrollTo({ top: savedScroll, behavior: "instant" });
    $$(".kt-sidebar nav a", host).forEach((link) => {
      const selected = new URL(link.href).searchParams.get("tab") === tab;
      link.classList.toggle("selected", selected);
      if (selected) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const mobileSelect = $("#kt-mobile-section", host);
    if (mobileSelect) mobileSelect.value = tab;
    bindForms();
  }
  function bindForms() {
    const on = (id, fn) => {
      const el = $("#" + id);
      if (el)
        el.addEventListener("submit", (e) => {
          e.preventDefault();
          if (!e.target.reportValidity()) return;
          fn(e.target, formValues(e.target));
        });
    };
    on("profile-form", (f, v) => {
      const u = me();
      u.name = v.name.trim();
      u.phone = v.phone.trim();
      u.level = v.level;
      u.bio = v.bio.trim();
      save();
      toast("Profile updated.");
      renderDashboard();
    });
    $("#profile-photo")?.addEventListener("change", (e) =>
      upload(e.target.files[0], (photo) => {
        me().photo = photo;
        save();
        renderDashboard();
      }),
    );
    on("post-form", (f, v) => {
      const file = $("[name=photo]", f).files[0];
      const publish = (photo) => {
        state.posts.push({
          id: next(),
          userId: me().id,
          text: v.text.trim(),
          photo,
          date: new Date().toISOString(),
        });
        save();
        toast("Post shared locally.");
        renderDashboard();
      };
      if (file) upload(file, publish);
      else publish("");
    });
    $$(".kt-comment-form").forEach((f) =>
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = formValues(f);
        if (!v.text.trim()) return;
        state.comments.push({
          id: next(),
          userId: me().id,
          postId: Number(f.dataset.post),
          text: v.text.trim(),
        });
        save();
        if ($("#dashboard-app")) renderDashboard();
        else renderCommunity();
      }),
    );
    on("admin-hike-form", (f, v) => {
      const h = {
        id: next(),
        trailId: Number(v.trailId),
        date: v.date,
        capacity: Number(v.capacity),
        guideId: Number(v.guideId),
        status: "active",
        weather: "Check conditions before departure.",
      };
      if (!trail(h.trailId) || !who(h.guideId) || h.date < today())
        return toast("Choose a valid trail, guide, and future date.", true);
      state.hikes.push(h);
      notice(h.guideId, `Assigned to ${hikeTitle(h)} on ${fullDate(h.date)}.`);
      save();
      renderDashboard();
    });
    on("admin-trail-form", (f, v) => {
      state.trails.push({
        id: next(),
        name: v.name.trim(),
        location: v.location.trim(),
        difficulty: v.difficulty,
        distance: Number(v.distance),
        elevation: Number(v.elevation),
        duration: v.duration.trim(),
        description: v.description.trim(),
        image: v.image.trim(),
        meeting: v.meeting.trim(),
        bring: v.bring.trim(),
      });
      save();
      renderDashboard();
    });
    on("admin-guide-form", (f, v) => {
      if (state.users.some((u) => u.email === v.email.trim().toLowerCase()))
        return toast("Email already exists.", true);
      state.users.push({
        id: next(),
        name: v.name.trim(),
        email: v.email.trim().toLowerCase(),
        role: "guide",
        bio: "",
        level: "Experienced",
      });
      save();
      renderDashboard();
    });
    on("admin-achievement-form", (f, v) => {
      state.achievements.push({
        id: next(),
        name: v.name.trim(),
        count: Number(v.count),
        description: v.description.trim(),
      });
      save();
      renderDashboard();
    });
    on("admin-content-form", (f, v) => {
      const featured = new FormData(f).getAll("featuredTrailId").map(Number);
      if (featured.length > 3)
        return toast("Please choose no more than three featured hikes.", true);
      state.content.headline = v.headline.trim();
      state.content.featured = featured;
      save();
      toast("Homepage content saved for this browser.");
      renderDashboard();
    });
    on("admin-gallery-form", (f, v) => {
      state.gallery.push({
        id: next(),
        caption: v.caption.trim(),
        category: v.category,
        image: v.image.trim(),
      });
      save();
      renderDashboard();
    });
  }
  function upload(file, done) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 350 * 1024
    )
      return toast("Use a JPG, PNG or WebP image smaller than 350 KB.", true);
    const reader = new FileReader();
    reader.onload = () => done(reader.result);
    reader.readAsDataURL(file);
  }
  function viewBookingDetails(bookingId) {
    const u = me();
    if (!u || u.role !== "admin") return;
    const b = state.bookings.find((x) => x.id === Number(bookingId));
    if (!b) return toast("This booking could not be found.", true);
    const h = hike(b.hikeId),
      t = trail(h?.trailId),
      customer = who(b.userId),
      guide = who(h?.guideId);
    const item = (label, value) =>
      `<div class="kt-booking-fact"><dt>${esc(label)}</dt><dd>${esc(value ?? "Not provided")}</dd></div>`;
    const healthLabel =
      b.health === "none"
        ? "No concerns declared"
        : b.health === "declared"
          ? "Customer will inform the guide privately"
          : b.health || "Not provided";
    const participants = Array.isArray(b.participants) ? b.participants : [];
    const actions =
      b.status === "pending"
        ? `${btn("confirm-booking", "Confirm Booking", b.id, "btn btn-primary")}${btn("reject-booking", "Cancel Booking", b.id, "btn btn-secondary")}`
        : b.status === "confirmed"
          ? btn("reject-booking", "Cancel Booking", b.id, "btn btn-secondary")
          : "";
    const created = b.created ? new Date(b.created) : null;
    const createdLabel =
      created && !Number.isNaN(created.getTime())
        ? created.toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "Not recorded";
    const content = `<div class="kt-booking-detail" aria-labelledby="kt-booking-detail-title">
    <div class="kt-booking-detail-head"><div><p class="eyebrow">Booking review</p><h2 id="kt-booking-detail-title">Booking #${esc(b.id)}</h2><p>${esc(t?.name || "Unknown trail")}</p></div>${badge(b.status)}</div>
    <section class="kt-booking-detail-section"><h3>Hike & schedule</h3><dl class="kt-booking-facts">${item("Trail", t?.name || "Removed trail")}${item("Date", fullDate(h?.date))}${item("Location", t?.location || "Not provided")}${item("Meeting point", t?.meeting || "Not provided")}${item("Assigned guide", guide?.name || "Not assigned")}${item("Participants", participants.length)}${item("Booking submitted", createdLabel)}</dl></section>
    <section class="kt-booking-detail-section"><h3>Customer & contact</h3><dl class="kt-booking-facts">${item("Customer name", customer?.name || "Unknown customer")}${item("Customer email", customer?.email || "Not provided")}${item("Contact phone", b.phone || "Not provided")}${item("Emergency contact", b.emergencyName || "Not provided")}${item("Emergency phone", b.emergencyPhone || "Not provided")}</dl></section>
    <section class="kt-booking-detail-section"><h3>Participant information</h3><div class="kt-booking-participants">${participants.length ? participants.map((p, i) => `<div class="kt-booking-participant"><strong>${i + 1}. ${esc(p.name || "Unnamed participant")}</strong>${i === 0 ? '<span class="tag">Account holder</span>' : ""}<small>Attendance: ${esc(p.attendance || "Pending")} · Completion: ${esc(p.completion || "Pending")}</small></div>`).join("") : "<p>No participants recorded.</p>"}</div></section>
    <section class="kt-booking-detail-section"><h3>Declaration & notes</h3><dl class="kt-booking-facts">${item("Health declaration", healthLabel)}${item("Additional notes", b.notes || "None")}${item("Guide notes", b.guideNotes || "None")}${item("Incident report", b.incident || "None")}</dl></section>
    <div class="kt-booking-detail-actions">${actions}<button type="button" class="btn btn-outline" data-close-booking>Close</button></div>
  </div>`;
    modal(content, "kt-booking-dialog");
    const root = $("#kt-modal");
    $("[data-close-booking]", root)?.addEventListener("click", () =>
      root.close(),
    );
  }
  // The map overview is unlocked only for this account's confirmed booking.
  // Route/terrain geometry is illustrative because this demo has no GPS tracks.
  function viewConfirmedBookingMap(bookingId) {
    const u = me();
    const b = state.bookings.find((entry) => entry.id === Number(bookingId));
    if (
      !u ||
      u.role !== "hiker" ||
      !b ||
      b.userId !== u.id ||
      b.status !== "confirmed"
    ) {
      return toast(
        "View Map is available only for your confirmed bookings.",
        true,
      );
    }
    const h = hike(b.hikeId),
      t = h && trail(h.trailId);
    if (!h || !t)
      return toast("Map information is unavailable for this hike.", true);

    const mapSearch =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(`${t.name}, ${t.location}, Philippines`);
    modal(`<section class="kt-confirmed-map" aria-labelledby="kt-confirmed-map-title">
      <div class="kt-trail-map-heading">
        <p class="kt-trail-map-eyebrow">Confirmed booking #${esc(b.id)}</p>
        <h2 id="kt-confirmed-map-title">${esc(t.name)} — View Map</h2>
        <p>${esc(t.location)} · ${esc(fullDate(h.date))}</p>
      </div>
      <p class="kt-confirmed-map-intro">Explore the location online, or save the printable trail overview for your booking.</p>
      <div class="kt-trail-map-preview">${trailMapSvg(t, h)}</div>
      <p class="kt-trail-map-warning"><strong>Important:</strong> The downloadable overview is illustrative, not an official trail route or a navigation map. No verified GPS data is provided; follow your guide for trail directions.</p>
      <div class="kt-confirmed-map-actions">
        <button type="button" class="btn btn-primary" id="kt-download-confirmed-map">Download Map Overview (PNG)</button>
        <a class="btn btn-secondary" href="${esc(mapSearch)}" target="_blank" rel="noopener noreferrer">Open Location in Google Maps</a>
      </div>
    </section>`);
    const root = $("#kt-modal");
    $("#kt-download-confirmed-map", root)?.addEventListener("click", () => {
      const current = me();
      const activeBooking = state.bookings.find((entry) => entry.id === b.id);
      if (current?.id !== b.userId || activeBooking?.status !== "confirmed")
        return toast("This booking is not currently confirmed.", true);
      downloadTrailMap(t, h);
    });
  }
  function action(name, id) {
    const u = me(),
      b = state.bookings.find((x) => x.id === Number(id));
    if (name === "logout") {
      state.session = null;
      save();
      location.href = "index.html";
      return;
    }
    if (name === "demo-role") {
      const demo = state.users.find((x) => x.role === id);
      if (!demo) return;
      state.session = demo.id;
      save();
      location.href = "dashboard.html";
      return;
    }
    if (!u) return (location.href = "auth.html");
    if (name === "view-booking") {
      viewBookingDetails(id);
      return;
    }
    if (name === "view-map") {
      viewConfirmedBookingMap(id);
      return;
    }
    if (
      name === "cancel-booking" &&
      b &&
      b.userId === u.id &&
      ["pending", "confirmed"].includes(b.status)
    ) {
      if (!confirm("Cancel this booking?")) return;
      b.status = "cancelled";
      notice(u.id, `Booking #${b.id} was cancelled.`);
      state.users
        .filter((x) => x.role === "admin")
        .forEach((x) =>
          notice(x.id, `Booking #${b.id} cancelled by customer.`),
        );
    }
    if (
      ["confirm-booking", "reject-booking"].includes(name) &&
      u.role === "admin" &&
      b
    ) {
      if (
        name === "confirm-booking" &&
        b.status === "pending" &&
        slots(hike(b.hikeId)) < 0
      )
        return toast("Insufficient slots.", true);
      if (name === "confirm-booking" && b.status !== "pending") return;
      if (
        name === "reject-booking" &&
        !["pending", "confirmed"].includes(b.status)
      )
        return;
      if (
        name === "reject-booking" &&
        !confirm(`Cancel booking #${b.id}? The customer will be notified.`)
      )
        return;
      b.status = name === "confirm-booking" ? "confirmed" : "cancelled";
      notice(b.userId, `Booking #${b.id} ${b.status}.`);
      if (b.status === "confirmed") {
        const h = hike(b.hikeId);
        if (h?.guideId)
          notice(h.guideId, `Booking #${b.id} confirmed for ${hikeTitle(h)}.`);
      }
      const bookingDialog = $("#kt-modal.kt-booking-dialog");
      if (bookingDialog?.open) bookingDialog.close();
      toast(`Booking #${b.id} ${b.status}.`);
    }
    if (
      name === "save-checkin" &&
      u.role === "guide" &&
      b &&
      b.status === "confirmed" &&
      hike(b.hikeId)?.guideId === u.id
    ) {
      const h = hike(b.hikeId);
      if (h.date > today())
        return toast(
          "Attendance and completion can only be recorded on or after the hike date.",
          true,
        );
      const before = b.participants.filter(
        (p) => p.completion === "completed",
      ).length;
      for (let i = 0; i < b.participants.length; i++) {
        const p = b.participants[i],
          attendance = $(`[name="att-${b.id}-${i}"]`)?.value,
          completion = $(`[name="comp-${b.id}-${i}"]`)?.value;
        if (completion === "completed" && attendance !== "present")
          return toast(
            "Only present participants may be marked completed.",
            true,
          );
        p.attendance = attendance;
        p.completion = completion;
      }
      b.guideNotes = $(`[data-notes="${b.id}"]`)?.value.trim() || "";
      b.incident = $(`[data-incident="${b.id}"]`)?.value.trim() || "";
      if (
        b.participants.filter((p) => p.completion === "completed").length >
        before
      )
        notice(
          b.userId,
          `Guide verified hike completion for booking #${b.id}.`,
        );
      toast("Guide check-in and completion saved.");
    }
    if (name === "friend-request" && u.role === "hiker") {
      const other = who(Number(id));
      if (
        !other ||
        other.role !== "hiker" ||
        other.id === u.id ||
        state.friends.some(
          (f) =>
            (f.from === u.id && f.to === other.id) ||
            (f.to === u.id && f.from === other.id),
        )
      )
        return;
      state.friends.push({
        id: next(),
        from: u.id,
        to: other.id,
        status: "pending",
      });
      notice(other.id, `${u.name} sent a friend request.`);
    }
    if (name === "friend-accept") {
      const f = state.friends.find((x) => x.id === Number(id) && x.to === u.id);
      if (f) {
        f.status = "accepted";
        notice(f.from, `${u.name} accepted your friend request.`);
      }
    }
    if (name === "kudo") {
      if (u.role !== "hiker") return toast("Only hikers can give kudos.", true);
      const p = state.posts.find((p) => p.id === Number(id));
      if (!p) return;
      const ix = state.kudos.findIndex(
        (k) => k.userId === u.id && k.postId === p.id,
      );
      if (ix < 0) {
        state.kudos.push({ id: next(), userId: u.id, postId: p.id });
        if (p.userId !== u.id)
          notice(p.userId, `${u.name} gave your post kudos.`);
      } else state.kudos.splice(ix, 1);
    }
    if (name === "read-notification") {
      const n = state.notifications.find(
        (n) => n.id === Number(id) && n.userId === u.id,
      );
      if (n) n.read = true;
    }
    if (u.role === "admin") {
      if (name === "toggle-hike") {
        const h = hike(Number(id));
        if (h) {
          h.status = h.status === "active" ? "closed" : "active";
          if (h.guideId)
            notice(
              h.guideId,
              `Schedule for ${hikeTitle(h)} changed status to ${h.status}.`,
            );
        }
      }
      if (name === "delete-hike") {
        const h = hike(Number(id));
        if (h) {
          if (state.bookings.some((b) => b.hikeId === h.id))
            return toast(
              "Cannot delete a hike with booking records. Close it instead.",
              true,
            );
          if (confirm("Delete this scheduled hike?"))
            state.hikes = state.hikes.filter((x) => x.id !== h.id);
        }
      }
      if (name === "edit-hike") {
        const h = hike(Number(id));
        if (h) {
          const date = prompt("Scheduled date (YYYY-MM-DD):", h.date);
          if (date === null) return;
          if (
            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            !Number.isFinite(Date.parse(date))
          )
            return toast("Enter a valid date.", true);
          const capacity = Number(prompt("Capacity:", h.capacity));
          const reserved = h.capacity - slots(h);
          if (
            !Number.isInteger(capacity) ||
            capacity < reserved ||
            capacity > 100
          )
            return toast(`Capacity must be between ${reserved} and 100.`, true);
          const g = prompt(
            "Guide ID (" +
              state.users
                .filter((x) => x.role === "guide")
                .map((x) => `${x.id}: ${x.name}`)
                .join(", ") +
              "):",
            h.guideId,
          );
          if (!who(Number(g)) || who(Number(g)).role !== "guide")
            return toast("Invalid guide.", true);
          h.date = date;
          h.capacity = capacity;
          h.guideId = Number(g);
          notice(
            h.guideId,
            `Assignment updated for ${hikeTitle(h)}: ${fullDate(h.date)}.`,
          );
        }
      }
      if (name === "delete-trail") {
        const t = trail(Number(id));
        if (t) {
          if (state.hikes.some((h) => h.trailId === t.id))
            return toast(
              "Cannot delete a trail linked to scheduled hikes.",
              true,
            );
          if (confirm("Delete trail?"))
            state.trails = state.trails.filter((x) => x.id !== t.id);
        }
      }
      if (name === "edit-trail") {
        const t = trail(Number(id));
        if (t) {
          const nameVal = prompt("Trail name:", t.name);
          if (nameVal === null) return;
          if (!nameVal.trim()) return toast("Name is required.", true);
          t.name = nameVal.trim();
          const loc = prompt("Location:", t.location);
          if (loc !== null && loc.trim()) t.location = loc.trim();
          const description = prompt("Description:", t.description);
          if (description !== null) t.description = description.trim();
          for (const [key, label] of [
            ["distance", "Distance (km)"],
            ["elevation", "Elevation (m)"],
          ]) {
            const val = prompt(label, t[key]);
            if (val !== null) {
              if (!Number.isFinite(Number(val)) || Number(val) < 0)
                return toast("Invalid number", true);
              t[key] = Number(val);
            }
          }
          for (const [key, label] of [
            ["duration", "Duration"],
            ["meeting", "Meeting point"],
            ["bring", "What to bring"],
            ["image", "Photo URL"],
          ]) {
            const val = prompt(label, t[key]);
            if (val !== null && val.trim()) t[key] = val.trim();
          }
          const difficulty = prompt(
            "Difficulty (Easy / Moderate / Challenging):",
            t.difficulty,
          );
          if (
            difficulty !== null &&
            ["Easy", "Moderate", "Challenging"].includes(difficulty)
          )
            t.difficulty = difficulty;
        }
      }
      if (name === "customer-history") {
        const customer = who(Number(id));
        if (customer?.role === "hiker") {
          const records =
            state.bookings
              .filter((b) => b.userId === customer.id)
              .map((b) => `${hikeTitle(hike(b.hikeId))} — ${b.status}`)
              .join("\n") || "No bookings";
          alert(`${customer.name}\n${records}`);
        }
      }
      if (name === "delete-customer") {
        const customer = who(Number(id));
        if (customer?.role === "hiker") {
          if (state.bookings.some((b) => b.userId === customer.id))
            return toast(
              "Customer has booking records; deletion is blocked to preserve records.",
              true,
            );
          if (confirm("Remove this local demo customer?"))
            state.users = state.users.filter((x) => x.id !== customer.id);
        }
      }
      if (name === "edit-guide") {
        const g = who(Number(id));
        if (g?.role === "guide") {
          const nameVal = prompt("Guide name:", g.name);
          if (nameVal === null) return;
          if (!nameVal.trim()) return toast("Guide name required.", true);
          g.name = nameVal.trim();
          const email = prompt("Guide email:", g.email);
          if (email !== null) {
            const val = email.trim().toLowerCase();
            if (
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ||
              state.users.some((x) => x.id !== g.id && x.email === val)
            )
              return toast("Invalid or duplicate guide email.", true);
            g.email = val;
          }
        }
      }
      if (name === "delete-guide") {
        const g = who(Number(id));
        if (g) {
          if (state.hikes.some((h) => h.guideId === g.id))
            return toast("Reassign hikes before removing this guide.", true);
          if (confirm("Remove demo guide?"))
            state.users = state.users.filter((x) => x.id !== g.id);
        }
      }
      if (name === "delete-achievement") {
        if (confirm("Delete this achievement?"))
          state.achievements = state.achievements.filter(
            (x) => x.id !== Number(id),
          );
      }
      if (name === "edit-achievement") {
        const a = state.achievements.find((x) => x.id === Number(id));
        if (a) {
          const val = prompt("Achievement name:", a.name);
          if (val === null) return;
          const count = Number(
            prompt("Verified completions required:", a.count),
          );
          if (!val.trim() || !Number.isInteger(count) || count < 1)
            return toast("Invalid achievement.", true);
          a.name = val.trim();
          a.count = count;
          const description = prompt("Badge description:", a.description);
          if (description !== null) a.description = description.trim();
        }
      }
      if (name === "remove-gallery")
        state.gallery = state.gallery.filter((x) => x.id !== Number(id));
      if (name === "delete-inquiry")
        state.inquiries = state.inquiries.filter((x) => x.id !== Number(id));
    }
    save();
    if ($("#dashboard-app")) renderDashboard();
    if ($("#kt-community-posts")) renderCommunity();
    if ($("#kt-trail-list")) renderTrails();
    if ($("#kt-detail")) renderDetail();
  }
  function renderCommunity() {
    const target = $("#kt-community-posts");
    if (target) target.innerHTML = feedPosts();
    $$(".kt-comment-form", target || document).forEach((f) =>
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!me()) return (location.href = "auth.html");
        const v = formValues(f);
        if (!v.text.trim()) return;
        state.comments.push({
          id: next(),
          userId: me().id,
          postId: Number(f.dataset.post),
          text: v.text.trim(),
        });
        save();
        renderCommunity();
      }),
    );
  }
  function renderGallery() {
    const gallery = $(".gallery");
    if (!gallery) return;
    // Read the original sample images once. Reading them again after filtering
    // would accidentally treat previously rendered buttons as new originals.
    if (!renderGallery.originals) {
      renderGallery.originals = $$("img", gallery).map((im, i) => ({
        id: -i - 1,
        image: im.src,
        caption: im.dataset.caption || im.alt,
        category: im.dataset.category || ["Mountains", "Groups", "Trails", "Trails", "Mountains", "Guides"][i],
      }));
    }
    const all = [...renderGallery.originals, ...state.gallery];
    const category = $("#gallery-category")?.value || "";
    const visible = all.filter((x) => !category || x.category === category);
    const count = $("#gallery-count");
    if (count) count.textContent = `${visible.length} photo${visible.length === 1 ? "" : "s"} ${category ? "in " + category : "in the gallery"}`;
    gallery.innerHTML = visible.length
      ? visible.map((g) =>
          `<button class="kt-gallery-item" type="button" data-photo="${esc(g.id)}" aria-label="Enlarge ${esc(g.caption)}"><img src="${esc(g.image)}" alt="${esc(g.caption)}" loading="lazy"><span>${esc(g.caption)}</span></button>`,
        ).join("")
      : `<p class="empty-state">No photos in this category yet. Try another filter.</p>`;
    $$('[data-photo]', gallery).forEach((el) =>
      el.addEventListener("click", () => {
        const g = all.find((x) => x.id === Number(el.dataset.photo));
        if (g)
          modal(`<img class="kt-modal-image" src="${esc(g.image)}" alt="${esc(g.caption)}"><p>${esc(g.caption)}</p>`);
      }),
    );
  }
  function modal(content, extraClass = "") {
    let root = $("#kt-modal");
    if (!root) {
      root = document.createElement("dialog");
      root.id = "kt-modal";
      root.className = "kt-modal";
      document.body.append(root);
    }
    if (root.open) root.close();
    root.classList.toggle(
      "kt-booking-dialog",
      extraClass === "kt-booking-dialog",
    );
    root.innerHTML = `<button class="kt-modal-close" type="button" aria-label="Close viewer">×</button>${content}`;
    $(".kt-modal-close", root).onclick = () => root.close();
    root.onclick = (e) => {
      if (e.target === root) root.close();
    };
    if (extraClass === "kt-booking-dialog")
      root.setAttribute("aria-labelledby", "kt-booking-detail-title");
    else root.removeAttribute("aria-labelledby");
    root.showModal();
    $(".kt-modal-close", root)?.focus({ preventScroll: true });
  }
  // Company content: keep featured hike cards in sync with admin-managed
  // demo data instead of displaying permanently hard-coded schedules.
  function renderHomepageFeatured() {
    const host = $("#featured-hikes");
    if (!host) return;
    const selected = Array.isArray(state.content?.featured)
      ? state.content.featured.map(Number)
      : [1, 2, 3];
    const cards = selected.map((trailId) => {
      const t = trail(trailId);
      const nextHike = state.hikes
        .filter((h) => h.trailId === trailId && h.status === "active" && h.date >= today())
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      if (!t || !nextHike) return "";
      return `<article class="card"><img class="card-image" src="${esc(t.image)}" alt="Scenery representing ${esc(t.name)}"><div class="card-body"><span class="tag">${esc(t.difficulty)}</span><h3>${esc(t.name)}</h3><p>${esc(t.description)}</p><div class="card-meta">${badge(t.distance + " km")}${badge(t.duration)}${badge(fullDate(nextHike.date))}${badge(slots(nextHike) + " slots available")}</div><a class="btn btn-primary" href="hike-details.html?hike=${nextHike.id}">View hike details</a></div></article>`;
    }).filter(Boolean);
    host.innerHTML = cards.length ? cards.join("") : `<div class="empty-state"><p>No featured hikes are currently scheduled in this browser.</p><a class="btn btn-secondary" href="trails.html">Explore all hikes</a></div>`;
  }

  function contactForm() {
    const form = $("#contact-inquiry");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const v = formValues(form);
      if (v.message.trim().length < 10)
        return toast("Please write at least 10 characters.", true);
      state.inquiries.unshift({
        id: next(),
        name: v.name.trim(),
        email: v.email.trim(),
        topic: v.topic,
        message: v.message.trim(),
        date: new Date().toISOString(),
      });
      state.users
        .filter((u) => u.role === "admin")
        .forEach((u) => notice(u.id, `New contact inquiry from ${v.name}.`));
      save();
      form.reset();
      const feedback = $("#contact-feedback");
      if (feedback) feedback.textContent = "Demo inquiry saved in this browser. No email was sent.";
      toast("Inquiry saved in this browser. No email was sent.");
    });
  }
  function initialize() {
    if ($("#dashboard-app")) {
      document.addEventListener("click", (e) => {
        const link = e.target.closest("a[href]");
        if (
          !link ||
          !link.closest("#dashboard-app") ||
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        )
          return;
        const url = new URL(link.href, location.href);
        if (
          url.origin !== location.origin ||
          !url.pathname.endsWith("/dashboard.html")
        )
          return;
        e.preventDefault();
        navigateDashboardTab(
          url.searchParams.get("tab") || "overview",
          true,
          url.searchParams.get("booking"),
          url.searchParams.get("hike"),
        );
      });
      window.addEventListener("popstate", () =>
        navigateDashboardTab(
          new URLSearchParams(location.search).get("tab") || "overview",
          false,
        ),
      );
      document.addEventListener("change", (e) => {
        if (e.target.id === "kt-mobile-section")
          navigateDashboardTab(e.target.value);
        if (e.target.id === "kt-guide-booking-select")
          navigateDashboardTab(
            new URLSearchParams(location.search).get("tab") || "attendance",
            true,
            e.target.value,
          );
      });
    }
    // Close the mobile header menu after choosing a destination.
    $$(".nav-links a").forEach((link) =>
      link.addEventListener("click", () => {
        const toggle = $("#nav-toggle");
        if (toggle) toggle.checked = false;
      }),
    );
    updateNav();
    const headline = $("#kt-headline");
    if (headline) headline.textContent = state.content.headline;
    displayAuth();
    renderTrails();
    renderDetail();
    renderBooking();
    renderDashboard();
    renderCommunity();
    renderGallery();
    renderHomepageFeatured();
    contactForm();
    $("#difficulty-filter")?.addEventListener("change", renderTrails);
    $("#location-filter")?.addEventListener("input", renderTrails);
    $("#date-filter")?.addEventListener("change", renderTrails);
    $("#gallery-category")?.addEventListener("change", renderGallery);
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (el) {
        e.preventDefault();
        action(el.dataset.action, el.dataset.id);
      }
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize);
  else initialize();
})();
