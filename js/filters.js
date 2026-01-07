(function () {
	var APP = window.VestiaApp;
	if (!APP) {
		return;
	}

	var state = {
		query: "",
		category: "",
		color: "",
		size: "",
		occasion: "",
		style: "",
		priceMin: 0,
		priceMax: APP.constants.priceMaxDefault
	};

	var dom = {};

	function cacheDom() {
		dom.searchForm = APP.utils.byId("search-form");
		dom.searchInput = APP.utils.byId("search-input");
		dom.filtersForm = APP.utils.byId("filters-form");
		dom.category = APP.utils.byId("category-select");
		dom.color = APP.utils.byId("color-select");
		dom.size = APP.utils.byId("size-select");
		dom.occasion = APP.utils.byId("occasion-select");
		dom.style = APP.utils.byId("style-select");
		dom.price = APP.utils.byId("price-range");
		dom.priceValue = APP.utils.byId("price-value");
		dom.reset = APP.utils.byId("filters-reset");
		dom.filterFields = document.getElementsByClassName("js-filter-field");
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

	function setCategories(categories) {
		setOptions(dom.category, categories, "Todas");
	}

	function setStaticOptions() {
		setOptions(dom.color, APP.constants.colors, "Todos");
		setOptions(dom.size, APP.constants.sizes, "Todas");
		setOptions(dom.occasion, APP.constants.occasions, "Todas");
		setOptions(dom.style, APP.constants.styles, "Todos");
	}

	function readFilters() {
		state.category = dom.category ? dom.category.value : "";
		state.color = dom.color ? dom.color.value : "";
		state.size = dom.size ? dom.size.value : "";
		state.occasion = dom.occasion ? dom.occasion.value : "";
		state.style = dom.style ? dom.style.value : "";
		state.priceMax = dom.price ? APP.utils.toNumber(dom.price.value, APP.constants.priceMaxDefault) : APP.constants.priceMaxDefault;
		state.priceMin = 0;
	}

	function updatePriceLabel() {
		if (dom.priceValue) {
			dom.priceValue.textContent = "Hasta " + state.priceMax;
		}
	}

	function applyFilters(newState) {
		state = Object.assign(state, newState);
		if (dom.searchInput && typeof state.query === "string") {
			dom.searchInput.value = state.query;
		}
		if (dom.category) {
			dom.category.value = state.category;
		}
		if (dom.color) {
			dom.color.value = state.color;
		}
		if (dom.size) {
			dom.size.value = state.size;
		}
		if (dom.occasion) {
			dom.occasion.value = state.occasion;
		}
		if (dom.style) {
			dom.style.value = state.style;
		}
		if (dom.price) {
			dom.price.value = state.priceMax;
		}
		updatePriceLabel();
		if (APP.products) {
			return APP.products.refreshCatalog({ resetPage: true });
		}
		return Promise.resolve();
	}

	function handleSearchSubmit(event) {
		event.preventDefault();
		state.query = dom.searchInput ? dom.searchInput.value.trim() : "";
		if (APP.products) {
			APP.products.refreshCatalog({ resetPage: true });
		}
	}

	function handleFiltersSubmit(event) {
		event.preventDefault();
		readFilters();
		updatePriceLabel();
		if (APP.products) {
			APP.products.refreshCatalog({ resetPage: true });
		}
	}

	function handleReset(event) {
		var isClick = event.type === "click";
		var isKey = event.type === "keydown" && event.key === "Enter";
		if (!isClick && !isKey) {
			return;
		}
		state.query = "";
		state.category = "";
		state.color = "";
		state.size = "";
		state.occasion = "";
		state.style = "";
		state.priceMin = 0;
		state.priceMax = APP.constants.priceMaxDefault;
		if (dom.searchInput) {
			dom.searchInput.value = "";
		}
		applyFilters(state);
	}

	function handlePriceClick() {
		state.priceMax = dom.price ? APP.utils.toNumber(dom.price.value, APP.constants.priceMaxDefault) : APP.constants.priceMaxDefault;
		updatePriceLabel();
	}

	function initEvents() {
		if (dom.searchForm) {
			dom.searchForm.addEventListener("submit", handleSearchSubmit);
		}
		if (dom.filtersForm) {
			dom.filtersForm.addEventListener("submit", handleFiltersSubmit);
		}
		if (dom.reset) {
			dom.reset.addEventListener("click", handleReset);
			dom.reset.addEventListener("keydown", handleReset);
		}
		if (dom.price) {
			dom.price.addEventListener("click", handlePriceClick);
		}
	}

	function init() {
		cacheDom();
		setStaticOptions();
		updatePriceLabel();
		initEvents();
	}

	APP.filters = {
		init: init,
		state: state,
		setCategories: setCategories,
		applyFilters: applyFilters
	};
})();
