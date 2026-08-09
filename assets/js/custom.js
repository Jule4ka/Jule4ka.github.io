/* ============================================================
   Julia Paranich — site interactivity
   Progressive enhancement only: nothing here is required for
   the content to be readable. Runs after DOM is ready.
   ============================================================ */
(function () {
	"use strict";

	var reduceMotion = window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	function ready(fn) {
		if (document.readyState !== "loading") fn();
		else document.addEventListener("DOMContentLoaded", fn);
	}

	/* --- 1. Scroll progress bar + sticky-nav state + back-to-top --- */
	function scrollChrome() {
		var bar = document.createElement("div");
		bar.id = "scroll-progress";
		document.body.appendChild(bar);

		var top = document.createElement("button");
		top.id = "to-top";
		top.setAttribute("aria-label", "Back to top");
		top.innerHTML =
			'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
			'stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
			'<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
		document.body.appendChild(top);
		top.addEventListener("click", function () {
			window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
		});

		var ticking = false;
		function update() {
			var doc = document.documentElement;
			var max = doc.scrollHeight - doc.clientHeight;
			var y = window.scrollY || doc.scrollTop;
			bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
			document.body.classList.toggle("scrolled", y > 24);
			top.classList.toggle("show", y > 600);
			ticking = false;
		}
		window.addEventListener("scroll", function () {
			if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
		}, { passive: true });
		update();
	}

	/* --- 2. Scroll reveal for content blocks --- */
	function revealOnScroll() {
		var targets = document.querySelectorAll(
			".postindex article, .polaroid, .gallery a, " +
			".body-content > h1, .body-content > h2, .body-content > h3, " +
			".body-content > p, .body-content > ul, .body-content > blockquote, " +
			".body-content .d-flex.flex-wrap > div, .e-content > *"
		);
		if (!targets.length) return;

		if (reduceMotion || !("IntersectionObserver" in window)) {
			targets.forEach(function (el) { el.classList.add("is-visible"); });
			return;
		}

		var io = new IntersectionObserver(function (entries, obs) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					obs.unobserve(entry.target);
				}
			});
		}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

		targets.forEach(function (el, i) {
			el.classList.add("js-reveal");
			// small stagger within a group, capped so nothing lags far behind
			el.style.transitionDelay = Math.min(i % 8, 6) * 45 + "ms";
			io.observe(el);
		});
	}

	/* --- 3. Smooth scrolling for in-page anchor links --- */
	function smoothAnchors() {
		if (reduceMotion) return;
		document.addEventListener("click", function (e) {
			var a = e.target.closest && e.target.closest('a[href^="#"]');
			if (!a) return;
			var id = a.getAttribute("href");
			if (id.length < 2) return;
			var dest = document.querySelector(id);
			if (!dest) return;
			e.preventDefault();
			dest.scrollIntoView({ behavior: "smooth", block: "start" });
			history.replaceState(null, "", id);
		});
	}

	/* --- 4. Light / dark theme toggle --- */
	function themeToggle() {
		var root = document.documentElement;
		var btn = document.createElement("button");
		btn.id = "theme-toggle";
		btn.setAttribute("aria-label", "Toggle light/dark theme");
		btn.innerHTML =
			'<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
			'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
			'<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4' +
			'M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
			'<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
			'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
			'<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8z"/></svg>';
		document.body.appendChild(btn);

		// enable color transitions only after first paint
		requestAnimationFrame(function () { root.classList.add("theme-ready"); });

		btn.addEventListener("click", function () {
			var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
			root.setAttribute("data-theme", next);
			try { localStorage.setItem("theme", next); } catch (e) {}
		});
	}

	ready(function () {
		scrollChrome();
		revealOnScroll();
		smoothAnchors();
		themeToggle();
	});
})();
