(() => {
	const selector = ".reveal-on-scroll";
	const observed = new WeakSet();
	let observer = null;
	let refreshTimer = 0;

	function prefersReducedMotion() {
		return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	function ensureObserver() {
		if (observer || !("IntersectionObserver" in window)) {
			return;
		}

		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) {
						continue;
					}

					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			},
			{
				threshold: 0.18,
				rootMargin: "0px 0px -10% 0px",
			}
		);
	}

	function registerTargets() {
		const targets = document.querySelectorAll(selector);
		if (!targets.length) {
			return;
		}

		if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
			for (const target of targets) {
				target.classList.add("is-visible");
			}
			return;
		}

		ensureObserver();

		for (const target of targets) {
			if (target.classList.contains("is-visible") || observed.has(target)) {
				continue;
			}

			observed.add(target);
			observer.observe(target);
		}
	}

	function scheduleRefresh() {
		window.clearTimeout(refreshTimer);
		refreshTimer = window.setTimeout(registerTargets, 60);
	}

	function initReveal() {
		document.documentElement.classList.add("reveal-ready");
		registerTargets();

		window.addEventListener("load", scheduleRefresh);
		window.addEventListener("resize", scheduleRefresh, { passive: true });
		window.addEventListener("hashchange", scheduleRefresh, { passive: true });

		const appRoot = document.getElementById("app");
		if (appRoot && "MutationObserver" in window) {
			const mutationObserver = new MutationObserver(scheduleRefresh);
			mutationObserver.observe(appRoot, { childList: true, subtree: true });
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initReveal, { once: true });
	} else {
		initReveal();
	}
})();
