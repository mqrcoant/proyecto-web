(function () {
	var APP = window.VestiaApp;
	if (!APP) {
		return;
	}

	var state = {
		baseProducts: [],
		filteredProducts: [],
		categories: [],
		currentPage: 1,
		apiAvailable: true,
		lastQuery: "",
		lastCategory: ""
	};

	var dom = {};

	function cacheDom() {
		dom.grid = APP.utils.byId("product-grid");
		dom.pagination = APP.utils.byId("catalog-pagination");
		dom.status = APP.utils.byId("catalog-status");
	}

	function setStatus(message) {
		if (!dom.status) {
			return;
		}
		dom.status.textContent = message || "";
	}

	function deriveAttributes(product) {
		var colors = APP.constants.colors;
		var sizes = APP.constants.sizes;
		var occasions = APP.constants.occasions;
		var styles = APP.constants.styles;
		var colorPrimary = colors[product.id % colors.length];
		var colorAlt = colors[(product.id + 2) % colors.length];
		var sizeA = sizes[product.id % sizes.length];
		var sizeB = sizes[(product.id + 1) % sizes.length];
		var sizeC = sizes[(product.id + 3) % sizes.length];
		var occasion = occasions[product.id % occasions.length];
		var style = styles[product.id % styles.length];

		return {
			colors: [colorPrimary, colorAlt],
			sizes: [sizeA, sizeB, sizeC],
			occasion: occasion,
			style: style
		};
	}

	function attachMeta(products) {
		return products.map(function (product) {
			product.meta = deriveAttributes(product);
			return product;
		});
	}

	function fetchJson(url) {
		return fetch(url).then(function (response) {
			if (!response.ok) {
				throw new Error("Request failed");
			}
			return response.json();
		});
	}

	function fetchBaseProducts(query, category) {
		var baseUrl = APP.config.dummyBaseUrl;
		var url = baseUrl + "/products?limit=100";
		if (query) {
			url = baseUrl + "/products/search?q=" + encodeURIComponent(query) + "&limit=100";
		} else if (category) {
			url = baseUrl + "/products/category/" + encodeURIComponent(category) + "?limit=100";
		}

		return fetchJson(url).then(function (data) {
			var list = data.products || [];
			return attachMeta(list);
		});
	}

	function fetchCategories() {
		var url = APP.config.dummyBaseUrl + "/products/categories";
		return fetchJson(url).then(function (data) {
			state.categories = Array.isArray(data) ? data : [];
			return state.categories;
		});
	}

	function applyLocalFilters(products, filters) {
		return products.filter(function (product) {
			if (filters.color && product.meta.colors.indexOf(filters.color) === -1) {
				return false;
			}
			if (filters.size && product.meta.sizes.indexOf(filters.size) === -1) {
				return false;
			}
			if (filters.occasion && product.meta.occasion !== filters.occasion) {
				return false;
			}
			if (filters.style && product.meta.style !== filters.style) {
				return false;
			}
		if (typeof filters.priceMax === "number" && product.price > filters.priceMax) {
			return false;
		}
		if (typeof filters.priceMin === "number" && product.price < filters.priceMin) {
			return false;
		}
			return true;
		});
	}

	function paginate(list) {
		var perPage = APP.config.productsPerPage;
		var start = (state.currentPage - 1) * perPage;
		var end = start + perPage;
		return list.slice(start, end);
	}

	function createMetaBadge(label) {
		var badge = document.createElement("span");
		badge.className = "status-badge";
		badge.textContent = label;
		return badge;
	}

	function createSizeBadge(size) {
		var badge = document.createElement("span");
		badge.className = "badge text-bg-light border";
		badge.textContent = size;
		return badge;
	}

	function createProductCard(product, colClass) {
		var item = document.createElement("li");
		item.className = colClass || "col-12 col-sm-6 col-lg-4 mb-4";

		var card = document.createElement("section");
		card.className = "card h-100";

		var image = document.createElement("img");
		image.className = "card-img-top";
		image.src = product.thumbnail;
		image.alt = product.title;
		image.loading = "lazy";
		card.appendChild(image);

		var body = document.createElement("section");
		body.className = "card-body d-flex flex-column";

		var title = document.createElement("h3");
		title.className = "h5";
		title.textContent = product.title;
		body.appendChild(title);

		var description = document.createElement("p");
		description.className = "text-muted";
		description.textContent = product.description;
		body.appendChild(description);

		var price = document.createElement("p");
		price.className = "fw-bold mb-2";
		price.textContent = APP.utils.formatPrice(product.price);
		body.appendChild(price);

		var meta = document.createElement("p");
		meta.appendChild(createMetaBadge(product.meta.colors[0]));
		meta.appendChild(createMetaBadge(product.meta.occasion));
		meta.appendChild(createMetaBadge(product.meta.style));
		body.appendChild(meta);

		var sizes = document.createElement("section");
		sizes.className = "product-sizes mb-3";
		product.meta.sizes.forEach(function (size) {
			sizes.appendChild(createSizeBadge(size));
		});
		body.appendChild(sizes);

		var form = document.createElement("form");
		form.className = "mt-auto js-add-form";
		form.setAttribute("data-product-id", product.id);

		var submit = document.createElement("input");
		submit.type = "submit";
		submit.className = "btn btn-outline-dark w-100";
		submit.value = "Agregar al carrito";
		form.appendChild(submit);
		body.appendChild(form);

		card.appendChild(body);
		item.appendChild(card);
		return item;
	}

	function renderProducts(list) {
		if (!dom.grid) {
			return;
		}
		dom.grid.innerHTML = "";
		list.forEach(function (product) {
			dom.grid.appendChild(createProductCard(product));
		});
	}

	function renderPagination(totalItems) {
		if (!dom.pagination) {
			return;
		}
		dom.pagination.innerHTML = "";
		var perPage = APP.config.productsPerPage;
		var totalPages = Math.ceil(totalItems / perPage) || 1;
		for (var i = 1; i <= totalPages; i += 1) {
			var item = document.createElement("li");
			item.className = "page-item" + (i === state.currentPage ? " active" : "");
			var link = document.createElement("span");
			link.className = "page-link";
			link.textContent = i;
			link.setAttribute("data-page", i);
			link.setAttribute("role", "button");
			link.setAttribute("tabindex", "0");
			item.appendChild(link);
			dom.pagination.appendChild(item);
		}
	}

	function renderRecommendations(container, products) {
		if (!container) {
			return;
		}
		container.innerHTML = "";
		if (!products.length) {
			var empty = document.createElement("li");
			empty.className = "text-muted";
			empty.textContent = "No hay recomendaciones disponibles.";
			container.appendChild(empty);
			return;
		}
		products.forEach(function (product) {
			container.appendChild(createProductCard(product, "col-12 col-md-6 mb-4"));
		});
	}

	function updateCatalog(filters, resetPage) {
		state.filteredProducts = applyLocalFilters(state.baseProducts, filters);
		if (resetPage) {
			state.currentPage = 1;
		}
		var totalItems = state.filteredProducts.length;
		var pageItems = paginate(state.filteredProducts);
		renderProducts(pageItems);
		renderPagination(totalItems);
		setStatus(totalItems + " productos encontrados");
	}

	function refreshCatalog(options) {
		var opts = options || {};
		var filters = (APP.filters && APP.filters.state) ? APP.filters.state : {};
		var query = (filters.query || "").trim();
		var category = filters.category || "";
		var needsFetch = !state.baseProducts.length || query !== state.lastQuery || category !== state.lastCategory;

		if (needsFetch) {
			setStatus("Cargando productos...");
			return fetchBaseProducts(query, category)
				.then(function (products) {
					state.apiAvailable = true;
					state.baseProducts = products;
					state.lastQuery = query;
					state.lastCategory = category;
					if (APP.cart && APP.cart.setCatalogAvailable) {
						APP.cart.setCatalogAvailable(true);
					}
					updateCatalog(filters, true);
				})
				.catch(function () {
					state.apiAvailable = false;
					state.baseProducts = [];
					state.filteredProducts = [];
					setStatus("Catalog API no disponible.");
					renderProducts([]);
					renderPagination(0);
					if (APP.cart && APP.cart.setCatalogAvailable) {
						APP.cart.setCatalogAvailable(false);
					}
				});
		}

		updateCatalog(filters, opts.resetPage);
		return Promise.resolve();
	}

	function setPage(page) {
		var totalPages = Math.ceil(state.filteredProducts.length / APP.config.productsPerPage) || 1;
		if (page < 1 || page > totalPages) {
			return;
		}
		state.currentPage = page;
		var pageItems = paginate(state.filteredProducts);
		renderProducts(pageItems);
		renderPagination(state.filteredProducts.length);
	}

	function getProductById(id) {
		var list = state.baseProducts.concat(state.filteredProducts);
		for (var i = 0; i < list.length; i += 1) {
			if (list[i].id === id) {
				return list[i];
			}
		}
		return null;
	}

	function handleGridSubmit(event) {
		var form = event.target;
		if (!form.classList.contains("js-add-form")) {
			return;
		}
		event.preventDefault();
		var id = APP.utils.toNumber(form.getAttribute("data-product-id"), 0);
		if (!id || !APP.cart) {
			return;
		}
		var product = getProductById(id);
		if (product) {
			APP.cart.addItem(product);
		}
	}

	function handlePaginationClick(event) {
		var target = event.target;
		if (!target.classList.contains("page-link")) {
			return;
		}
		var page = APP.utils.toNumber(target.getAttribute("data-page"), 1);
		setPage(page);
	}

	function handleHover(event, isOver) {
		var card = event.target.closest(".card");
		if (!card) {
			return;
		}
		if (isOver) {
			card.classList.add("border-dark");
			return;
		}
		card.classList.remove("border-dark");
	}

	function initEvents() {
		if (dom.grid) {
			dom.grid.addEventListener("submit", handleGridSubmit);
			dom.grid.addEventListener("mouseover", function (event) {
				handleHover(event, true);
			});
			dom.grid.addEventListener("mouseout", function (event) {
				handleHover(event, false);
			});
		}
		if (dom.pagination) {
			dom.pagination.addEventListener("click", handlePaginationClick);
		}
	}

	function init() {
		cacheDom();
		initEvents();
		fetchCategories().then(function (categories) {
			if (APP.filters && APP.filters.setCategories) {
				APP.filters.setCategories(categories);
			}
		}).catch(function () {
			state.categories = [];
		});
		refreshCatalog({ resetPage: true });
	}

	APP.products = {
		init: init,
		refreshCatalog: refreshCatalog,
		getProductById: getProductById,
		getFilteredProducts: function () {
			return state.filteredProducts.slice();
		},
		renderRecommendations: renderRecommendations,
		getCategories: function () {
			return state.categories.slice();
		},
		setPage: setPage
	};
})();
