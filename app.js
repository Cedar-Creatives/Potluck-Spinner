/* ==========================================================================
   Cas Lagos End of Year Get-Together Potluck Spinner Application Engine
   ========================================================================== */

(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const FONT_BODY = '"Inter", system-ui, sans-serif';
  const FONT_EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

  // Categories definition
  const CATEGORIES = [
    { key: "mains", label: "Main Food & Soups", colors: ["#ff5c7c", "#e63946"] },
    { key: "chops", label: "Small Chops & Munchies", colors: ["#ffb703", "#fb8500"] },
    { key: "fresh", label: "Fresh Fruits & Desserts", colors: ["#2ec4b6", "#06d6a0"] },
    { key: "drinks", label: "Drinks & Wine", colors: ["#00f0ff", "#118ab2"] },
    { key: "extras", label: "Party Extras & Games", colors: ["#9d4edd", "#7209b7"] }
  ];

  const CAT_MAP = {};
  CATEGORIES.forEach((c, idx) => { CAT_MAP[c.key] = { ...c, index: idx }; });

  const NAME_COLORS = [
    "#ffb199", "#ffd98a", "#9fe0b4", "#96d5f0", "#f7b9d4", "#ffc9a8", "#c5eab0", "#b9e3f5"
  ];

  // Default menu incorporating user requested items
  const INITIAL_MENU = [
    // Main Food & Soups
    { id: "swallow-soup", emoji: "🍲", label: "Swallow and soup of choice", category: "mains" },
    { id: "goat-peppersoup", emoji: "🐐", label: "Goat meat Pepper soup", category: "mains" },
    { id: "fish-peppersoup", emoji: "🐟", label: "Fresh fish pepper soup", category: "mains" },
    { id: "jollof-rice", emoji: "🍚", label: "Jollof Rice Platter", category: "mains" },
    { id: "suya-platter", emoji: "🍢", label: "Grilled Peppered Suya", category: "mains" },
    { id: "grilled-chicken", emoji: "🍗", label: "BBQ Grilled Chicken", category: "mains" },
    { id: "fries-wings", emoji: "🍟", label: "French Fries & Wings", category: "mains" },
    { id: "fried-plantain", emoji: "🍌", label: "Fried Plantain (Dodo)", category: "mains" },
    { id: "sandwiches", emoji: "🥪", label: "Party Sandwiches", category: "mains" },

    // Small Chops & Munchies
    { id: "samosa", emoji: "🥟", label: "Samosa", category: "chops" },
    { id: "spring-rolls", emoji: "🥠", label: "Spring Rolls", category: "chops" },
    { id: "puff-puff", emoji: "🍩", label: "Puff-Puff", category: "chops" },
    { id: "peppered-gizzard", emoji: "🍗", label: "Peppered Gizzard", category: "chops" },
    { id: "chin-chin", emoji: "🥜", label: "Chin-Chin & Roasted Nuts", category: "chops" },

    // Fresh Fruits & Desserts
    { id: "watermelon-platter", emoji: "🍉", label: "Watermelon Platter", category: "fresh" },
    { id: "pineapple-bites", emoji: "🍍", label: "Pineapple Bites", category: "fresh" },
    { id: "fruit-salad", emoji: "🥗", label: "Fresh Fruit Salad", category: "fresh" },
    { id: "ice-cream", emoji: "🍦", label: "Ice Cream Tub", category: "fresh" },

    // Drinks & Wine
    { id: "wine", emoji: "🍷", label: "Wine (Red / White / Sparkling)", category: "drinks" },
    { id: "soft-drinks", emoji: "🥤", label: "Assorted Soft Drinks", category: "drinks" },
    { id: "juices", emoji: "🧃", label: "Fruit Juices & Chappers", category: "drinks" },
    { id: "ice-cooler", emoji: "🧊", label: "Ice Pack & Cooler", category: "drinks" },
    { id: "bottled-water", emoji: "💧", label: "Pack of Bottled Water", category: "drinks" },

    // Party Extras & Games
    { id: "sauces", emoji: "🥫", label: "Ketchup & Chili Sauces", category: "extras" },
    { id: "disposable-plates", emoji: "🍽️", label: "Disposable Plates & Cups", category: "extras" },
    { id: "cutlery-napkins", emoji: "🍴", label: "Cutlery & Napkins Pack", category: "extras" },
    { id: "board-games", emoji: "🎲", label: "Uno, Cards & Party Games", category: "extras" }
  ];

  const $ = (selector) => document.querySelector(selector);
  const STORAGE_KEY = "cas_lagos_potluck_state_v2";
  const DEVICE_KEY = "cas_lagos_potluck_device";
  const MY_GUEST_KEY = "cas_lagos_potluck_my_guest";
  const HOST_PIN = "1234";

  // Web Audio Synthesizer FX
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTickSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) { /* ignore audio errors */ }
  }

  function playVictorySound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const startTime = audioCtx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) { /* ignore audio errors */ }
  }

  // Helper functions
  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  function getMyGuestId() {
    return localStorage.getItem(MY_GUEST_KEY);
  }

  function setMyGuestId(id) {
    if (id) localStorage.setItem(MY_GUEST_KEY, id);
    else localStorage.removeItem(MY_GUEST_KEY);
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  }

  function mod(a, m) { return ((a % m) + m) % m; }

  /* ==========================================================================
     State Store (Multi-Tab & Real-time Live Sync)
     ========================================================================== */

  class Store {
    constructor() {
      this.listeners = new Set();
      this.channel = null;
      this.dbRef = null;
      this.isCloudConnected = false;

      try {
        if ("BroadcastChannel" in window) {
          this.channel = new BroadcastChannel("cas_lagos_potluck_sync");
          this.channel.onmessage = () => this.reload();
        }
      } catch (e) {}

      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY) this.reload();
      });

      this.data = this.load();
      this.initFirebase();
    }

    initFirebase() {
      try {
        if (typeof firebase !== "undefined") {
          // Default public Firebase Realtime Database for instant global multi-device sync
          const firebaseConfig = {
            databaseURL: "https://cas-lagos-potluck-default-rtdb.firebaseio.com"
          };

          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }

          this.dbRef = firebase.database().ref("potluck_live_state");

          // Listen globally for live changes from ANY phone/device across the internet
          this.dbRef.on("value", (snapshot) => {
            const val = snapshot.val();
            if (val && typeof val === "object" && val.items && val.guests) {
              this.data = val;
              this.isCloudConnected = true;
              this.updateSyncBadge(true, "🟢 Live Synced");
              try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)); } catch (e) {}
              this.notify();
            } else {
              // Initialize cloud state if empty
              this.pushCloud(this.data);
            }
          }, (err) => {
            console.warn("Firebase sync notice:", err);
            this.isCloudConnected = false;
            this.updateSyncBadge(false, "🟡 Offline / Local Mode");
          });
        }
      } catch (e) {
        console.warn("Firebase init:", e);
        this.isCloudConnected = false;
        this.updateSyncBadge(false, "🟡 Offline / Local Mode");
      }
    }

    pushCloud(data) {
      if (this.dbRef) {
        this.dbRef.set(data).catch(() => {});
      }
    }

    updateSyncBadge(online, text) {
      const badge = document.getElementById("sync-status-indicator");
      const label = document.getElementById("sync-status-text");
      if (badge && label) {
        label.textContent = text;
        if (online) {
          badge.classList.remove("offline");
        } else {
          badge.classList.add("offline");
        }
      }
    }

    load() {
      let raw = null;
      try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { raw = null; }
      if (!raw || typeof raw !== "object" || !raw.items || !raw.guests) {
        raw = {
          guests: {},
          items: {},
          activityLog: []
        };
        INITIAL_MENU.forEach((it, idx) => {
          raw.items[it.id] = {
            ...it,
            order: idx + 1,
            guestId: null,
            guestName: null,
            claimedAt: null
          };
        });
        this.save(raw);
      }
      return raw;
    }

    save(data) {
      this.data = data;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
      if (this.channel) this.channel.postMessage({ type: "UPDATE", ts: Date.now() });
      this.pushCloud(data);
      this.notify();
    }

    reload() {
      this.data = this.load();
      this.notify();
    }

    subscribe(fn) {
      this.listeners.add(fn);
      fn(this.snapshot());
    }

    notify() {
      const snap = this.snapshot();
      this.listeners.forEach(fn => fn(snap));
    }

    snapshot() {
      return {
        guests: Object.keys(this.data.guests).map(id => ({ id, ...this.data.guests[id] })),
        items: Object.keys(this.data.items).map(id => ({ id, ...this.data.items[id] })),
        activityLog: this.data.activityLog || []
      };
    }

    addGuest(name) {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const key = trimmed.toLowerCase();
      const existingId = Object.keys(this.data.guests).find(
        id => this.data.guests[id].name.toLowerCase() === key
      );
      if (existingId) return { id: existingId, name: this.data.guests[existingId].name, existing: true };

      let id = "g-" + (slugify(trimmed) || Math.random().toString(36).slice(2, 6));
      if (this.data.guests[id]) id += "-" + Math.random().toString(36).slice(2, 6);

      this.data.guests[id] = { name: trimmed, addedAt: Date.now(), deviceId: getDeviceId() };
      this.save(this.data);
      return { id, name: trimmed, existing: false };
    }

    removeGuest(id) {
      delete this.data.guests[id];
      // Release any item claimed by guest
      Object.values(this.data.items).forEach(it => {
        if (it.guestId === id) {
          it.guestId = null;
          it.guestName = null;
          it.claimedAt = null;
        }
      });
      this.save(this.data);
    }

    claimItem(guestId, candidateIds) {
      const guest = this.data.guests[guestId];
      if (!guest) return { success: false, reason: "Guest not found" };

      // Check if guest already has an item
      const existingItem = Object.values(this.data.items).find(it => it.guestId === guestId);
      if (existingItem) {
        return { success: true, item: existingItem, alreadyClaimed: true };
      }

      // Find available candidate
      const targetId = candidateIds.find(id => this.data.items[id] && !this.data.items[id].guestId);
      if (!targetId) return { success: false, reason: "No available dishes left" };

      const item = this.data.items[targetId];
      item.guestId = guestId;
      item.guestName = guest.name;
      item.claimedAt = Date.now();

      // Log activity
      if (!this.data.activityLog) this.data.activityLog = [];
      this.data.activityLog.unshift({
        text: `🔥 ${guest.name} claimed ${item.emoji} ${item.label}!`,
        time: Date.now()
      });
      this.data.activityLog = this.data.activityLog.slice(0, 10);

      this.save(this.data);
      return { success: true, item, alreadyClaimed: false };
    }

    releaseItem(itemId) {
      const item = this.data.items[itemId];
      if (item) {
        item.guestId = null;
        item.guestName = null;
        item.claimedAt = null;
        this.save(this.data);
      }
    }

    addItem({ label, emoji, category }) {
      let id = "x-" + (slugify(label) || Math.random().toString(36).slice(2, 6));
      if (this.data.items[id]) id += "-" + Math.random().toString(36).slice(2, 6);

      const maxOrder = Object.values(this.data.items).reduce((max, it) => Math.max(max, it.order || 0), 0);
      this.data.items[id] = {
        id,
        label: label.trim(),
        emoji: emoji.trim() || "🍲",
        category: CATEGORIES.some(c => c.key === category) ? category : "mains",
        order: maxOrder + 1,
        guestId: null,
        guestName: null,
        claimedAt: null
      };
      this.save(this.data);
    }

    removeItem(itemId) {
      delete this.data.items[itemId];
      this.save(this.data);
    }

    assignItem(guestName, itemId) {
      const item = this.data.items[itemId];
      if (!item) return;

      const guestRes = this.addGuest(guestName);
      if (!guestRes) return;

      // Release any previous item of this guest
      Object.values(this.data.items).forEach(it => {
        if (it.guestId === guestRes.id) {
          it.guestId = null;
          it.guestName = null;
          it.claimedAt = null;
        }
      });

      item.guestId = guestRes.id;
      item.guestName = guestRes.name;
      item.claimedAt = Date.now();
      this.save(this.data);
    }

    clearAllClaims() {
      Object.values(this.data.items).forEach(it => {
        it.guestId = null;
        it.guestName = null;
        it.claimedAt = null;
      });
      this.save(this.data);
    }
  }

  /* ==========================================================================
     HTML5 Canvas Wheel Physics Renderer
     ========================================================================== */

  class CanvasWheel {
    constructor(canvas, pointerEl, type) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.pointerEl = pointerEl;
      this.type = type;
      this.entries = [];
      this.emptyLabel = "No items";
      this.rotation = 0;
      this.size = 0;
      this.dpr = 1;
      this.lastSliceIdx = -1;
      this.faceCanvas = document.createElement("canvas");
      this.isDirty = true;
      this.highlightId = null;
      this.frozen = false;

      this.resize();
      window.addEventListener("resize", () => this.resize());

      // Touch / Drag events for mobile wheel interaction
      let isDragging = false;
      let startAngle = 0;
      let startRot = 0;
      let dragged = false;

      const getAngle = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return Math.atan2(clientY - cy, clientX - cx);
      };

      const onStart = (e) => {
        if (this.frozen || !this.entries.length || (window.app && window.app.isSpinning)) return;
        isDragging = true;
        dragged = false;
        startAngle = getAngle(e);
        startRot = this.rotation;
      };

      const onMove = (e) => {
        if (!isDragging) return;
        dragged = true;
        const currentAngle = getAngle(e);
        const delta = currentAngle - startAngle;
        this.rotation = startRot + delta;
        this.checkFlick();
        this.render();
      };

      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (window.app && !window.app.isSpinning) {
          if (this.type === "names") window.app.spinNames();
          else if (this.type === "food") window.app.spinFood();
        }
      };

      this.canvas.addEventListener("mousedown", onStart);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onEnd);

      this.canvas.addEventListener("touchstart", onStart, { passive: true });
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.round(rect.width);
      if (!width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      if (width === this.size && dpr === this.dpr) return;
      this.size = width;
      this.dpr = dpr;
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(width * dpr);
      this.isDirty = true;
      this.render();
    }

    setEntries(entries, emptyLabel) {
      if (this.frozen) return;
      this.entries = entries;
      this.emptyLabel = emptyLabel || "Empty";
      this.isDirty = true;
      this.render();
    }

    freeze() { this.frozen = true; }
    unfreeze() { this.frozen = false; this.isDirty = true; this.render(); }

    paintFace() {
      const s = this.size;
      const dpr = this.dpr;
      this.faceCanvas.width = Math.round(s * dpr);
      this.faceCanvas.height = Math.round(s * dpr);
      const ctx = this.faceCanvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const center = s / 2;
      const outerR = center - 2;
      const innerR = outerR - Math.max(6, s * 0.025);
      const count = this.entries.length;
      const sliceAngle = TAU / count;

      // Outer rim
      ctx.beginPath();
      ctx.arc(center, center, outerR, 0, TAU);
      ctx.fillStyle = "#120e24";
      ctx.fill();

      this.entries.forEach((e, i) => {
        const startAngle = -Math.PI / 2 + i * sliceAngle;
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, innerR, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = e.color;
        ctx.fill();

        if (count > 1) {
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.stroke();
        }
      });

      // Text and emoji render
      const isFood = this.type === "food";
      const fontSize = Math.max(10, Math.min(s * 0.048, sliceAngle * innerR * 0.32));
      const emojiSize = Math.max(14, Math.min(s * 0.07, sliceAngle * innerR * 0.45));

      this.entries.forEach((e, i) => {
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(-Math.PI / 2 + (i + 0.5) * sliceAngle);

        let textMaxR = innerR - Math.max(12, innerR * 0.08);

        if (isFood && e.emoji) {
          ctx.save();
          ctx.translate(innerR - emojiSize * 0.8, 0);
          ctx.rotate(Math.PI / 2);
          ctx.font = `${emojiSize}px ${FONT_EMOJI}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(e.emoji, 0, 0);
          ctx.restore();
          textMaxR = innerR - emojiSize * 1.6;
        }

        ctx.font = `700 ${fontSize}px ${FONT_BODY}`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#120e24";

        let text = e.label;
        if (ctx.measureText(text).width > textMaxR - innerR * 0.2) {
          while (text.length > 3 && ctx.measureText(text + "…").width > textMaxR - innerR * 0.2) {
            text = text.slice(0, -1);
          }
          text += "…";
        }

        ctx.fillText(text, textMaxR, 0);
        ctx.restore();
      });
    }

    render() {
      const s = this.size;
      if (!s) return;
      const ctx = this.ctx;
      const center = s / 2;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, s, s);

      if (!this.entries.length) {
        ctx.beginPath();
        ctx.arc(center, center, center - 2, 0, TAU);
        ctx.fillStyle = "#1d1838";
        ctx.fill();
        ctx.fillStyle = "#a7a1c4";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${Math.round(s * 0.05)}px ${FONT_BODY}`;
        ctx.fillText(this.emptyLabel, center, center);
        return;
      }

      if (this.isDirty) {
        this.paintFace();
        this.isDirty = false;
      }

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.faceCanvas, -center, -center, s, s);
      ctx.restore();

      // Center knob
      ctx.beginPath();
      ctx.arc(center, center, s * 0.08, 0, TAU);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#120e24";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(center, center, s * 0.03, 0, TAU);
      ctx.fillStyle = "#ff5c7c";
      ctx.fill();
    }

    checkFlick() {
      const count = this.entries.length;
      if (!count) return;
      const idx = Math.floor(mod(-this.rotation, TAU) / (TAU / count));
      if (idx !== this.lastSliceIdx) {
        this.lastSliceIdx = idx;
        playTickSound();
        if (this.pointerEl && typeof this.pointerEl.animate === "function") {
          this.pointerEl.animate(
            [{ transform: "translateX(-50%) rotate(-18deg)" }, { transform: "translateX(-50%) rotate(0deg)" }],
            { duration: 120, easing: "ease-out" }
          );
        }
      }
    }

    targetRotationFor(index, fraction) {
      return -(index + fraction) * (TAU / this.entries.length);
    }

    spinTo(winnerId) {
      const index = this.entries.findIndex(e => e.id === winnerId);
      const targetIndex = index >= 0 ? index : Math.floor(Math.random() * this.entries.length);
      const targetFrac = 0.2 + Math.random() * 0.6;
      const targetRot = this.targetRotationFor(targetIndex, targetFrac);

      const distance = mod(targetRot - this.rotation, TAU) + TAU * 4; // 4 full spins
      const duration = 3800; // 3.8s spin time
      const startRot = this.rotation;
      const startTime = performance.now();

      return new Promise((resolve) => {
        const step = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          // Ease out cubic
          const ease = 1 - Math.pow(1 - progress, 3.5);
          this.rotation = startRot + distance * ease;
          this.checkFlick();
          this.render();

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            this.rotation = mod(this.rotation, TAU);
            this.render();
            playVictorySound();
            resolve(this.entries[targetIndex]);
          }
        };
        requestAnimationFrame(step);
      });
    }
  }

  /* ==========================================================================
     Confetti Engine
     ========================================================================== */

  function triggerConfetti() {
    const canvas = $("#confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    canvas.hidden = false;

    const colors = ["#ff5c7c", "#ffb703", "#00f0ff", "#2ec4b6", "#9d4edd", "#ffffff"];
    const particles = Array.from({ length: 120 }, () => ({
      x: w / 2,
      y: h * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * TAU,
      vRot: (Math.random() - 0.5) * 0.3
    }));

    const startTime = performance.now();
    const duration = 2200;

    function frame(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - elapsed / duration);

      particles.forEach(p => {
        p.vy += 0.4; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        canvas.hidden = true;
      }
    }
    requestAnimationFrame(frame);
  }

  /* ==========================================================================
     Application Coordinator & UI Logic
     ========================================================================== */

  class App {
    constructor() {
      this.store = new Store();
      this.activeGuest = null; // { id, name }
      this.isSpinning = false;
      this.isHostUnlocked = false;

      this.nameWheel = new CanvasWheel($("#name-wheel-canvas"), $("#name-pointer"), "names");
      this.foodWheel = new CanvasWheel($("#food-wheel-canvas"), $("#food-pointer"), "food");

      this.bindEvents();
      this.store.subscribe((snap) => this.render(snap));

      // Check URL for host parameter
      const params = new URLSearchParams(window.location.search);
      if (params.has("host")) {
        this.unlockHost();
      }
    }

    toast(msg) {
      const container = $("#toast-container");
      const toastEl = document.createElement("div");
      toastEl.className = "toast-msg";
      toastEl.textContent = msg;
      container.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), 3200);
    }

    unlockHost() {
      this.isHostUnlocked = true;
      $("#host-pin-modal").hidden = true;
      $("#host-pin-input").value = "";
      $("#host-panel").hidden = false;
      this.store.notify();
      setTimeout(() => {
        $("#host-panel").scrollIntoView({ behavior: "smooth" });
      }, 100);
      this.toast("🔓 Host Admin Dashboard Unlocked!");
    }

    bindEvents() {
      // Sound Toggle
      $("#sound-toggle-btn").addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        $("#sound-toggle-btn").textContent = soundEnabled ? "🔊" : "🔇";
        this.toast(soundEnabled ? "Sound FX Enabled" : "Sound FX Muted");
      });

      // Theme Toggle
      $("#theme-toggle-btn").addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        $("#theme-toggle-btn").textContent = next === "light" ? "☀️" : "🌙";
        this.nameWheel.isDirty = true;
        this.nameWheel.render();
        this.foodWheel.isDirty = true;
        this.foodWheel.render();
      });

      // Host Trigger
      $("#host-trigger-btn").addEventListener("click", () => {
        if (this.isHostUnlocked) {
          $("#host-panel").scrollIntoView({ behavior: "smooth" });
        } else {
          $("#host-pin-modal").hidden = false;
          $("#host-pin-input").focus();
        }
      });

      // Mobile Sticky Bar Triggers
      const mobileSpinBtn = $("#mobile-spin-btn");
      if (mobileSpinBtn) {
        mobileSpinBtn.addEventListener("click", () => {
          if (this.activeGuest) {
            this.spinFood();
          } else {
            this.spinNames();
          }
        });
      }

      const mobileWhatsappBtn = $("#mobile-whatsapp-btn");
      if (mobileWhatsappBtn) {
        mobileWhatsappBtn.addEventListener("click", () => this.shareLineupWhatsApp());
      }

      $("#host-pin-close").addEventListener("click", () => {
        $("#host-pin-modal").hidden = true;
      });

      $("#host-pin-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const pin = $("#host-pin-input").value;
        if (pin === HOST_PIN) {
          $("#host-pin-modal").hidden = true;
          this.unlockHost();
        } else {
          this.toast("❌ Invalid Host PIN");
        }
      });

      // Add guest form
      $("#add-guest-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $("#guest-name-input");
        const name = input.value.trim();
        if (!name) return;

        const res = this.store.addGuest(name);
        input.value = "";
        if (res) {
          if (res.existing) {
            this.toast(`Found ${res.name} on the list!`);
          } else {
            this.toast(`Added ${res.name} to party list!`);
          }
          this.activeGuest = { id: res.id, name: res.name };
          setMyGuestId(res.id);
          this.store.notify();
        }
      });

      // Change guest
      $("#change-guest-btn").addEventListener("click", () => {
        if (this.isSpinning) return;
        this.activeGuest = null;
        this.store.notify();
      });

      // Spin Names Button
      $("#spin-names-btn").addEventListener("click", () => this.spinNames());

      // Spin Food Button
      $("#spin-food-btn").addEventListener("click", () => this.spinFood());

      // Share My Item on WhatsApp
      $("#share-my-item-btn").addEventListener("click", () => this.shareMyItemWhatsApp());

      // Lineup WhatsApp Share
      $("#whatsapp-share-btn").addEventListener("click", () => this.shareLineupWhatsApp());

      // Reveal modal share
      $("#reveal-share-btn").addEventListener("click", () => this.shareMyItemWhatsApp());

      $("#reveal-close-btn").addEventListener("click", () => {
        $("#reveal-modal").hidden = true;
        $("#lineup").scrollIntoView({ behavior: "smooth" });
      });

      // Host forms
      $("#host-assign-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const guestName = $("#host-guest-input").value;
        const itemId = $("#host-item-select").value;
        this.store.assignItem(guestName, itemId);
        $("#host-guest-input").value = "";
        this.toast(`Assigned dish to ${guestName}`);
      });

      $("#host-add-item-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const label = $("#host-label-input").value;
        const emoji = $("#host-emoji-input").value;
        const category = $("#host-cat-select").value;
        this.store.addItem({ label, emoji, category });
        $("#host-label-input").value = "";
        $("#host-emoji-input").value = "";
        this.toast(`Added ${label} to menu!`);
      });

      $("#host-clear-all-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all claimed dishes?")) {
          this.store.clearAllClaims();
          setMyGuestId(null);
          this.activeGuest = null;
          this.toast("Cleared all claimed dishes!");
        }
      });
    }

    async spinNames() {
      if (this.isSpinning) return;
      const snap = this.store.snapshot();
      const claimedSet = new Set(snap.items.filter(it => it.guestId).map(it => it.guestId));
      const waitingGuests = snap.guests.filter(g => !claimedSet.has(g.id));

      if (!waitingGuests.length) {
        this.toast("Everyone has already spun for a dish!");
        return;
      }

      this.isSpinning = true;
      this.nameWheel.freeze();
      this.foodWheel.freeze();

      const randomWinner = waitingGuests[Math.floor(Math.random() * waitingGuests.length)];
      await this.nameWheel.spinTo(randomWinner.id);

      this.activeGuest = { id: randomWinner.id, name: randomWinner.name };
      this.isSpinning = false;
      this.nameWheel.unfreeze();
      this.foodWheel.unfreeze();

      this.toast(`🎉 ${randomWinner.name} is up! Now spin the food wheel!`);
      this.store.notify();
    }

    async spinFood() {
      if (this.isSpinning || !this.activeGuest) return;
      const snap = this.store.snapshot();
      const openItems = snap.items.filter(it => !it.guestId);

      if (!openItems.length) {
        this.toast("All dishes on the menu have been claimed!");
        return;
      }

      this.isSpinning = true;
      this.nameWheel.freeze();
      this.foodWheel.freeze();

      const candidateIds = openItems.map(it => it.id);
      // Pick random winner candidate
      const selectedId = candidateIds[Math.floor(Math.random() * candidateIds.length)];

      const winnerItem = await this.foodWheel.spinTo(selectedId);

      const claimResult = this.store.claimItem(this.activeGuest.id, [winnerItem ? winnerItem.id : selectedId]);

      this.isSpinning = false;
      this.nameWheel.unfreeze();
      this.foodWheel.unfreeze();

      if (claimResult.success) {
        setMyGuestId(this.activeGuest.id);
        const item = claimResult.item;

        // Show Reveal Modal & Confetti
        $("#reveal-guest-name").textContent = this.activeGuest.name;
        $("#reveal-item-name").textContent = `${item.emoji} ${item.label}`;
        $("#reveal-emoji").textContent = item.emoji || "🎉";
        $("#reveal-modal").hidden = false;

        triggerConfetti();
        this.store.notify();
      } else {
        this.toast(claimResult.reason || "Could not claim dish.");
      }
    }

    shareMyItemWhatsApp() {
      const myId = getMyGuestId();
      const snap = this.store.snapshot();
      const myGuest = snap.guests.find(g => g.id === myId);
      const myItem = snap.items.find(it => it.guestId === myId);

      let text = "";
      if (myGuest && myItem) {
        text = `🎉 *CAS LAGOS GET-TOGETHER POTLUCK*\n\n` +
               `I just spun the chop spinner! 🎲\n` +
               `👤 *${myGuest.name}* is bringing: ${myItem.emoji} *${myItem.label}*\n\n` +
               `Spin for your dish now so nobody brings duplicate food! 🍲🍷`;
      } else {
        text = `🎉 *CAS LAGOS GROUP END OF YEAR GET-TOGETHER*\nJoin the Chop Spinner and spin for your dish! 🍲🍷`;
      }

      const encoded = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    }

    shareLineupWhatsApp() {
      const snap = this.store.snapshot();
      const total = snap.items.length;
      const claimed = snap.items.filter(it => it.guestId).length;

      const lines = [
        `🔥 *CAS LAGOS END OF YEAR GET-TOGETHER CHOP SPINNER* 🔥`,
        `_One person, one dish — ${claimed} of ${total} items claimed_`,
        ``
      ];

      let num = 0;
      CATEGORIES.forEach(cat => {
        const catItems = snap.items.filter(it => (it.category || "mains") === cat.key);
        if (!catItems.length) return;
        lines.push(`*${cat.label}*`);
        catItems.forEach(it => {
          num += 1;
          const status = it.guestId ? `👉 *${it.guestName}*` : `_OPEN_`;
          lines.push(`${num}. ${it.emoji} ${it.label}: ${status}`);
        });
        lines.push(``);
      });

      lines.push(`Spin for your dish now so we don't bring duplicate soup or drinks! 🎉`);
      const fullText = lines.join("\n");

      if (navigator.share) {
        navigator.share({ title: "Cas Lagos Potluck Lineup", text: fullText }).catch(() => {});
      } else {
        const encoded = encodeURIComponent(fullText);
        window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
      }
    }

    render(snap) {
      const totalItems = snap.items.length;
      const claimedItems = snap.items.filter(it => it.guestId).length;
      const myId = getMyGuestId();
      const myItem = snap.items.find(it => it.guestId === myId);
      const myGuest = snap.guests.find(g => g.id === myId);

      // Meter Bar Update
      const pct = totalItems ? (claimedItems / totalItems) * 100 : 0;
      $("#meter-fill-bar").style.width = pct + "%";
      $("#meter-status-text").textContent = `${claimedItems} of ${totalItems} dishes claimed`;
      $("#meter-count-text").textContent = `${Math.round(pct)}% ready`;

      if (myItem && myGuest) {
        $("#my-status-badge").hidden = false;
        $("#my-badge-emoji").textContent = myItem.emoji || "🍲";
        $("#my-badge-item").textContent = myItem.label;
      } else {
        $("#my-status-badge").hidden = true;
      }

      // Ticker update
      if (snap.activityLog && snap.activityLog.length) {
        const logHtml = snap.activityLog.map(act => `<div class="ticker-item">${act.text}</div>`).join("");
        $("#ticker-content").innerHTML = logHtml + logHtml;
      }

      // Wheels Entries Update
      const claimedSet = new Set(snap.items.filter(it => it.guestId).map(it => it.guestId));
      const waitingGuests = snap.guests.filter(g => !claimedSet.has(g.id));

      const nameEntries = waitingGuests.map((g, i) => ({
        id: g.id,
        label: g.name,
        color: NAME_COLORS[i % NAME_COLORS.length]
      }));
      this.nameWheel.setEntries(nameEntries, waitingGuests.length ? "" : "All guests sorted!");
      $("#name-subtext").textContent = `${waitingGuests.length} guests waiting to spin`;

      const openItems = snap.items.filter(it => !it.guestId);
      const catCount = {};
      const foodEntries = openItems.map(it => {
        const catKey = it.category || "mains";
        catCount[catKey] = (catCount[catKey] || 0) + 1;
        const catObj = CAT_MAP[catKey] || CATEGORIES[0];
        return {
          id: it.id,
          label: it.label,
          emoji: it.emoji,
          color: catObj.colors[catCount[catKey] % 2]
        };
      });
      this.foodWheel.setEntries(foodEntries, openItems.length ? "" : "All dishes claimed!");
      $("#food-subtext").textContent = `${openItems.length} dishes open on menu`;

      // Legend
      const legend = $("#category-legend");
      legend.innerHTML = CATEGORIES.map(cat => `
        <li class="legend-item">
          <span class="legend-swatch" style="background: ${cat.colors[0]};"></span>
          <span>${cat.label}</span>
        </li>
      `).join("");

      // Guest Chips
      const chipsContainer = $("#guest-chips-container");
      if (!waitingGuests.length) {
        chipsContainer.innerHTML = `<p style="font-size: 13px; color: var(--text-muted);">Everyone on the list has been assigned a dish!</p>`;
      } else {
        chipsContainer.innerHTML = waitingGuests.map(g => `
          <div class="chip-item ${this.activeGuest && this.activeGuest.id === g.id ? 'active' : ''}">
            <button type="button" class="chip-btn" data-guest-id="${g.id}">${g.name}</button>
            ${this.isHostUnlocked ? `<button type="button" class="chip-del" data-del-id="${g.id}">×</button>` : ''}
          </div>
        `).join("");

        chipsContainer.querySelectorAll("[data-guest-id]").forEach(btn => {
          btn.addEventListener("click", (e) => {
            if (this.isSpinning) return;
            const gid = e.target.getAttribute("data-guest-id");
            const gObj = waitingGuests.find(g => g.id === gid);
            if (gObj) {
              this.activeGuest = { id: gObj.id, name: gObj.name };
              this.store.notify();
            }
          });
        });

        chipsContainer.querySelectorAll("[data-del-id]").forEach(btn => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const delId = e.target.getAttribute("data-del-id");
            this.store.removeGuest(delId);
          });
        });
      }

      // Action Panel state logic
      const mobileSpinBtn = $("#mobile-spin-btn");
      if (myGuest && myItem) {
        $("#pick-choice-view").hidden = true;
        $("#pick-active-view").hidden = true;
        $("#pick-locked-view").hidden = false;
        $("#locked-item-name").textContent = `${myItem.emoji} ${myItem.label}`;
        if (mobileSpinBtn) mobileSpinBtn.textContent = `🎉 My Dish: ${myItem.emoji}`;
      } else if (this.activeGuest) {
        $("#pick-choice-view").hidden = true;
        $("#pick-active-view").hidden = false;
        $("#pick-locked-view").hidden = true;
        $("#active-guest-name").textContent = this.activeGuest.name;
        $("#spin-food-btn").disabled = this.isSpinning || !openItems.length;
        $("#spin-food-btn").querySelector("span").textContent = `✨ Spin Food for ${this.activeGuest.name}`;
        if (mobileSpinBtn) mobileSpinBtn.textContent = `✨ Spin for ${this.activeGuest.name}`;
      } else {
        $("#pick-choice-view").hidden = false;
        $("#pick-active-view").hidden = true;
        $("#pick-locked-view").hidden = true;
        $("#spin-food-btn").disabled = true;
        $("#spin-food-btn").querySelector("span").textContent = `✨ Select Name First`;
        if (mobileSpinBtn) mobileSpinBtn.textContent = `🎲 Spin Names`;
      }

      // Board Lineup Columns
      const boardContainer = $("#board-columns-container");
      boardContainer.innerHTML = "";

      let overallNum = 0;
      CATEGORIES.forEach(cat => {
        const groupItems = snap.items.filter(it => (it.category || "mains") === cat.key);
        if (!groupItems.length) return;

        const groupEl = document.createElement("div");
        groupEl.className = "board-group";
        const claimedInGroup = groupItems.filter(it => it.guestId).length;

        groupEl.innerHTML = `
          <div class="group-title" style="color: ${cat.colors[0]};">
            <span class="legend-swatch" style="background: ${cat.colors[0]};"></span>
            <span>${cat.label}</span>
            <span class="group-badge">${claimedInGroup}/${groupItems.length}</span>
          </div>
          <ul class="items-list">
            ${groupItems.map(it => {
              overallNum += 1;
              const isMine = myItem && myItem.id === it.id;
              const whoLabel = it.guestId ? it.guestName : "OPEN";
              const openClass = it.guestId ? "" : "open";
              return `
                <li class="item-row ${isMine ? 'is-mine' : ''}">
                  <span class="item-num">${String(overallNum).padStart(2, '0')}</span>
                  <span class="item-emoji">${it.emoji}</span>
                  <span class="item-name">${it.label}</span>
                  <span class="item-who ${openClass}">${whoLabel}</span>
                  ${this.isHostUnlocked && it.guestId ? `<button class="action-icon-btn" data-release-item="${it.id}" title="Release Item">↺</button>` : ''}
                  ${this.isHostUnlocked && !it.guestId ? `<button class="action-icon-btn" data-remove-item="${it.id}" title="Remove Item">×</button>` : ''}
                </li>
              `;
            }).join("")}
          </ul>
        `;
        boardContainer.appendChild(groupEl);
      });

      // Bind host action buttons on board
      if (this.isHostUnlocked) {
        boardContainer.querySelectorAll("[data-release-item]").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-release-item");
            this.store.releaseItem(id);
            this.toast("Released item back to open!");
          });
        });
        boardContainer.querySelectorAll("[data-remove-item]").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-remove-item");
            this.store.removeItem(id);
            this.toast("Removed item from menu!");
          });
        });

        // Update Host Form Select Options
        const itemSelect = $("#host-item-select");
        const openOptions = openItems.map(it => `<option value="${it.id}">${it.emoji} ${it.label}</option>`).join("");
        itemSelect.innerHTML = openOptions || `<option value="">No open dishes left</option>`;

        const catSelect = $("#host-cat-select");
        catSelect.innerHTML = CATEGORIES.map(c => `<option value="${c.key}">${c.label}</option>`).join("");
      }
    }
  }

  // Initialize App on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    window.app = new App();
  });

})();
