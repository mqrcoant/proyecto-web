(function () {
	var APP = window.VestiaApp;
	if (!APP) {
		return;
	}

	var navLinks;
	var navToggle;
	var navList;
	var ctaForm;
	var chatToggle;
	var chatPanel;
	var chatClose;
	var prefsToggle;
	var prefsSidebar;
	var prefsClose;
	var prefsOverlay;

	function cacheDom() {
		navLinks = document.getElementsByClassName("js-nav-link");
		navToggle = APP.utils.byId("nav-toggle");
		navList = APP.utils.byId("nav-links");
		ctaForm = APP.utils.byId("cta-form");
		chatToggle = APP.utils.byId("chat-toggle");
		chatPanel = APP.utils.byId("chat-panel");
		chatClose = APP.utils.byId("chat-close");
		prefsToggle = APP.utils.byId("prefs-toggle");
		prefsSidebar = APP.utils.byId("prefs-sidebar");
		prefsClose = APP.utils.byId("prefs-close");
		prefsOverlay = APP.utils.byId("prefs-overlay");
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

	function setChatOpen(isOpen) {
		if (!chatPanel) {
			return;
		}
		if (isOpen) {
			chatPanel.classList.remove("d-none");
			chatPanel.classList.add("d-block");
			var chatInput = APP.utils.byId("chat-input");
			if (chatInput) {
				chatInput.focus();
			}
		} else {
			chatPanel.classList.add("d-none");
			chatPanel.classList.remove("d-block");
		}
		if (chatToggle) {
			chatToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
		}
	}

	function setPrefsOpen(isOpen) {
		if (!prefsSidebar) {
			return;
		}
		if (isOpen) {
			prefsSidebar.classList.remove("d-none");
			prefsSidebar.classList.add("is-open");
			if (prefsOverlay) {
				prefsOverlay.classList.remove("d-none");
			}
		} else {
			prefsSidebar.classList.add("d-none");
			prefsSidebar.classList.remove("is-open");
			if (prefsOverlay) {
				prefsOverlay.classList.add("d-none");
			}
		}
		if (prefsToggle) {
			prefsToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
		}
	}

	function handleChatToggle(event) {
		var isClick = event.type === "click";
		var isKey = event.type === "keydown" && event.key === "Enter";
		if (!isClick && !isKey) {
			return;
		}
		var isOpen = chatPanel && !chatPanel.classList.contains("d-none");
		setChatOpen(!isOpen);
	}

	function handlePrefsToggle(event) {
		var isClick = event.type === "click";
		var isKey = event.type === "keydown" && event.key === "Enter";
		if (!isClick && !isKey) {
			return;
		}
		var isOpen = prefsSidebar && !prefsSidebar.classList.contains("d-none");
		setPrefsOpen(!isOpen);
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
		if (chatToggle) {
			chatToggle.addEventListener("click", handleChatToggle);
			chatToggle.addEventListener("keydown", handleChatToggle);
		}
		if (chatClose) {
			chatClose.addEventListener("click", handleChatToggle);
			chatClose.addEventListener("keydown", handleChatToggle);
		}
		if (prefsToggle) {
			prefsToggle.addEventListener("click", handlePrefsToggle);
			prefsToggle.addEventListener("keydown", handlePrefsToggle);
		}
		if (prefsClose) {
			prefsClose.addEventListener("click", handlePrefsToggle);
			prefsClose.addEventListener("keydown", handlePrefsToggle);
		}
		if (prefsOverlay) {
			prefsOverlay.addEventListener("click", function () {
				setPrefsOpen(false);
			});
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
