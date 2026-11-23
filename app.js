/* Kalinga Trails — browser-only interactive prototype. Data is local to this browser.
   Not suitable for real customer records or secure authentication. */
(() => {
  "use strict";
  const KEY = "kalinga-trails-demo-v3";
  // Classroom-only starter accounts. They are not production credentials.
  const demoPasswordHashes = {
    "alex@kalinga.demo": "7f636b2cfa37d2bcf43fc4079e4a22113871be70feef69a55774a9ef5a30cb06",
    "admin@kalinga.demo": "98c70b2095b654152f2af418b6d027af845d1b7fa7d6f55d59b0088daf11f1de",
  };
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
          email: "alex@kalinga.demo",
          role: "guide",
          pass: demoPasswordHashes["alex@kalinga.demo"],
          bio: "Local hiking guide",
          level: "Experienced",
        },
        {
          id: 2,
          name: "Kalinga Administrator",
          email: "admin@kalinga.demo",
          role: "admin",
          pass: demoPasswordHashes["admin@kalinga.demo"],
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
  // Keep existing accounts and bookings. Rename only the original starter Guide.
  // Existing customized Guide passwords are upgraded after their next valid login.
  let starterAccountUpdated = false;
  for (const user of state.users) {
    if (
      user.id === 1 &&
      user.role === "guide" &&
      user.email === "guide@kalinga.demo" &&
      !state.users.some((other) => other.id !== user.id && other.email === "alex@kalinga.demo")
    ) {
      user.email = "alex@kalinga.demo";
      if (!user.pass || user.pass === "fb031472e789a99cb3b7c489bdf2f345bb8ab19a2fa37b47bf393c469b9d6b9b") {
        user.pass = demoPasswordHashes["alex@kalinga.demo"];
      }
      starterAccountUpdated = true;
    }
    if (!user.pass && user.id === 1 && user.role === "guide" && user.email === "alex@kalinga.demo") {
      user.pass = demoPasswordHashes["alex@kalinga.demo"];
      starterAccountUpdated = true;
    }
    if (!user.pass && user.id === 2 && user.role === "admin" && user.email === "admin@kalinga.demo") {
      user.pass = demoPasswordHashes["admin@kalinga.demo"];
      starterAccountUpdated = true;
    }
  }
  if (starterAccountUpdated) save();
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
    const params = new URLSearchParams(location.search);
    const currentPage = location.pathname.split("/").pop().toLowerCase();
    const pageRoles = {
      "hiker-login.html": "hiker",
      "guide-login.html": "guide",
      "admin-login.html": "admin",
    };
    const selectedRole = pageRoles[currentPage] ||
      (["hiker", "guide", "admin"].includes(params.get("role")) ? params.get("role") : "");
    const signing = params.get("mode") === "signup" && (!selectedRole || selectedRole === "hiker");
    const role = signing ? "hiker" : selectedRole;
    const nextParam = params.get("next") || "";
    const returnTo = nextParam ? `?next=${encodeURIComponent(nextParam)}` : "";
    const signUpUrl = "hiker-login.html?mode=signup" + (nextParam ? `&next=${encodeURIComponent(nextParam)}` : "");
    const hikerUrl = "hiker-login.html" + returnTo;
    const roleLabels = { hiker: "Hiker", guide: "Guide", admin: "Administrator" };
    // The normal Log In entry point lets users pick one of three separate login pages.
    // The existing auth.html?mode=signup URL remains supported for older navigation links.
    if (!role) {
      wrap.innerHTML = `<section class="kt-panel kt-auth-role-select"><p class="kt-lz-overline">Find your place on the trail</p><h2>Select your account</h2><p class="kt-muted">Choose the correct login for your role. Each account opens its own dashboard.</p><div class="kt-lz-role-grid"><a class="kt-lz-role-card" href="${hikerUrl}"><span class="kt-lz-role-symbol" aria-hidden="true">⛰</span><h3>Hiker / User</h3><p>Book adventures, view your progress and connect with hikers.</p><span class="kt-lz-role-enter">Hiker Login →</span></a><a class="kt-lz-role-card" href="guide-login.html"><span class="kt-lz-role-symbol" aria-hidden="true">🥾</span><h3>Guide</h3><p>View assigned hikes, participants, check-ins and reports.</p><span class="kt-lz-role-enter">Guide Login →</span></a><a class="kt-lz-role-card" href="admin-login.html"><span class="kt-lz-role-symbol" aria-hidden="true">🗺</span><h3>Administrator</h3><p>Manage bookings, guides, customers and trail operations.</p><span class="kt-lz-role-enter">Admin Login →</span></a></div><p class="kt-lz-role-signup">New hiker? <a class="kt-link" href="${signUpUrl}">Create a Hiker Account</a></p><p class="kt-muted kt-lz-role-note">Local classroom prototype. Please do not use real account passwords or sensitive personal information.</p></section>`;
      return;
    }
    const demo = role === "guide"
      ? '<p class="kt-muted">Guide demo: <strong>alex@kalinga.demo</strong> / <strong>GuideDemo2026!</strong></p>'
      : role === "admin"
        ? '<p class="kt-muted">Admin demo: <strong>admin@kalinga.demo</strong> / <strong>AdminDemo2026!</strong></p>'
        : "";
    wrap.innerHTML = `<div class="kt-panel kt-auth"><p class="kt-lz-overline">${esc(roleLabels[role])} account</p><h2>${signing ? "Create a hiker account" : `${esc(roleLabels[role])} Login`}</h2><p class="kt-muted">Browser-only classroom demonstration. Do not enter real passwords or medical details.</p><form id="auth-form"><div class="kt-fields">${signing ? field("Full name", "name", "text", "", 'required minlength="2" maxlength="80" autocomplete="name"') : ""}${field("Email", "email", "email", "", 'required maxlength="254" autocomplete="email"')}${field("Password", "password", "password", "", 'required minlength="6" maxlength="100" autocomplete="' + (signing ? "new-password" : "current-password") + '"')}${signing ? field("Confirm password", "confirmPassword", "password", "", 'required minlength="6" maxlength="100" autocomplete="new-password"') : ""}</div><label class="kt-show-password"><input type="checkbox" id="kt-show-password"> Show password</label><button class="btn btn-primary" type="submit">${signing ? "Sign Up" : `Log In as ${esc(roleLabels[role])}`}</button></form>${signing ? '<p class="kt-muted">New public accounts are registered as <strong>Hikers</strong>. Guide accounts are added by an Administrator.</p>' : ""}<p style="margin-top:16px">${role === "hiker" ? (signing ? `Already registered? <a class="kt-link" href="${hikerUrl}">Hiker Login</a>` : `New hiker? <a class="kt-link" href="${signUpUrl}">Create an account</a>`) : "Only accounts assigned to this role can log in here."}</p><hr class="kt-separator">${demo}<p><a class="kt-link" href="auth.html">← Choose a different account</a></p></div>`;
    $("#kt-show-password")?.addEventListener("change", (e) => {
      $$('#auth-form input[type="password"], #auth-form input[name="password"], #auth-form input[name="confirmPassword"]').forEach((input) => {
        input.type = e.target.checked ? "text" : "password";
      });
    });
    $("#auth-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!e.target.reportValidity()) return;
      const v = formValues(e.target),
        email = v.email.trim().toLowerCase();
      let u = state.users.find((x) => x.email === email);
      if (signing) {
        if (v.name.trim().length < 2)
          return toast("Please enter your full name.", true);
        if (v.password !== v.confirmPassword)
          return toast("Passwords do not match.", true);
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
        if (!u || u.role !== role || !(await checkPassword(u, v.password)))
          return toast("Email or password is incorrect for this login.", true);
      }
      state.session = u.id;
      save();
      // Booking continuations are available to Hikers only.
      location.href = u.role === "hiker" ? safeNext() : "dashboard.html";
    });
  }
  function safeNext() {
    const requested = new URLSearchParams(location.search).get("next") || "";
    return /^(book\.html\?hike=\d+|dashboard\.html)$/.test(requested)
      ? requested
      : "dashboard.html";
  }
  async function checkPassword(user, password) {
    if (!user.pass) return false;
    const currentHash = await digest(password + user.email);
    if (user.pass === currentHash) return true;
    // Existing browser data may contain a custom password hashed with the old Guide email.
    if (
      user.id === 1 && user.role === "guide" && user.email === "alex@kalinga.demo" &&
      user.pass === (await digest(password + "guide@kalinga.demo"))
    ) {
      user.pass = currentHash;
      save();
      return true;
    }
    return false;
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
    const dif = $("#difficulty-filter")?.value || "";
    const loc = ($("#location-filter")?.value || "").trim().toLowerCase();
    const date = $("#date-filter")?.value || "";
    const matches = state.hikes
      .filter((h) => h.status === "active")
      .map((h) => ({ h, t: trail(h.trailId) }))
      .filter(
        ({ h, t }) =>
          t &&
          (!dif || t.difficulty === dif) &&
          (!loc || `${t.location} ${t.name}`.toLowerCase().includes(loc)) &&
          (!date || h.date >= date),
      );
    host.innerHTML = matches
      .map(({ h, t }) => {
        const left = slots(h);
        const availability = left <= 0 ? "Fully booked" : `${left} spots left`;
        return `<div class="col-12 col-md-6 col-xl-4 kt-lz-trail-col">
        <article class="card kt-lz-trail-card h-100">
          <div class="kt-lz-card-media"><img class="card-image" src="${esc(t.image)}" alt="${esc(t.name)} hiking scenery" loading="lazy"><span class="kt-lz-media-pill">${esc(t.difficulty)}</span></div>
          <div class="card-body kt-lz-trail-body">
            <p class="kt-lz-card-location">⌖ ${esc(t.location)}</p>
            <h3>${esc(t.name)}</h3>
            <p class="kt-lz-card-desc">${esc(t.description)}</p>
            <div class="card-meta kt-lz-card-meta">${badge(`${t.distance} km`)}${badge(`${t.elevation} m elevation`)}${badge(t.duration)}</div>
            <div class="kt-lz-card-schedule"><span><small>Next hike</small><strong>${esc(fullDate(h.date))}</strong></span><span class="kt-lz-availability ${left <= 0 ? "is-full" : ""}">${esc(availability)}</span></div>
            <a class="btn btn-primary kt-lz-card-cta" href="hike-details.html?hike=${h.id}">View hike details <span aria-hidden="true">→</span></a>
          </div>
        </article>
      </div>`;
      })
      .join("");
    const count = $("#kt-lz-trail-count");
    if (count)
      count.textContent = `${matches.length} ${matches.length === 1 ? "hike" : "hikes"} available`;
    $("#kt-no-results").hidden = matches.length > 0;
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
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="1000" height="680" role="img" aria-label="Trail area preview for ${esc(t.name)}">
      <title>${esc(t.name)} — sample trail overview</title>
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
      <text x="100" y="224" fill="#2f5d50" font-family="Arial,sans-serif" font-size="15" font-weight="700">AREA PREVIEW</text>
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
  // Every map is based on the current booking -> scheduled hike -> trail.
  // The drawn route is deliberately fictional; it is NOT GPS navigation data.
  function bookingMapSeed(t, h, b) {
    const text = `${b?.id ?? ""}|${h?.id ?? ""}|${h?.date ?? ""}|${t?.id ?? ""}|${t?.name ?? ""}`;
    let seed = 2166136261;
    for (let i = 0; i < text.length; i++) {
      seed = Math.imul(seed ^ text.charCodeAt(i), 16777619) >>> 0;
    }
    return seed;
  }
  function randomMapGenerator(t, h, b) {
    let seed = bookingMapSeed(t, h, b);
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  function googleTrailSearch(t) {
    if (t?.googleMapsQuery?.trim()) return t.googleMapsQuery.trim();
    const name = String(t?.name || "").toLowerCase();
    const location = String(t?.location || "").trim();
    // Match the real named mountain rather than Kalinga's demo activity title.
    if (
      /\b(?:mount|mt\.?)[ -]*ulap\b/i.test(name) &&
      /itogon|benguet/i.test(location)
    )
      return "Mount Ulap Eco Trail, Ampucao, Itogon, Benguet, Philippines";
    // These two are fictional trail names, so use their documented areas only.
    if (name === "forest ridge walk" && /baguio/i.test(location))
      return "Baguio City, Philippines";
    if (name === "highland summit" && /benguet/i.test(location))
      return "Benguet, Philippines";
    // For new, user-managed trails, use its actual saved name and location.
    return [
      t?.name,
      location,
      /philippines/i.test(location) ? "" : "Philippines",
    ]
      .filter(Boolean)
      .join(", ");
  }
  function mapPhotoForBooking(t, h, b) {
    // These images are scenic preview images, not evidence of an actual route.
    const pools = {
      1: [
        t.image,
        image("photo-1464822759023-fed622ff2c3b"),
        image("photo-1551632811-561732d1e306"),
      ],
      2: [
        t.image,
        image("photo-1441974231531-c6227db76b6e"),
        image("photo-1473448912268-2022ce9509d8"),
      ],
      3: [
        t.image,
        image("photo-1519681393784-d120267933ba"),
        image("photo-1464278533981-50106e6176b1"),
      ],
    };
    const choices = pools[t.id] || [t.image].filter(Boolean);
    return choices[bookingMapSeed(t, h, b) % choices.length] || t.image || "";
  }
  function svgBookingText(
    value,
    x,
    y,
    maxCharacters = 24,
    maxLines = 2,
    size = 20,
    lineHeight = 23,
  ) {
    return `<text x="${x}" y="${y}" fill="#23382e" font-family="Arial,sans-serif" font-size="${size}" font-weight="700">${mapSvgLines(value, x, y, maxCharacters, maxLines, lineHeight)}</text>`;
  }
  function trailDownloadSvg(t, h, b) {
    const rand = randomMapGenerator(t, h, b);
    const fmt = (n) => n.toFixed(1);
    // Route is generated from this booking's seed so separate bookings get
    // different visual patterns without implying official GPS coordinates.
    const route = [];
    let x = 115 + rand() * 58;
    let y = 655 + rand() * 40;
    route.push([x, y]);
    for (let i = 1; i < 10; i++) {
      x += 74 + rand() * 24;
      y -= 41 + rand() * 44;
      y += (rand() - 0.5) * 70;
      route.push([Math.min(870, x), Math.max(303, Math.min(736, y))]);
    }
    route[route.length - 1] = [870, 325 + rand() * 65];
    const routePath = route
      .map(([rx, ry], i) => {
        if (!i) return `M ${fmt(rx)} ${fmt(ry)}`;
        const [px, py] = route[i - 1];
        return `C ${fmt(px + (rx - px) * 0.4)} ${fmt(py + (rand() - 0.5) * 60)} ${fmt(px + (rx - px) * 0.65)} ${fmt(ry + (rand() - 0.5) * 60)} ${fmt(rx)} ${fmt(ry)}`;
      })
      .join(" ");
    const contours = Array.from({ length: 12 }, (_, i) => {
      const cy = 300 + i * 42;
      return `<path d="M 55 ${fmt(cy + rand() * 35)} Q 420 ${fmt(cy - 96 + rand() * 120)} 970 ${fmt(cy + rand() * 90)}"/>`;
    }).join("");
    const trees = Array.from({ length: 26 }, () => {
      const tx = 105 + rand() * 810,
        ty = 280 + rand() * 475;
      const s = 0.7 + rand() * 0.7;
      return `<g transform="translate(${fmt(tx)} ${fmt(ty)}) scale(${fmt(s)})" opacity=".67"><circle r="15" fill="#8aad93"/><circle cx="9" cy="-9" r="13" fill="#769d82"/><circle cx="-10" cy="-6" r="11" fill="#5f8970"/></g>`;
    }).join("");
    const waypoints = route
      .slice(2, -1)
      .filter((_, i) => i % 2 === 0)
      .map(
        ([rx, ry], i) =>
          `<circle cx="${fmt(rx)}" cy="${fmt(ry)}" r="9" stroke="#285747" stroke-width="3" fill="#fffaf0"/>`,
      )
      .join("");
    const [sx, sy] = route[0],
      [ex, ey] = route[route.length - 1];
    const guideName = who(h.guideId)?.name || "To be assigned";
    const participants = b?.participants?.length ?? 0;
    const rows = [
      ["Hike date", fullDate(h.date)],
      ["Difficulty", t.difficulty || "Not set"],
      ["Distance", `${t.distance ?? "—"} km`],
      ["Elevation", `${t.elevation ?? "—"} m`],
      ["Duration", t.duration || "Not set"],
      ["Participants", String(participants)],
      ["Assigned guide", guideName],
      ["Meeting point", t.meeting || "Confirm with guide"],
    ];
    let rowY = 318;
    const facts = rows
      .map(([label, value]) => {
        const isLong = String(value).length > 29;
        const hgt = isLong ? 65 : 58;
        const output = `<text x="1010" y="${rowY}" fill="#667c6d" font-family="Arial,sans-serif" font-size="15">${esc(label.toUpperCase())}</text>${svgBookingText(value, 1010, rowY + 25, 27, 2, 19, 21)}`;
        rowY += hgt;
        return output;
      })
      .join("");
    const titleLines = mapLines(t.name, 37, 2);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000" viewBox="0 0 1400 1000" role="img" aria-label="Trail preview for booking ${esc(b?.id || "")}">
      <title>${esc(t.name)} — sample trail overview</title>
      <desc>Booking details from Kalinga Trails with a fictional decorative route. Not a GPS navigation map.</desc>
      <defs><clipPath id="kt-export-map-clip"><rect x="70" y="268" width="900" height="510" rx="22"/></clipPath></defs>
      <rect width="1400" height="1000" fill="#f8f7f3"/>
      <rect x="0" y="0" width="1400" height="16" fill="#2f5d50"/>
      <text x="70" y="63" fill="#2f5d50" font-family="Arial,sans-serif" font-size="19" font-weight="700" letter-spacing="4">KALINGA TRAILS</text>
      <text x="70" y="${titleLines.length > 1 ? 119 : 132}" fill="#1b2f27" font-family="Arial,sans-serif" font-size="39" font-weight="700">${mapSvgLines(t.name, 70, titleLines.length > 1 ? 119 : 132, 37, 2, 40)}</text>
      <text x="70" y="217" fill="#5b7067" font-family="Arial,sans-serif" font-size="19">${mapSvgLines(t.location, 70, 217, 55, 1, 22)}</text>
      <rect x="985" y="47" width="344" height="179" rx="18" fill="#e9efe9"/>
      <text x="1009" y="82" fill="#436b58" font-family="Arial,sans-serif" font-size="16" font-weight="700">CONFIRMED BOOKING</text>
      <text x="1009" y="128" fill="#233c2e" font-family="Arial,sans-serif" font-size="37" font-weight="700">#${esc(b?.id ?? "—")}</text>
      <text x="1009" y="172" fill="#5a7166" font-family="Arial,sans-serif" font-size="16">Trail itinerary &amp; overview</text>
      <text x="1009" y="201" fill="#5a7166" font-family="Arial,sans-serif" font-size="15">Illustration only · Not to scale</text>
      <rect x="70" y="268" width="900" height="510" rx="22" fill="#dceadd" stroke="#c1d0c4" stroke-width="2"/>
      <g clip-path="url(#kt-export-map-clip)">
        <rect x="70" y="268" width="900" height="510" fill="#e0ebe0"/>
        <ellipse cx="250" cy="416" rx="170" ry="114" fill="#c6dec7" opacity=".55"/>
        <ellipse cx="760" cy="665" rx="210" ry="120" fill="#bad4c1" opacity=".53"/>
        <g fill="none" stroke="#9cb6a1" stroke-width="2.5" opacity=".55">${contours}</g>
        ${trees}
        <path d="${routePath}" fill="none" stroke="#9ab2a3" stroke-width="23" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${routePath}" fill="none" stroke="#fff7e6" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${routePath}" fill="none" stroke="#235642" stroke-width="6" stroke-dasharray="14 12" stroke-linecap="round" stroke-linejoin="round"/>
        ${waypoints}
        <circle cx="${fmt(sx)}" cy="${fmt(sy)}" r="17" stroke="#295948" stroke-width="5" fill="#fff"/>
        <circle cx="${fmt(ex)}" cy="${fmt(ey)}" r="18" stroke="#c27848" stroke-width="6" fill="#fff"/>
        <circle cx="${fmt(ex)}" cy="${fmt(ey)}" r="6" fill="#c27848"/>
      </g>
      <rect x="87" y="287" width="213" height="42" rx="21" fill="#ffffff" fill-opacity=".91"/>
      <text x="110" y="314" fill="#305e49" font-family="Arial,sans-serif" font-size="17" font-weight="700">SAMPLE ROUTE · NOT GPS</text>
      <rect x="88" y="694" width="230" height="62" rx="14" fill="#fff" fill-opacity=".95"/>
      <circle cx="112" cy="716" r="7" fill="#295948"/>
      <text x="130" y="721" fill="#315a49" font-family="Arial,sans-serif" font-size="15">Start / trailhead</text>
      <circle cx="112" cy="740" r="7" fill="#c27848"/>
      <text x="130" y="745" fill="#315a49" font-family="Arial,sans-serif" font-size="15">End / finish</text>
      <rect x="985" y="251" width="344" height="527" rx="20" fill="#fff" stroke="#d6ddd6" stroke-width="2"/>
      <text x="1010" y="292" fill="#2b5d46" font-family="Arial,sans-serif" font-size="23" font-weight="700">Your hike details</text>
      ${facts}
      <rect x="70" y="802" width="1259" height="130" rx="18" fill="#eff4ee" stroke="#d4e0d5" stroke-width="2"/>
      <text x="96" y="839" fill="#2d5e49" font-family="Arial,sans-serif" font-size="19" font-weight="700">BOOKED TRAIL LOCATION</text>
      ${svgBookingText(t.location || "Location not specified", 96, 875, 65, 1, 22)}
      <text x="96" y="910" fill="#576c60" font-family="Arial,sans-serif" font-size="17">Map link in the booking viewer uses this trail's recorded area.</text>
      <text x="70" y="968" fill="#637268" font-family="Arial,sans-serif" font-size="15">Decorative route only. Exact path and meeting location must be verified with your hiking guide.</text>
    </svg>`;
  }
  function downloadTrailMap(t, h, b) {
    const svg = trailDownloadSvg(t, h, b);
    const source = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(source);
    const filename = `Kalinga-Trails-${
      String(t.name)
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "") || "Trail"
    }-Booking-${b?.id ?? "Map"}`;
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
          toast("Booking trail map downloaded as PNG.");
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
    const h = hike(Number(new URLSearchParams(location.search).get("hike")));
    const t = h && trail(h.trailId);
    if (!t || h.status !== "active") {
      host.innerHTML = panel(
        "Unavailable",
        'This hike is no longer accepting bookings. <a href="trails.html">View available hikes</a>',
      );
      return;
    }
    const free = slots(h);
    const details = `<div class="kt-lz-book-snapshot d-flex flex-wrap justify-content-between align-items-start gap-3">
      <div><p class="kt-lz-overline">Your selected adventure</p><h3>${esc(t.name)}</h3><p>${esc(t.location)} · ${esc(fullDate(h.date))}</p></div>
      <span class="kt-lz-count-pill">${esc(String(free))} spots remaining</span>
    </div>`;
    if (free <= 0) {
      host.innerHTML = panel(
        "Hike request",
        details + empty("Fully booked. Please choose another hike."),
      );
      return;
    }
    host.innerHTML = `<section class="kt-panel kt-lz-book-panel">
      <div class="kt-lz-book-header"><p class="kt-lz-overline">Your adventure starts here</p><h2>Request your booking</h2><p>Three short steps. Your request is <strong>pending approval</strong> until an administrator confirms it.</p></div>
      ${details}
      <ol class="kt-lz-steps" aria-label="Booking steps">
        <li class="is-current" data-book-indicator="1" aria-current="step"><span>1</span><strong>Hike Summary</strong></li>
        <li data-book-indicator="2"><span>2</span><strong>Participant Details</strong></li>
        <li data-book-indicator="3"><span>3</span><strong>Review Request</strong></li>
      </ol>
      <form id="book-form" novalidate>
        <fieldset class="kt-lz-book-step" data-book-step="1">
          <legend>Step 1 · Your hike</legend>
          <p class="kt-muted">Confirm the scheduled hike and how many people will join.</p>
          <div class="kt-lz-hike-summary row g-3">
            <div class="col-6 col-lg-3"><small>Difficulty</small><strong>${esc(t.difficulty)}</strong></div>
            <div class="col-6 col-lg-3"><small>Distance</small><strong>${esc(String(t.distance))} km</strong></div>
            <div class="col-6 col-lg-3"><small>Duration</small><strong>${esc(t.duration)}</strong></div>
            <div class="col-6 col-lg-3"><small>Meeting point</small><strong>${esc(t.meeting)}</strong></div>
          </div>
          <div class="kt-lz-book-count"><label class="kt-field" for="kt-lz-participant-count">Number of participants <input id="kt-lz-participant-count" name="count" type="number" value="1" min="1" max="${free}" required /></label><p class="kt-muted">Available spaces: ${free}. You count as the first participant.</p></div>
        </fieldset>
        <fieldset class="kt-lz-book-step" data-book-step="2" hidden>
          <legend>Step 2 · Participant details</legend>
          <p class="kt-muted">We've filled in your name. Enter the remaining participants individually.</p>
          <div id="kt-lz-participants" class="kt-lz-participant-list"></div>
          <div class="kt-fields">
            ${field("Contact phone", "phone", "tel", me().phone || "", 'required minlength="7" autocomplete="tel"')}
            ${field("Emergency contact name", "emergencyName", "text", "", 'required minlength="2"')}
            ${field("Emergency contact phone", "emergencyPhone", "tel", "", 'required minlength="7"')}
          </div>
        </fieldset>
        <fieldset class="kt-lz-book-step" data-book-step="3" hidden>
          <legend>Step 3 · Review request</legend>
          <div class="kt-lz-review" id="kt-lz-book-review"></div>
          <div class="kt-fields">
            <label class="kt-field kt-full">Health declaration (demo only — do not enter sensitive medical details)
              <select name="health" required><option value="">Choose a response</option><option value="declared">I will privately inform the guide of relevant concerns</option><option value="none">No concerns to declare</option></select>
            </label>
            <label class="kt-field kt-full">Additional notes (optional)<textarea name="notes" rows="3" maxlength="500" placeholder="Scheduling or accessibility notes"></textarea></label>
          </div>
          <label class="kt-check"><input type="checkbox" required name="agree"> I understand the guide instructions and cancellation policy.</label>
          <p class="kt-lz-pending-note">Your booking will show as <strong>Pending Approval</strong> after submission. You will receive a notification when it is reviewed.</p>
        </fieldset>
        <div class="kt-lz-book-controls d-flex justify-content-between flex-wrap gap-2">
          <button class="btn btn-outline" type="button" id="kt-lz-book-back" hidden>Back</button>
          <button class="btn btn-primary" type="button" id="kt-lz-book-next">Continue <span aria-hidden="true">→</span></button>
          <button class="btn btn-primary" type="submit" id="kt-lz-book-submit" hidden>Submit booking request</button>
        </div>
      </form>
    </section>`;
    const form = $("#book-form");
    const countField = $("#kt-lz-participant-count", form);
    const participantHost = $("#kt-lz-participants", form);
    let step = 1;
    function createParticipants() {
      const count = Number(countField.value);
      if (!Number.isInteger(count) || count < 1 || count > slots(h)) return;
      const existing = $$("input[name=participantName]", participantHost).map(
        (input) => input.value,
      );
      participantHost.innerHTML = Array.from(
        { length: count },
        (_, index) =>
          `<label class="kt-lz-person-row kt-field"><span>Participant ${index + 1}${index === 0 ? " · Account holder" : ""}</span><input type="text" name="participantName" value="${esc(index === 0 ? me().name : existing[index] || "")}" minlength="2" maxlength="90" ${index === 0 ? "readonly" : "required"} aria-label="Participant ${index + 1} name" /></label>`,
      ).join("");
    }
    createParticipants();
    countField.addEventListener("change", createParticipants);
    countField.addEventListener("input", createParticipants);
    function validateStep(currentStep) {
      const inputs = $$(
        `[data-book-step="${currentStep}"] input, [data-book-step="${currentStep}"] select, [data-book-step="${currentStep}"] textarea`,
        form,
      );
      const invalid = inputs.find((input) => !input.checkValidity());
      if (invalid) {
        invalid.reportValidity();
        invalid.focus();
        return false;
      }
      if (currentStep === 1) {
        const count = Number(countField.value);
        if (!Number.isInteger(count) || count < 1 || count > slots(h))
          return (
            toast("Please choose a valid participant count.", true),
            false
          );
        createParticipants();
      }
      return true;
    }
    function showStep(nextStep) {
      step = nextStep;
      $$("[data-book-step]", form).forEach((section) => {
        section.hidden = Number(section.dataset.bookStep) !== step;
      });
      $$("[data-book-indicator]").forEach((item) => {
        const number = Number(item.dataset.bookIndicator);
        item.classList.toggle("is-current", number === step);
        item.classList.toggle("is-complete", number < step);
        if (number === step) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      $("#kt-lz-book-back").hidden = step === 1;
      $("#kt-lz-book-next").hidden = step === 3;
      $("#kt-lz-book-submit").hidden = step !== 3;
      if (step === 3) {
        const names = $$("input[name=participantName]", form).map((input) =>
          input.value.trim(),
        );
        $("#kt-lz-book-review").innerHTML =
          `<h3>Check your details</h3><dl><div><dt>Hike</dt><dd>${esc(t.name)}</dd></div><div><dt>Date</dt><dd>${esc(fullDate(h.date))}</dd></div><div><dt>Participants</dt><dd>${names.map(esc).join(" · ")}</dd></div><div><dt>Contact</dt><dd>${esc(form.elements.phone.value.trim())}</dd></div><div><dt>Emergency contact</dt><dd>${esc(form.elements.emergencyName.value.trim())} · ${esc(form.elements.emergencyPhone.value.trim())}</dd></div></dl>`;
      }
      $("[data-book-step]:not([hidden]) legend", form)?.focus?.();
    }
    $("#kt-lz-book-next").addEventListener("click", () => {
      if (!validateStep(step)) return;
      showStep(Math.min(3, step + 1));
    });
    $("#kt-lz-book-back").addEventListener("click", () =>
      showStep(Math.max(1, step - 1)),
    );
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (
        step !== 3 ||
        !validateStep(1) ||
        !validateStep(2) ||
        !validateStep(3)
      )
        return;
      const v = formValues(form);
      const names = $$("input[name=participantName]", form).map((input) =>
        input.value.trim(),
      );
      const count = Number(countField.value);
      if (h.date < today()) return toast("You cannot book a past hike.", true);
      if (!Number.isInteger(count) || count < 1 || count > slots(h))
        return toast("Not enough remaining slots.", true);
      if (names.length !== count || names.some((name) => name.length < 2))
        return toast("Provide a valid name for each participant.", true);
      if (names[0].toLocaleLowerCase() !== me().name.toLocaleLowerCase())
        return toast("The first participant must be the account holder.", true);
      const b = {
        id: next(),
        userId: me().id,
        hikeId: h.id,
        participants: names.map((name, index) => ({
          name,
          accountUserId: index === 0 ? me().id : null,
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
        .filter((user) => user.role === "admin")
        .forEach((user) =>
          notice(user.id, `New booking #${b.id} for ${t.name}.`),
        );
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
    const list = state.bookings
      .filter((b) => b.userId === u.id)
      .slice()
      .reverse();
    return `<section class="kt-panel kt-lz-bookings-panel"><div class="kt-lz-panel-top d-flex flex-wrap justify-content-between align-items-center gap-3"><div><p class="kt-lz-overline">Your reservations</p><h2>My Bookings</h2></div><a class="btn btn-outline" href="trails.html">Explore more trails</a></div>
      ${
        list.length
          ? `<div class="kt-lz-booking-list">${list
              .map((b) => {
                const h = hike(b.hikeId),
                  t = h && trail(h.trailId);
                const mapButton =
                  b.status === "confirmed" && t
                    ? btn(
                        "view-map",
                        "View Map",
                        b.id,
                        "btn btn-primary kt-view-map-btn",
                      )
                    : "";
                const cancelButton = ["pending", "confirmed"].includes(b.status)
                  ? btn(
                      "cancel-booking",
                      "Cancel booking",
                      b.id,
                      "btn btn-secondary",
                    )
                  : "";
                const stateLabel =
                  b.status === "pending"
                    ? "Pending Approval"
                    : b.status.charAt(0).toUpperCase() + b.status.slice(1);
                return `<article class="kt-lz-booking-card"><div class="kt-lz-booking-card-head d-flex align-items-start flex-wrap justify-content-between gap-2"><div><span class="kt-lz-small-label">Booking #${esc(b.id)}</span><h3>${esc(hikeTitle(h))}</h3><p>${esc(t?.location || "Location unavailable")}</p></div><span class="kt-lz-status kt-lz-status-${esc(b.status)}">${esc(stateLabel)}</span></div>
          <div class="kt-lz-booking-details row g-3"><div class="col-6 col-lg-3"><small>Date</small><strong>${esc(fullDate(h?.date))}</strong></div><div class="col-6 col-lg-3"><small>Participants</small><strong>${b.participants.length}</strong></div><div class="col-6 col-lg-3"><small>Guide</small><strong>${esc(who(h?.guideId)?.name || "To be assigned")}</strong></div><div class="col-6 col-lg-3"><small>Meeting point</small><strong>${esc(t?.meeting || "To be announced")}</strong></div></div>
          <div class="kt-lz-booking-actions d-flex flex-wrap justify-content-between align-items-center gap-2"><span class="kt-muted">${b.status === "pending" ? "Waiting for administrator review" : b.status === "confirmed" ? "Your hike is confirmed. Review the map before departure." : "Booking no longer active"}</span><div class="kt-actions kt-my-booking-actions">${mapButton}${cancelButton}</div></div>
        </article>`;
              })
              .join("")}</div>`
          : `<div class="kt-lz-no-bookings"><span aria-hidden="true">⛰</span><h3>Your trail adventures start here</h3><p>Browse available hikes and send a booking request.</p><a href="trails.html" class="btn btn-primary">Find a hike</a></div>`
      }
    </section>`;
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
    const items = state.notifications.filter((n) => n.userId === u.id);
    const unread = items.filter((n) => !n.read).length;
    return `<section class="kt-panel kt-lz-notifications-panel">
      <div class="kt-lz-panel-top d-flex flex-wrap justify-content-between align-items-center gap-3"><div><p class="kt-lz-overline">Stay in the loop</p><h2>Notifications</h2><p class="kt-muted">${unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You're all caught up"}</p></div>${unread ? btn("read-all-notifications", "Mark all as read", "", "btn btn-outline") : ""}</div>
      <div class="kt-lz-notification-list">${items.length ? items.map((n) => `<article class="kt-lz-notification ${!n.read ? "is-unread" : ""}"><span class="kt-lz-notification-dot" aria-hidden="true"></span><div><p>${esc(n.message)}</p><small class="kt-muted">${esc(fullDate(n.date.slice(0, 10)))}</small></div>${!n.read ? btn("read-notification", "Mark read", n.id, "btn btn-secondary") : '<span class="kt-lz-small-label">Read</span>'}</article>`).join("") : `<div class="kt-lz-no-bookings"><h3>All clear</h3><p>Your booking updates and community alerts will appear here.</p></div>`}</div>
    </section>`;
  }
  function hikerPane(tab, u) {
    if (tab === "account") return accountPane(u);
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
    const upcoming = state.bookings
      .filter(
        (b) => b.userId === u.id && ["pending", "confirmed"].includes(b.status),
      )
      .slice()
      .sort((first, second) =>
        (hike(first.hikeId)?.date || "").localeCompare(
          hike(second.hikeId)?.date || "",
        ),
      );
    return `<section class="kt-panel kt-lz-overview-panel">
      <div class="kt-lz-panel-top"><p class="kt-lz-overline">Your trail companion</p><h2>Welcome back, ${esc(u.name)}!</h2><p class="kt-muted">Everything you need for your next adventure, in one place.</p></div>
      ${stats([
        ["Upcoming bookings", upcoming.length],
        ["Completed hikes", done.length],
        ["Achievements", accomplishments(u).filter((a) => a.earned).length],
        [
          "Friends",
          state.friends.filter(
            (f) =>
              f.status === "accepted" && (f.to === u.id || f.from === u.id),
          ).length,
        ],
      ])}
      <div class="kt-lz-upcoming-head d-flex justify-content-between align-items-center flex-wrap gap-2"><h3>Upcoming hikes</h3><a href="dashboard.html?tab=bookings">View all bookings →</a></div>
      ${
        upcoming.length
          ? `<div class="kt-lz-upcoming-list">${upcoming
              .slice(0, 3)
              .map(
                (b) =>
                  `<a class="kt-lz-upcoming-card" href="dashboard.html?tab=bookings"><div><span class="kt-lz-small-label">${esc(fullDate(hike(b.hikeId)?.date))}</span><h4>${esc(hikeTitle(hike(b.hikeId)))}</h4><p>${esc(trail(hike(b.hikeId)?.trailId)?.location || "")}</p></div><span class="kt-lz-status kt-lz-status-${esc(b.status)}">${b.status === "pending" ? "Pending Approval" : "Confirmed"}</span></a>`,
              )
              .join("")}</div>`
          : `<div class="kt-lz-empty-overview"><span aria-hidden="true">⛰</span><div><h4>No upcoming hikes yet</h4><p>Browse trails to find your next guided adventure.</p></div></div>`
      }
      <div class="kt-actions kt-lz-dashboard-actions"><a href="trails.html" class="btn btn-primary">Explore Hikes</a><a href="dashboard.html?tab=bookings" class="btn btn-secondary">My Bookings</a></div>
    </section>`;
  }
  function guidePane(tab, u) {
    if (tab === "account") return accountPane(u);
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
    if (tab === "assigned")
      return panel(
        "Assigned Hikes",
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
            .join("") + (assigned.length ? "" : empty("No hikes assigned yet.")),
      );
    const upcoming = assigned
      .filter((h) => h.date >= today())
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
    return `<section class="kt-panel kt-lz-overview-panel kt-lz-role-overview">
      <div class="kt-lz-panel-top"><p class="kt-lz-overline">Your guiding workspace</p><h2>Welcome back, ${esc(u.name.split(" ")[0])}!</h2><p class="kt-muted">Everything you need to manage your guided hikes, in one place.</p></div>
      ${stats([
        ["Assigned hikes", assigned.length],
        ["Confirmed bookings", bookings.length],
        ["Upcoming hikes", upcoming.length],
        ["Participants", bookings.reduce((total, b) => total + b.participants.length, 0)],
      ])}
      <div class="kt-lz-upcoming-head"><h3>Upcoming assigned hikes</h3><a href="dashboard.html?tab=assigned">View all assigned hikes →</a></div>
      ${upcoming.length ? `<div class="kt-lz-upcoming-list">${upcoming.slice(0, 3).map((h) =>
        `<a class="kt-lz-upcoming-card" href="dashboard.html?tab=attendance&amp;hike=${h.id}"><div><span class="kt-lz-small-label">${esc(fullDate(h.date))}</span><h4>${esc(hikeTitle(h))}</h4><p>${esc(trail(h.trailId)?.location || "")} · ${state.bookings.filter((b) => b.hikeId === h.id && b.status === "confirmed").reduce((n, b) => n + b.participants.length, 0)} confirmed participants</p></div><span class="kt-lz-status">${esc(h.status === "active" ? "Scheduled" : "Closed")}</span></a>`
      ).join("")}</div>` : `<div class="kt-lz-empty-overview"><span aria-hidden="true">⛰</span><div><h4>No upcoming assigned hikes</h4><p>Scheduled hikes assigned to you will appear here.</p></div></div>`}
      <div class="kt-actions kt-lz-dashboard-actions"><a href="dashboard.html?tab=assigned" class="btn btn-primary">Assigned Hikes</a><a href="dashboard.html?tab=attendance" class="btn btn-secondary">Check-in</a></div>
    </section>`;
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
    if (tab === "account") return accountPane(u);
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
        `${tab === "guides" ? `<form id="admin-guide-form"><div class="kt-fields">${field("Guide name", "name", "text", "", "required")}${field("Guide email", "email", "email", "", "required")}${field("Temporary password", "password", "password", "", 'required minlength="8" maxlength="100" autocomplete="new-password"')}</div><button class="btn btn-primary">Add Demo Guide</button></form>` : ""}${
          state.users
            .filter((x) => x.role === (tab === "customers" ? "hiker" : "guide"))
            .map(
              (x) =>
                `<div class="kt-item"><div><strong>${esc(x.name)}</strong><p>${esc(x.email)} · ${tab === "customers" ? state.bookings.filter((b) => b.userId === x.id).length + " bookings" : state.hikes.filter((h) => h.guideId === x.id).length + " assigned hikes"}</p></div>${tab === "guides" ? `<div class="kt-actions">${btn("edit-guide", "Edit", x.id)}${btn("reset-guide-password", "Set Password", x.id)}${btn("delete-guide", "Remove", x.id)}</div>` : `<div class="kt-actions">${btn("customer-history", "Booking history", x.id)}${btn("delete-customer", "Remove", x.id)}</div>`}</div>`,
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
    const recentBookings = bs.slice().reverse().sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));
    return `<section class="kt-panel kt-lz-overview-panel kt-lz-role-overview">
      <div class="kt-lz-panel-top"><p class="kt-lz-overline">Your management workspace</p><h2>Welcome back, ${esc(u.name.split(" ")[0])}!</h2><p class="kt-muted">Everything you need to oversee Kalinga Trails operations, in one place.</p></div>
      ${stats([
        ["Total bookings", bs.length],
        ["Pending bookings", bs.filter((b) => b.status === "pending").length],
        ["Active hikes", state.hikes.filter((h) => h.status === "active").length],
        ["Hikers", state.users.filter((x) => x.role === "hiker").length],
      ])}
      <div class="kt-lz-upcoming-head"><h3>Recent booking requests</h3><a href="dashboard.html?tab=bookings">View all bookings →</a></div>
      ${recentBookings.length ? `<div class="kt-lz-upcoming-list">${recentBookings.slice(0, 3).map((b) =>
        `<a class="kt-lz-upcoming-card" href="dashboard.html?tab=bookings"><div><span class="kt-lz-small-label">${esc(fullDate(hike(b.hikeId)?.date))}</span><h4>${esc(hikeTitle(hike(b.hikeId)))}</h4><p>${esc(who(b.userId)?.name || "Hiker")} · Booking #${b.id}</p></div><span class="kt-lz-status kt-lz-status-${esc(b.status)}">${esc(b.status === "pending" ? "Pending Approval" : b.status.charAt(0).toUpperCase() + b.status.slice(1))}</span></a>`
      ).join("")}</div>` : `<div class="kt-lz-empty-overview"><span aria-hidden="true">⛰</span><div><h4>No booking requests yet</h4><p>New Hiker bookings will appear here for review.</p></div></div>`}
      <div class="kt-actions kt-lz-dashboard-actions"><a href="dashboard.html?tab=bookings" class="btn btn-primary">Review Bookings</a><a href="dashboard.html?tab=reports" class="btn btn-secondary">View Reports</a></div>
      <div class="kt-lz-upcoming-head kt-lz-inquiry-heading"><h3>Contact inquiries</h3></div>
      ${state.inquiries.map((i) => `<div class="kt-item"><div><strong>${esc(i.name)} · ${esc(i.topic)}</strong><p>${esc(i.message)}</p><small>${esc(i.email)}</small></div>${btn("delete-inquiry", "Archive", i.id)}</div>`).join("") || empty("No inquiries received in this browser.")}
    </section>`;
  }
  function accountPane(u) {
    const roleLabel = { hiker: "Hiker", guide: "Guide", admin: "Administrator" }[u.role] || "User";
    return panel(
      "Account Settings",
      `<p class="kt-muted">Your role determines which dashboard sections you can access. Only an Administrator can create Guide accounts. This is a local browser demonstration, not a secure online account system.</p><div class="kt-fields"><div class="kt-field"><span>Account email</span><strong>${esc(u.email)}</strong></div><div class="kt-field"><span>Account role</span><strong>${esc(roleLabel)}</strong></div></div><h3>Change password</h3><form id="account-password-form"><div class="kt-fields">${field("Current password", "currentPassword", "password", "", 'required autocomplete="current-password"')}${field("New password", "newPassword", "password", "", 'required minlength="8" maxlength="100" autocomplete="new-password"')}${field("Confirm new password", "confirmPassword", "password", "", 'required minlength="8" maxlength="100" autocomplete="new-password"')}</div><button type="submit" class="btn btn-primary">Update Password</button></form>`,
    );
  }
  const tabConfig = {
    hiker: [
      ["overview", "Dashboard"],
      ["bookings", "My Bookings"],
      ["profile", "My Profile"],
      ["account", "Account Settings"],
      ["history", "Hiking History & Stats"],
      ["achievements", "Achievements"],
      ["friends", "Friends & Activity"],
      ["notifications", "Notifications"],
    ],
    guide: [
      ["overview", "Dashboard"],
      ["assigned", "Assigned Hikes"],
      ["account", "Account Settings"],
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
      ["account", "Account Settings"],
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
    const bootstrap = document.querySelector("link[data-lz-bootstrap]");
    if (bootstrap) bootstrap.media = u.role === "hiker" ? "all" : "not all";
    setDashboardHeading(u);
    const tabs = tabConfig[u.role],
      requested = new URLSearchParams(location.search).get("tab") || "overview",
      tab = tabs.some((x) => x[0] === requested) ? requested : "overview";
    host.innerHTML = `<div class="kt-dashboard kt-lz-hiker-dashboard"><aside class="kt-sidebar"><div class="kt-user"><strong>${esc(u.name)}</strong><p>${esc(u.role.toUpperCase())}</p></div><label class="kt-mobile-section-control" for="kt-mobile-section"><span>Dashboard section</span><select id="kt-mobile-section" aria-label="Choose dashboard section">${tabs.map(([slug, name]) => `<option value="${slug}" ${slug === tab ? "selected" : ""}>${esc(name)}</option>`).join("")}</select></label><nav aria-label="Dashboard sections">${tabs.map(([slug, name]) => `<a class="${slug === tab ? "selected" : ""}" ${slug === tab ? 'aria-current="page"' : ""} href="dashboard.html?tab=${slug}">${esc(name)}${slug === "notifications" ? ` (${state.notifications.filter((n) => n.userId === u.id && !n.read).length})` : ""}</a>`).join("")}</nav></aside><div class="kt-dashboard-content">${u.role === "hiker" ? hikerPane(tab, u) : u.role === "guide" ? guidePane(tab, u) : adminPane(tab, u)}</div></div>`;
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
    on("account-password-form", async (f, v) => {
      const u = me();
      if (!u || !u.pass) return toast("This account has no password. Ask an Administrator to set one.", true);
      if (!(await checkPassword(u, v.currentPassword)))
        return toast("Current password is incorrect.", true);
      if (v.newPassword !== v.confirmPassword)
        return toast("New passwords do not match.", true);
      if (v.newPassword === v.currentPassword)
        return toast("Choose a different new password.", true);
      u.pass = await digest(v.newPassword + u.email);
      save();
      f.reset();
      toast("Account password updated.");
    });
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
    on("admin-guide-form", async (f, v) => {
      const email = v.email.trim().toLowerCase();
      if (!v.name.trim()) return toast("Guide name required.", true);
      if (state.users.some((u) => u.email === email))
        return toast("Email already exists.", true);
      state.users.push({
        id: next(),
        name: v.name.trim(),
        email,
        role: "guide",
        pass: await digest(v.password + email),
        bio: "",
        level: "Experienced",
      });
      save();
      renderDashboard();
      toast("Guide account created. Share the temporary demo password with the guide.");
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
  // Route/terrain geometry is generated because this demo has no GPS tracks.
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

    const locationQuery = googleTrailSearch(t);
    const mapSearch =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(locationQuery);
    const sceneryPhoto = mapPhotoForBooking(t, h, b);
    const guideName = who(h.guideId)?.name || "To be assigned";
    const details = [
      ["Hike date", fullDate(h.date)],
      ["Difficulty", t.difficulty],
      ["Distance", `${t.distance} km`],
      ["Elevation", `${t.elevation} m`],
      ["Duration", t.duration],
      ["Participants", String(b.participants.length)],
      ["Assigned guide", guideName],
      ["Meeting point", t.meeting],
    ];
    const facts = details
      .map(
        ([key, value]) =>
          `<div class="kt-booked-map-fact"><dt>${esc(key)}</dt><dd>${esc(value || "Not specified")}</dd></div>`,
      )
      .join("");
    modal(
      `<section class="kt-confirmed-map" aria-labelledby="kt-confirmed-map-title">
      <div class="kt-trail-map-heading">
        <p class="kt-trail-map-eyebrow">Confirmed booking #${esc(b.id)}</p>
        <h2 id="kt-confirmed-map-title">${esc(t.name)} — View Map</h2>
        <p>${esc(t.location)} · ${esc(fullDate(h.date))}</p>
      </div>
      <div class="kt-booked-map-photo">
        <img src="${esc(sceneryPhoto)}" alt="Scenic preview photograph for ${esc(t.name)}" loading="eager">
        <div class="kt-booked-map-photo-caption"><strong>${esc(t.name)}</strong></div>
      </div>
      <dl class="kt-booked-map-facts">${facts}</dl>
      <p class="kt-confirmed-map-intro">Explore the location associated with your booked trail or download a scenic trail preview.</p>
      <div class="kt-trail-map-preview">${trailMapSvg(t, h)}</div>
      <p class="kt-trail-map-warning"><strong>Important:</strong> This preview is not a GPS trail route. For fictional hike names, Google Maps opens the recorded destination area, not a verified trailhead. Confirm the actual route and meeting point with your guide.</p>
      <div class="kt-confirmed-map-actions">
        <button type="button" class="btn btn-primary" id="kt-download-confirmed-map">Download Map Overview (PNG)</button>
        <a class="btn btn-secondary" href="${esc(mapSearch)}" target="_blank" rel="noopener noreferrer">Open Location in Google Maps</a>
      </div>
    </section>`,
      "kt-confirmed-map-dialog",
    );
    const root = $("#kt-modal");
    $("#kt-download-confirmed-map", root)?.addEventListener("click", () => {
      const current = me();
      const activeBooking = state.bookings.find((entry) => entry.id === b.id);
      if (current?.id !== b.userId || activeBooking?.status !== "confirmed")
        return toast("This booking is not currently confirmed.", true);
      downloadTrailMap(t, h, b);
    });
  }
  async function action(name, id) {
    const u = me(),
      b = state.bookings.find((x) => x.id === Number(id));
    if (name === "logout") {
      state.session = null;
      save();
      location.href = "index.html";
      return;
    }
    if (name === "demo-role") {
      // Older demo shortcuts now open the appropriate password login instead of bypassing it.
      location.href = id === "guide" ? "guide-login.html" : id === "admin" ? "admin-login.html" : "hiker-login.html";
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
    if (name === "read-all-notifications" && u.role === "hiker") {
      state.notifications
        .filter((entry) => entry.userId === u.id)
        .forEach((entry) => {
          entry.read = true;
        });
      save();
      renderDashboard();
      toast("All notifications marked as read.");
      return;
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
            if (val !== g.email) {
              const newPassword = prompt("Set a new demo password for this guide (at least 8 characters):");
              if (newPassword === null) return;
              if (newPassword.length < 8) return toast("Password must be at least 8 characters.", true);
              g.pass = await digest(newPassword + val);
            }
            g.email = val;
          }
        }
      }
      if (name === "reset-guide-password") {
        const g = who(Number(id));
        if (g?.role === "guide") {
          const password = prompt("Set a demo password for this guide (at least 8 characters):");
          if (password === null) return;
          if (password.length < 8) return toast("Password must be at least 8 characters.", true);
          g.pass = await digest(password + g.email);
          toast("Guide password updated.");
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
  let lzCommunityFilter = "all";
  function renderCommunity() {
    const target = $("#kt-community-posts");
    if (target) {
      const posts = feedPosts();
      target.innerHTML = posts;
      if (lzCommunityFilter === "photos") {
        $$(".kt-post-card", target).forEach((card) => {
          card.hidden = !$(".kt-post-photo", card);
        });
        const visible = $$(".kt-post-card:not([hidden])", target).length;
        if (!visible)
          target.innerHTML = `<div class="kt-lz-feed-empty"><h3>No photo posts yet</h3><p>Try All posts to see every community story.</p></div>`;
      }
      const count = $("#kt-lz-community-count");
      if (count) {
        const visible =
          lzCommunityFilter === "photos"
            ? state.posts.filter((post) => !!post.photo).length
            : state.posts.length;
        count.textContent = `${visible} ${visible === 1 ? "story" : "stories"} in this view`;
      }
      $$("[data-lz-community-filter]").forEach((button) => {
        const active = button.dataset.lzCommunityFilter === lzCommunityFilter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
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
    root.classList.toggle(
      "kt-confirmed-map-dialog",
      extraClass === "kt-confirmed-map-dialog",
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
    $("#kt-lz-clear-filters")?.addEventListener("click", () => {
      $("#difficulty-filter").value = "";
      $("#location-filter").value = "";
      $("#date-filter").value = "";
      renderTrails();
      $("#difficulty-filter")?.focus();
    });
    $$("[data-lz-community-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        lzCommunityFilter = button.dataset.lzCommunityFilter;
        renderCommunity();
      }),
    );
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
