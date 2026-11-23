(function () {
	"use strict";

	var reduceMotion =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	var root = document.documentElement;
	var targetMx = 0,
		targetMy = 0,
		curMx = 0,
		curMy = 0;
	var curT = 0;
	var targetPress = 0,
		curPress = 0;
	var kick = 0;
	var lastPX = null,
		lastPY = null;

	/* ---------- text vanishes on first interaction ---------- */

	var hasInteracted = false;
	function vanishHero() {
		if (hasInteracted) return;
		hasInteracted = true;
		var ht = document.getElementById("heroText");
		if (ht) ht.classList.add("vanish");
	}
	window.addEventListener("touchstart", vanishHero, {
		passive: true,
		once: true
	});
	window.addEventListener("mousedown", vanishHero, {
		passive: true,
		once: true
	});
	window.addEventListener("mousemove", vanishHero, {
		passive: true,
		once: true
	});

	/* ---------- pointer tracking ---------- */

	function setPointer(clientX, clientY) {
		var nx = clientX / window.innerWidth - 0.5;
		var ny = clientY / window.innerHeight - 0.5;
		targetMx = Math.max(-0.5, Math.min(0.5, nx));
		targetMy = Math.max(-0.5, Math.min(0.5, ny));

		if (lastPX !== null && !reduceMotion) {
			var dx = clientX - lastPX,
				dy = clientY - lastPY;
			var mag = Math.sqrt(dx * dx + dy * dy);
			kick = Math.min(1.6, kick + mag * 0.0032);
		}
		lastPX = clientX;
		lastPY = clientY;
	}

	window.addEventListener(
		"mousemove",
		function (e) {
			setPointer(e.clientX, e.clientY);
			spawnFogBurst(e.clientX, e.clientY);
		},
		{ passive: true }
	);

	window.addEventListener(
		"touchmove",
		function (e) {
			if (e.touches && e.touches[0]) {
				setPointer(e.touches[0].clientX, e.touches[0].clientY);
				spawnFogBurst(e.touches[0].clientX, e.touches[0].clientY);
			}
		},
		{ passive: true }
	);

	function press(on) {
		targetPress = on ? 1 : 0;
	}
	window.addEventListener(
		"mousedown",
		function (e) {
			press(true);
			spawnFogBurst(e.clientX, e.clientY);
		},
		{ passive: true }
	);
	window.addEventListener(
		"mouseup",
		function () {
			press(false);
		},
		{ passive: true }
	);
	window.addEventListener(
		"mouseleave",
		function () {
			press(false);
		},
		{ passive: true }
	);
	window.addEventListener(
		"touchstart",
		function (e) {
			press(true);
			if (e.touches && e.touches[0]) {
				lastPX = e.touches[0].clientX;
				lastPY = e.touches[0].clientY;
				spawnFogBurst(e.touches[0].clientX, e.touches[0].clientY);
			}
		},
		{ passive: true }
	);
	window.addEventListener(
		"touchend",
		function () {
			press(false);
		},
		{ passive: true }
	);
	window.addEventListener(
		"touchcancel",
		function () {
			press(false);
		},
		{ passive: true }
	);

	/* ---------- narration: the story, paragraph by paragraph ---------- */
	/* each beat's x must match its group's translate() in the world-far svg */

	var FAR_SWEEP = 11000; // must match the -11000px multiplier on .world-far-wrap
	var SIRENS_FRACTION = 6050 / FAR_SWEEP; // 0.55, where the mast scene appears

	var beats = [
		{
			x: 150,
			label: "Troy",
			text: "Troy burns behind him; the long way home begins."
		},
		{
			x: 990,
			label: "The Lotus-Eaters",
			text: "Taste the lotus, and you forget you ever wished to leave."
		},
		{
			x: 1980,
			label: "The Cyclops",
			text: "He blinds the giant, then boasts his name too loudly to the wind."
		},
		{
			x: 2970,
			label: "Aeolus",
			text: "Within sight of home, curiosity loosens the wrong knot."
		},
		{
			x: 3960,
			label: "The Laestrygonians",
			text: "Eleven ships are lost to giants before the twelfth slips free."
		},
		{
			x: 4950,
			label: "Circe",
			text: "Her wand makes swine of men who could not resist her table."
		},
		{
			x: 6050,
			label: "The Sirens",
			text: "Bind me to the mast, and whatever I beg, do not set me free."
		},
		{
			x: 7040,
			label: "Scylla & Charybdis",
			text: "Better to lose six men to the monster than the ship to the sea."
		},
		{
			x: 8030,
			label: "Thrinacia",
			text: "Hungry men kill what the sun god forbids, and pay for it in full."
		},
		{
			x: 9020,
			label: "Calypso",
			text: "Immortality is offered; he chooses, instead, to grow old."
		},
		{
			x: 9900,
			label: "Scheria",
			text: "Strangers feed him, hear his story, and carry him home."
		},
		{
			x: 11250,
			label: "Ithaca",
			text: "Twenty years gone — and she is still waiting, still weaving."
		}
	];

	var currentBeat = -1;
	var narrationEl = document.getElementById("narration");
	var narrationLabelEl = document.getElementById("narrationLabel");
	var narrationTextEl = document.getElementById("narrationText");
	var sceneEl = document.getElementById("scene");

	function nearestBeat(worldX) {
		var bestI = 0,
			bestD = Infinity;
		for (var i = 0; i < beats.length; i++) {
			var d = Math.abs(beats[i].x - worldX);
			if (d < bestD) {
				bestD = d;
				bestI = i;
			}
		}
		return bestI;
	}

	function applyBeat(i) {
		narrationLabelEl.textContent = beats[i].label;
		narrationTextEl.textContent = beats[i].text;
	}

	function updateNarration(t) {
		var worldX = t * FAR_SWEEP;
		var idx = nearestBeat(worldX);
		if (idx === currentBeat) return;
		currentBeat = idx;
		if (narrationEl.classList.contains("show")) {
			narrationEl.classList.add("fading");
			setTimeout(function () {
				applyBeat(idx);
				narrationEl.classList.remove("fading");
			}, 420);
		} else {
			applyBeat(idx);
			narrationEl.classList.add("show");
		}
	}

	function updateSirensScene(t) {
		if (!sceneEl) return;
		var near = !reduceMotion && Math.abs(t - SIRENS_FRACTION) < 0.035;
		sceneEl.classList.toggle("sirens-near", near);
	}

	/* ---------- the voyage: a slow autoplay sail, no scrolling involved ---------- */
	/* the ship sways left/right while the coastline and sea life sail past   */
	/* it at a much larger amplitude, behind/around a roughly stationary ship. */
	/* several independent, incommensurate periods are layered together so   */
	/* the pacing, swell and weather never feel like one clean repeating loop */

	var voyageStart = performance.now();
	var T1 = 480000; // ms, primary slow cruise across the whole Odyssey
	var T2 = 151000; // ms, secondary chaos
	var T3 = 77000; // ms, tertiary chaos
	var SWELL1 = 22000,
		SWELL2 = 9200; // ms, sea-level swell
	var STORM1 = 195000,
		STORM2 = 71000; // ms, weather cycle

	function lerp(a, b, n) {
		return a + (b - a) * n;
	}

	var distortMapEl = document.getElementById("distortMap");

	function tick(now) {
		now = now || performance.now();
		var el = now - voyageStart;

		var ease = reduceMotion ? 1 : 0.06;
		curMx = lerp(curMx, targetMx, ease);
		curMy = lerp(curMy, targetMy, ease);
		curPress = lerp(curPress, targetPress, reduceMotion ? 1 : 0.08);
		kick = kick * (reduceMotion ? 0 : 0.9);

		var p1 = (el / T1) * Math.PI * 2;
		var p2 = (el / T2) * Math.PI * 2 + 1.3;
		var p3 = (el / T3) * Math.PI * 2 + 3.1;

		var voyageRaw =
			0.55 * Math.sin(p1) + 0.3 * Math.sin(p2) + 0.15 * Math.sin(p3);
		var voyageT = reduceMotion
			? 0.4
			: Math.max(0, Math.min(1, (voyageRaw + 1) / 2));
		curT = voyageT;
		updateNarration(curT);
		updateSirensScene(curT);

		var shipSway = reduceMotion
			? 0
			: Math.sin(p1) * 55 + Math.sin(p2 * 1.4 + 0.7) * 16;

		var stormRaw =
			0.6 * Math.sin((el / STORM1) * Math.PI * 2) +
			0.4 * Math.sin((el / STORM2) * Math.PI * 2 + 1.7);
		var storm01 = Math.max(0, Math.min(1, (stormRaw + 1) / 2));
		var storm = reduceMotion ? 0.12 : Math.pow(storm01, 1.6);

		var seaLevel = reduceMotion
			? 0
			: (Math.sin((el / SWELL1) * Math.PI * 2 + 0.4) * 48 +
					Math.sin((el / SWELL2) * Math.PI * 2 + 2.1) * 26) *
			  (1 + storm * 0.6);

		var bounceAmp = 4 + curT * 9 + Math.min(1.2, kick) * 8 + storm * 10;
		var bounce = reduceMotion
			? curT * 6
			: Math.sin(now * 0.0042 + curT * 6) * bounceAmp;

		root.style.setProperty("--mx", curMx.toFixed(4));
		root.style.setProperty("--my", curMy.toFixed(4));
		root.style.setProperty("--t", curT.toFixed(4));
		root.style.setProperty("--press", curPress.toFixed(4));
		root.style.setProperty("--kick", Math.min(1.2, kick).toFixed(4));
		root.style.setProperty("--bounce", bounce.toFixed(2));
		root.style.setProperty("--shipSway", shipSway.toFixed(2));
		root.style.setProperty("--seaLevel", seaLevel.toFixed(2));
		root.style.setProperty("--storm", storm.toFixed(4));

		if (distortMapEl) {
			var dScale = curPress * 30 + Math.min(1.2, kick) * 12;
			distortMapEl.setAttribute("scale", dScale.toFixed(1));
		}

		if (curPress > 0.3 && lastPX !== null && !reduceMotion) {
			spawnFogBurst(lastPX, lastPY, true);
		}

		requestAnimationFrame(tick);
	}
	requestAnimationFrame(tick);

	/* ---------- fog / breeze particle canvas ---------- */

	var fogCanvas = document.getElementById("fogCanvas");
	var fctx = fogCanvas.getContext("2d");
	var particles = [];
	var fw = 0,
		fh = 0,
		dpr = Math.min(window.devicePixelRatio || 1, 2);

	function resizeFog() {
		fw = window.innerWidth;
		fh = window.innerHeight;
		fogCanvas.width = fw * dpr;
		fogCanvas.height = fh * dpr;
		fogCanvas.style.width = fw + "px";
		fogCanvas.style.height = fh + "px";
		fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
	resizeFog();
	window.addEventListener("resize", resizeFog);

	function makeParticle(x, y, opts) {
		opts = opts || {};
		return {
			x: x,
			y: y,
			r: opts.r || 18 + Math.random() * 30,
			vx: opts.vx != null ? opts.vx : 0.15 + Math.random() * 0.3,
			vy: opts.vy != null ? opts.vy : (Math.random() - 0.5) * 0.12,
			life: 0,
			maxLife: opts.maxLife || 5 + Math.random() * 4,
			alpha: 0,
			maxAlpha: opts.maxAlpha || 0.1 + Math.random() * 0.12
		};
	}

	var maxAmbient = reduceMotion ? 0 : 26;
	function ambientSpawn() {
		if (particles.length < maxAmbient) {
			particles.push(
				makeParticle(
					-40 + Math.random() * 40,
					fh * 0.25 + Math.random() * fh * 0.45,
					{ vx: 0.2 + Math.random() * 0.35 }
				)
			);
		}
	}

	var lastBurst = 0;
	function spawnFogBurst(clientX, clientY, isGust) {
		if (reduceMotion) return;
		var now = performance.now();
		var minGap = isGust ? 90 : 40;
		if (now - lastBurst < minGap) return;
		lastBurst = now;
		var count = isGust ? 1 : 2;
		for (var i = 0; i < count; i++) {
			particles.push(
				makeParticle(clientX, clientY, {
					r: 10 + Math.random() * 22,
					vx: 0.6 + Math.random() * 1.4,
					vy: (Math.random() - 0.5) * 0.6,
					maxLife: 2.4 + Math.random() * 1.4,
					maxAlpha: 0.18 + Math.random() * 0.18
				})
			);
		}
		if (particles.length > 160) particles.splice(0, particles.length - 160);
	}

	var lastFrame = performance.now();
	function drawFog(now) {
		var dt = Math.min(0.05, (now - lastFrame) / 1000);
		lastFrame = now;

		fctx.clearRect(0, 0, fw, fh);

		if (Math.random() < 0.6) ambientSpawn();

		for (var i = particles.length - 1; i >= 0; i--) {
			var p = particles[i];
			p.life += dt;
			p.x += p.vx * (dt * 60);
			p.y += p.vy * (dt * 60);

			var lifeRatio = p.life / p.maxLife;
			if (lifeRatio >= 1) {
				particles.splice(i, 1);
				continue;
			}

			if (lifeRatio < 0.2) {
				p.alpha = p.maxAlpha * (lifeRatio / 0.2);
			} else if (lifeRatio > 0.7) {
				p.alpha = p.maxAlpha * (1 - (lifeRatio - 0.7) / 0.3);
			} else {
				p.alpha = p.maxAlpha;
			}

			var grad = fctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
			grad.addColorStop(0, "rgba(248,228,180," + p.alpha + ")");
			grad.addColorStop(1, "rgba(248,228,180,0)");
			fctx.fillStyle = grad;
			fctx.beginPath();
			fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
			fctx.fill();

			if (p.x - p.r > fw + 60 || p.x + p.r < -60) {
				particles.splice(i, 1);
			}
		}

		requestAnimationFrame(drawFog);
	}
	requestAnimationFrame(drawFog);

	/* ---------- film grain ---------- */

	var grainCanvas = document.getElementById("grainCanvas");
	var gctx = grainCanvas.getContext("2d");
	var GR = 140;
	grainCanvas.width = GR;
	grainCanvas.height = GR;

	function paintGrain() {
		var imgData = gctx.createImageData(GR, GR);
		var d = imgData.data;
		for (var i = 0; i < d.length; i += 4) {
			var v = Math.random() * 255;
			d[i] = v;
			d[i + 1] = v;
			d[i + 2] = v;
			d[i + 3] = 255;
		}
		gctx.putImageData(imgData, 0, 0);
	}
	paintGrain();

	if (!reduceMotion) {
		setInterval(paintGrain, 90);
	}
})();