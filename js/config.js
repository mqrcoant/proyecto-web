(function () {
	var APP = window.VestiaApp = window.VestiaApp || {};

	APP.config = {
		dummyBaseUrl: "https://dummyjson.com",
		productsPerPage: 9,
		geminiApiKey: "AIzaSyAdBNPOL3voZ4hQ9Lsbg5gr4dDNoi1eWcE", // Academic use only. Do not expose in production.
		geminiModel: "gemini-2.5-flash",
		geminiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
		storageKeys: {
			cart: "vestia_cart",
			prefs: "vestia_prefs",
			chat: "vestia_chat"
		}
	};

	APP.constants = {
		colors: ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Beige", "Marron"],
		sizes: ["XS", "S", "M", "L", "XL"],
		occasions: ["Formal", "Casual", "Deportivo", "Fiesta", "Trabajo"],
		styles: ["Clasico", "Minimal", "Urbano", "Bohemio", "Deportivo"],
		priceMaxDefault: 500
	};

	APP.assistant = {
		name: "Lia"
	};

	function byId(id) {
		return document.getElementById(id);
	}

	function qs(selector, root) {
		return (root || document).querySelector(selector);
	}

	function qsa(selector, root) {
		return (root || document).querySelectorAll(selector);
	}

	function toNumber(value, fallback) {
		var parsed = Number(value);
		return Number.isNaN(parsed) ? fallback : parsed;
	}

	function formatPrice(value) {
		return "$" + value.toFixed(2);
	}

	function notify(title, text, icon) {
		if (window.Swal) {
			window.Swal.fire({
				title: title,
				text: text,
				icon: icon || "info",
				confirmButtonColor: "#1f1b16"
			});
			return;
		}
		alert(title + " - " + text);
	}

	APP.utils = {
		byId: byId,
		qs: qs,
		qsa: qsa,
		toNumber: toNumber,
		formatPrice: formatPrice,
		notify: notify
	};
})();
