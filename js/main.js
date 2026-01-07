(function () {
	var APP = window.VestiaApp;
	if (!APP) {
		return;
	}

	var navLinks;
	var navToggle;
	var navList;
	var ctaForm;

	function cacheDom() {
		navLinks = document.getElementsByClassName("js-nav-link");
		navToggle = APP.utils.byId("nav-toggle");
		navList = APP.utils.byId("nav-links");
		ctaForm = APP.utils.byId("cta-form");
	}

	function scrollToTarget(targetId) {
		var section = APP.utils.byId(targetId);
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		}
	}

	function handleNavToggle(event) {
		var isClick = event.type === "click";
		var isKey = event.type === "keydown" && event.key === "Enter";
		if (!isClick && !isKey) {
			return;
		}
		if (navList) {
			navList.classList.toggle("is-open");
		}
	}

	function handleNavLink(event) {
		var isClick = event.type === "click";
		var isKey = event.type === "keydown" && event.key === "Enter";
		if (!isClick && !isKey) {
			return;
		}
		var target = event.target.getAttribute("data-target");
		if (target) {
			scrollToTarget(target);
			if (navList) {
				navList.classList.remove("is-open");
			}
		}
	}

	function handleCtaSubmit(event) {
		event.preventDefault();
		scrollToTarget("catalogo");
	}

	function setLazyLoading() {
		var images = document.getElementsByTagName("img");
		for (var i = 0; i < images.length; i += 1) {
			images[i].setAttribute("loading", "lazy");
		}
	}

	function initNav() {
		if (navToggle) {
			navToggle.addEventListener("click", handleNavToggle);
			navToggle.addEventListener("keydown", handleNavToggle);
		}
		if (navLinks && navLinks.length) {
			for (var i = 0; i < navLinks.length; i += 1) {
				navLinks[i].addEventListener("click", handleNavLink);
				navLinks[i].addEventListener("keydown", handleNavLink);
			}
		}
		if (ctaForm) {
			ctaForm.addEventListener("submit", handleCtaSubmit);
		}
	}

	function init() {
		cacheDom();
		initNav();
		setLazyLoading();
		if (APP.config && APP.config.storageKeys) {
			localStorage.removeItem(APP.config.storageKeys.chat);
		}
		if (APP.cart) {
			APP.cart.init();
		}
		if (APP.filters) {
			APP.filters.init();
		}
		if (APP.profile) {
			APP.profile.init();
		}
		if (APP.chatbot) {
			APP.chatbot.init();
		}
		if (APP.image) {
			APP.image.init();
		}
		if (APP.products) {
			APP.products.init();
		}
	}

	window.addEventListener("load", init);
})();
