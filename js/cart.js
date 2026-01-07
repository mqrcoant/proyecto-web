(function () {
	var APP = window.VestiaApp;
	if (!APP) {
		return;
	}

	class Cart {
		constructor() {
			this.items = [];
			this.catalogAvailable = true;
		}

		load() {
			var stored = localStorage.getItem(APP.config.storageKeys.cart);
			if (!stored) {
				this.items = [];
				return;
			}
			try {
				this.items = JSON.parse(stored) || [];
			} catch (error) {
				this.items = [];
			}
		}

		save() {
			localStorage.setItem(APP.config.storageKeys.cart, JSON.stringify(this.items));
		}

		addItem(product) {
			var existing = this.items.find(function (item) {
				return item.id === product.id;
			});
			if (existing) {
				existing.quantity += 1;
			} else {
				this.items.push({
					id: product.id,
					title: product.title,
					price: product.price,
					thumbnail: product.thumbnail,
					quantity: 1
				});
			}
			this.save();
			this.render();
			APP.utils.notify("Carrito", "Producto agregado correctamente.", "success");
		}

		updateQuantity(id, quantity) {
			var item = this.items.find(function (entry) {
				return entry.id === id;
			});
			if (!item) {
				return;
			}
			item.quantity = Math.max(1, quantity);
			this.save();
			this.render();
		}

		removeItem(id) {
			this.items = this.items.filter(function (entry) {
				return entry.id !== id;
			});
			this.save();
			this.render();
		}

		getTotal() {
			return this.items.reduce(function (total, entry) {
				return total + entry.price * entry.quantity;
			}, 0);
		}

		setCatalogAvailable(isAvailable) {
			this.catalogAvailable = isAvailable;
			this.render();
		}

		render() {
			if (!this.catalogAvailable) {
				renderEmpty("Catalog API no disponible. Carrito vacio.");
				if (dom.status) {
					dom.status.textContent = "Restablece la conexion para ver tu carrito.";
				}
				return;
			}

			if (!this.items.length) {
				renderEmpty("Tu carrito esta vacio.");
				if (dom.status) {
					dom.status.textContent = "Agrega productos desde el catalogo.";
				}
				return;
			}

			if (dom.empty) {
				dom.empty.textContent = "";
			}
			if (dom.status) {
				dom.status.textContent = "";
			}
			renderItems(this.items);
			renderTotal(this.getTotal());
		}
	}

	var dom = {};
	var cart = new Cart();

	function cacheDom() {
		dom.items = APP.utils.byId("cart-items");
		dom.empty = APP.utils.byId("cart-empty");
		dom.total = APP.utils.byId("cart-total");
		dom.status = APP.utils.byId("cart-status");
	}

	function renderEmpty(message) {
		if (dom.items) {
			dom.items.innerHTML = "";
		}
		if (dom.empty) {
			dom.empty.textContent = message;
		}
		if (dom.total) {
			dom.total.textContent = "Total: $0";
		}
	}

	function createActionSpan(label, action, id) {
		var span = document.createElement("span");
		span.className = "btn btn-outline-secondary btn-sm";
		span.textContent = label;
		span.setAttribute("role", "button");
		span.setAttribute("tabindex", "0");
		span.setAttribute("data-action", action);
		span.setAttribute("data-id", id);
		return span;
	}

	function renderItems(items) {
		if (!dom.items) {
			return;
		}
		dom.items.innerHTML = "";
		items.forEach(function (entry) {
			var item = document.createElement("li");
			item.className = "list-group-item";

			var wrapper = document.createElement("section");
			wrapper.className = "d-flex flex-column flex-md-row gap-3 align-items-start";

			var image = document.createElement("img");
			image.src = entry.thumbnail;
			image.alt = entry.title;
			image.className = "img-fluid";
			image.loading = "lazy";
			wrapper.appendChild(image);

			var details = document.createElement("section");
			var title = document.createElement("p");
			title.className = "fw-bold mb-1";
			title.textContent = entry.title;
			details.appendChild(title);

			var price = document.createElement("p");
			price.className = "text-muted mb-2";
			price.textContent = "Unitario: " + APP.utils.formatPrice(entry.price);
			details.appendChild(price);

			var controls = document.createElement("section");
			controls.className = "d-flex flex-column flex-sm-row gap-2 align-items-start";

			var quantityRow = document.createElement("section");
			quantityRow.className = "d-flex align-items-center gap-2";

			var minus = createActionSpan("-", "decrease", entry.id);
			var plus = createActionSpan("+", "increase", entry.id);

			var quantity = document.createElement("input");
			quantity.type = "number";
			quantity.min = "1";
			quantity.value = entry.quantity;
			quantity.className = "form-control";
			quantity.setAttribute("data-action", "input");
			quantity.setAttribute("data-id", entry.id);

			quantityRow.appendChild(minus);
			quantityRow.appendChild(quantity);
			quantityRow.appendChild(plus);
			controls.appendChild(quantityRow);

			var remove = createActionSpan("Eliminar", "remove", entry.id);
			remove.className = "btn btn-outline-danger btn-sm";
			controls.appendChild(remove);

			details.appendChild(controls);
			wrapper.appendChild(details);

			item.appendChild(wrapper);
			dom.items.appendChild(item);
		});
	}

	function renderTotal(total) {
		if (dom.total) {
			dom.total.textContent = "Total: " + APP.utils.formatPrice(total);
		}
	}

	function handleCartClick(event) {
		var target = event.target;
		var action = target.getAttribute("data-action");
		if (!action) {
			return;
		}
		var id = APP.utils.toNumber(target.getAttribute("data-id"), 0);
		if (!id) {
			return;
		}
		var entry = cart.items.find(function (item) {
			return item.id === id;
		});
		if (!entry) {
			return;
		}
		if (action === "increase") {
			cart.updateQuantity(id, entry.quantity + 1);
		} else if (action === "decrease") {
			cart.updateQuantity(id, entry.quantity - 1);
		} else if (action === "remove") {
			cart.removeItem(id);
		}
	}

	function handleQuantityKeydown(event) {
		if (event.key !== "Enter") {
			return;
		}
		var target = event.target;
		if (target.getAttribute("data-action") !== "input") {
			return;
		}
		var id = APP.utils.toNumber(target.getAttribute("data-id"), 0);
		if (!id) {
			return;
		}
		var quantity = APP.utils.toNumber(target.value, 1);
		cart.updateQuantity(id, quantity);
	}

	function initEvents() {
		if (!dom.items) {
			return;
		}
		dom.items.addEventListener("click", handleCartClick);
		dom.items.addEventListener("keydown", handleQuantityKeydown);
	}

	function init() {
		cacheDom();
		cart.load();
		cart.render();
		initEvents();
	}

	APP.cart = {
		init: init,
		addItem: function (product) {
			cart.addItem(product);
		},
		setCatalogAvailable: function (isAvailable) {
			cart.setCatalogAvailable(isAvailable);
		},
		render: function () {
			cart.render();
		}
	};
})();
