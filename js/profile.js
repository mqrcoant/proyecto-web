(function () {
	var APP = window.VestiaApp;
	if (!APP) {
		return;
	}

	var dom = {};

	function cacheDom() {
		dom.form = APP.utils.byId("prefs-form");
		dom.colors = APP.utils.byId("pref-colors");
		dom.size = APP.utils.byId("pref-size");
		dom.style = APP.utils.byId("pref-style");
		dom.status = APP.utils.byId("pref-status");
		dom.summary = APP.utils.byId("pref-summary");
		dom.apply = APP.utils.byId("apply-preferences");
	}

	function setOptions(select, options, placeholder) {
		if (!select) {
			return;
		}
		select.innerHTML = "";
		var defaultOption = document.createElement("option");
		defaultOption.value = "";
		defaultOption.textContent = placeholder;
		select.appendChild(defaultOption);
		options.forEach(function (option) {
			var item = document.createElement("option");
			item.value = option;
			item.textContent = option;
			select.appendChild(item);
		});
	}

	function renderColors() {
		if (!dom.colors) {
			return;
		}
		dom.colors.innerHTML = "";
		APP.constants.colors.forEach(function (color) {
			var item = document.createElement("li");
			item.className = "col-6 col-md-4";
			var label = document.createElement("label");
			label.className = "form-check-label";

			var input = document.createElement("input");
			input.type = "checkbox";
			input.className = "form-check-input me-2";
			input.value = color;

			label.appendChild(input);
			label.appendChild(document.createTextNode(color));
			item.appendChild(label);
			dom.colors.appendChild(item);
		});
	}

	function loadPreferences() {
		var stored = localStorage.getItem(APP.config.storageKeys.prefs);
		if (!stored) {
			return null;
		}
		try {
			return JSON.parse(stored);
		} catch (error) {
			return null;
		}
	}

	function savePreferences(prefs) {
		localStorage.setItem(APP.config.storageKeys.prefs, JSON.stringify(prefs));
	}

	function getSelectedColors() {
		if (!dom.colors) {
			return [];
		}
		var inputs = dom.colors.querySelectorAll("input[type='checkbox']");
		var selected = [];
		inputs.forEach(function (input) {
			if (input.checked) {
				selected.push(input.value);
			}
		});
		return selected;
	}

	function applyPreferencesToForm(prefs) {
		if (!prefs) {
			return;
		}
		var inputs = dom.colors.querySelectorAll("input[type='checkbox']");
		inputs.forEach(function (input) {
			input.checked = prefs.colors.indexOf(input.value) !== -1;
		});
		if (dom.size) {
			dom.size.value = prefs.size;
		}
		if (dom.style) {
			dom.style.value = prefs.style;
		}
	}

	function updateSummary(prefs) {
		if (!dom.summary) {
			return;
		}
		if (!prefs) {
			dom.summary.textContent = "Aun no hay preferencias guardadas.";
			return;
		}
		var colors = prefs.colors.length ? prefs.colors.join(", ") : "sin colores";
		var size = prefs.size || "sin talla";
		var style = prefs.style || "sin estilo";
		dom.summary.textContent = "Colores: " + colors + " | Talla: " + size + " | Estilo: " + style;
	}

	function handleSubmit(event) {
		event.preventDefault();
		if (!dom.form.checkValidity()) {
			dom.form.classList.add("was-validated");
			return;
		}
		var prefs = {
			colors: getSelectedColors(),
			size: dom.size ? dom.size.value : "",
			style: dom.style ? dom.style.value : ""
		};
		savePreferences(prefs);
		updateSummary(prefs);
		if (dom.status) {
			dom.status.textContent = "Preferencias guardadas.";
		}
		APP.utils.notify("Preferencias", "Se guardaron tus preferencias.", "success");
	}

	function handleApply(event) {
		var isClick = event.type === "click";
		var isKey = event.type === "keydown" && event.key === "Enter";
		if (!isClick && !isKey) {
			return;
		}
		var prefs = loadPreferences();
		if (!prefs) {
			APP.utils.notify("Preferencias", "Guarda tus preferencias primero.", "info");
			return;
		}
		var primaryColor = prefs.colors.length ? prefs.colors[0] : "";
		if (APP.filters) {
			APP.filters.applyFilters({
				color: primaryColor,
				size: prefs.size,
				style: prefs.style
			});
		}
		if (dom.status) {
			dom.status.textContent = "Preferencias aplicadas al catalogo.";
		}
	}

	function init() {
		cacheDom();
		renderColors();
		setOptions(dom.size, APP.constants.sizes, "Selecciona");
		setOptions(dom.style, APP.constants.styles, "Selecciona");
		var prefs = loadPreferences();
		applyPreferencesToForm(prefs || { colors: [], size: "", style: "" });
		updateSummary(prefs);
		if (dom.form) {
			dom.form.addEventListener("submit", handleSubmit);
		}
		if (dom.apply) {
			dom.apply.addEventListener("click", handleApply);
			dom.apply.addEventListener("keydown", handleApply);
		}
	}

	APP.profile = {
		init: init,
		getPreferences: loadPreferences
	};
})();
