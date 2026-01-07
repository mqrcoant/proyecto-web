(function () {
	var APP = window.VestiaApp;
	if (!APP) {
		return;
	}

	var chatDom = {};
	var history = [];

	function cacheChatDom() {
		chatDom.form = APP.utils.byId("chat-form");
		chatDom.input = APP.utils.byId("chat-input");
		chatDom.messages = APP.utils.byId("chat-messages");
		chatDom.status = APP.utils.byId("chat-status");
	}

	function loadHistory() {
		var stored = localStorage.getItem(APP.config.storageKeys.chat);
		if (!stored) {
			history = [];
			return;
		}
		try {
			history = JSON.parse(stored) || [];
		} catch (error) {
			history = [];
		}
	}

	function clearHistory() {
		history = [];
		localStorage.removeItem(APP.config.storageKeys.chat);
	}

	function resetConversation() {
		clearHistory();
		if (chatDom.messages) {
			chatDom.messages.innerHTML = "";
		}
	}

	function saveHistory() {
		localStorage.setItem(APP.config.storageKeys.chat, JSON.stringify(history));
	}

	function addHistory(role, text, filters) {
		history.push({ role: role, text: text, filters: filters || null });
		if (history.length > 12) {
			history = history.slice(history.length - 12);
		}
		saveHistory();
	}

	function renderMessage(entry) {
		if (!chatDom.messages) {
			return;
		}
		var item = document.createElement("li");
		var bubble = document.createElement("section");
		bubble.className = "chat-bubble" + (entry.role === "user" ? " user" : "");

		var meta = document.createElement("p");
		meta.className = "chat-meta mb-1";
		meta.textContent = entry.role === "user" ? "Tu" : APP.assistant.name;
		bubble.appendChild(meta);

		var text = document.createElement("p");
		text.className = "mb-1";
		text.textContent = entry.text;
		bubble.appendChild(text);

		if (entry.filters) {
			var button = document.createElement("span");
			button.className = "btn btn-sm btn-outline-primary js-chat-reco";
			button.setAttribute("role", "button");
			button.setAttribute("tabindex", "0");
			button.textContent = "Ver recomendacion";
			Object.keys(entry.filters).forEach(function (key) {
				button.setAttribute("data-" + key, entry.filters[key]);
			});
			bubble.appendChild(button);
		}

		item.appendChild(bubble);
		chatDom.messages.appendChild(item);
	}

	function renderHistory() {
		if (!chatDom.messages) {
			return;
		}
		chatDom.messages.innerHTML = "";
		history.forEach(function (entry) {
			renderMessage(entry);
		});
	}

	function setStatus(message) {
		if (chatDom.status) {
			chatDom.status.textContent = message || "";
		}
	}

	function buildPrompt() {
		var base = "You are Lia, a fashion assistant for VestIA. Ask short questions about color, size, price, style, and occasion. Reply in JSON only without markdown: {\"reply\":\"...\",\"filters\":{}}. Use lowercase for filters: color, size, occasion, style, category, priceMax, query. Keep reply under 40 words. Use ASCII only.";
		var contents = [{ role: "user", parts: [{ text: base }] }];
		history.forEach(function (entry) {
			contents.push({ role: entry.role === "user" ? "user" : "model", parts: [{ text: entry.text }] });
		});
		return { contents: contents };
	}

	function parseFilters(rawFilters) {
		if (!rawFilters || typeof rawFilters !== "object") {
			return null;
		}
		var filters = {};
		if (rawFilters.color) {
			if (Array.isArray(rawFilters.color)) {
				filters.color = String(rawFilters.color[0] || "");
			} else {
				filters.color = String(rawFilters.color);
			}
		}
		if (rawFilters.size) {
			filters.size = String(rawFilters.size);
		}
		if (rawFilters.occasion) {
			filters.occasion = String(rawFilters.occasion);
		}
		if (rawFilters.style) {
			filters.style = String(rawFilters.style);
		}
		if (rawFilters.category) {
			filters.category = String(rawFilters.category);
		}
		if (rawFilters.query) {
			filters.query = String(rawFilters.query);
		}
		if (rawFilters.priceMax) {
			filters.priceMax = APP.utils.toNumber(rawFilters.priceMax, 0);
		}
		return Object.keys(filters).length ? filters : null;
	}

	function extractJson(text) {
		if (!text) {
			return "";
		}
		var codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
		if (codeMatch && codeMatch[1]) {
			return codeMatch[1].trim();
		}
		var first = text.indexOf("{");
		var last = text.lastIndexOf("}");
		if (first !== -1 && last !== -1 && last > first) {
			return text.slice(first, last + 1).trim();
		}
		return text.trim();
	}

	function stripCodeFences(text) {
		if (!text) {
			return "";
		}
		return text.replace(/```(?:json)?/gi, "").trim();
	}

	function safeParse(text) {
		var cleaned = extractJson(text);
		try {
			return JSON.parse(cleaned);
		} catch (error) {
			return null;
		}
	}

	function extractReplyFromText(text) {
		if (!text) {
			return "";
		}
		var match = text.match(/\"reply\"\s*:\s*\"([^\"]+)/i);
		if (match && match[1]) {
			return match[1];
		}
		return "";
	}

	function callGemini() {
		var apiKey = APP.config.geminiApiKey;
		if (!apiKey) {
			return Promise.reject(new Error("Missing API key"));
		}
		var url = APP.config.geminiBaseUrl + "/" + APP.config.geminiModel + ":generateContent?key=" + apiKey;
		var payload = buildPrompt();
		payload.generationConfig = { temperature: 0.6, maxOutputTokens: 200 };
		return fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		}).then(function (response) {
			if (!response.ok) {
				throw new Error("Gemini request failed");
			}
			return response.json();
		}).then(function (data) {
			var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : "";
			return text;
		});
	}

	function parseResponse(text) {
		var parsed = safeParse(text);
		if (parsed) {
			return {
				reply: parsed.reply || "",
				filters: parseFilters(parsed.filters)
			};
		}
		var reply = extractReplyFromText(text);
		if (!reply) {
			reply = stripCodeFences(text);
		}
		if (reply.indexOf("{") !== -1) {
			reply = "Lo siento, no pude leer la respuesta. Intenta de nuevo.";
		}
		return { reply: reply };
	}

	function handleChatSubmit(event) {
		event.preventDefault();
		if (!chatDom.form.checkValidity()) {
			chatDom.form.classList.add("was-validated");
			return;
		}
		var userText = chatDom.input.value.trim();
		if (!userText) {
			return;
		}
		chatDom.input.value = "";
		addHistory("user", userText);
		renderMessage({ role: "user", text: userText });
		setStatus("Lia esta pensando...");

		callGemini().then(function (text) {
			var parsed = parseResponse(text);
			var replyText = parsed.reply || "Lo siento, no tengo respuesta.";
			var filters = parsed.filters || null;
			addHistory("model", replyText, filters);
			renderMessage({ role: "model", text: replyText, filters: filters });
			setStatus("");
		}).catch(function () {
			var fallback = "No se pudo conectar con el asistente. Revisa la API key.";
			addHistory("model", fallback);
			renderMessage({ role: "model", text: fallback });
			setStatus("");
		});
	}

	function handleRecommendationClick(event) {
		var target = event.target;
		if (!target.classList.contains("js-chat-reco")) {
			return;
		}
		var filters = {
			color: target.getAttribute("data-color") || "",
			size: target.getAttribute("data-size") || "",
			occasion: target.getAttribute("data-occasion") || "",
			style: target.getAttribute("data-style") || "",
			category: target.getAttribute("data-category") || "",
			query: target.getAttribute("data-query") || ""
		};
		var priceMaxAttr = target.getAttribute("data-priceMax");
		if (priceMaxAttr !== null) {
			filters.priceMax = APP.utils.toNumber(priceMaxAttr, APP.constants.priceMaxDefault);
		}
		if (APP.filters) {
			APP.filters.applyFilters(filters);
		}
		var section = APP.utils.byId("catalogo");
		if (section) {
			section.scrollIntoView({ behavior: "smooth" });
		}
	}

	function initChat() {
		cacheChatDom();
		resetConversation();
		if (!history.length) {
			addHistory("model", "Hola, soy Lia. Que estilo buscas hoy?");
		}
		renderHistory();
		if (chatDom.form) {
			chatDom.form.addEventListener("submit", handleChatSubmit);
		}
		if (chatDom.messages) {
			chatDom.messages.addEventListener("click", handleRecommendationClick);
		}
	}

	var imageDom = {};

	function cacheImageDom() {
		imageDom.form = APP.utils.byId("image-form");
		imageDom.input = APP.utils.byId("image-input");
		imageDom.preview = APP.utils.byId("image-preview");
		imageDom.status = APP.utils.byId("image-status");
		imageDom.result = APP.utils.byId("image-result");
		imageDom.recommendations = APP.utils.byId("image-recommendations");
	}

	function setImageStatus(message) {
		if (imageDom.status) {
			imageDom.status.textContent = message || "";
		}
	}

	function previewImage(file) {
		return new Promise(function (resolve) {
			var reader = new FileReader();
			reader.addEventListener("load", function () {
				if (imageDom.preview) {
					imageDom.preview.src = reader.result;
					imageDom.preview.style.display = "block";
				}
				resolve(reader.result);
			});
			reader.readAsDataURL(file);
		});
	}

	function callGeminiImage(base64Data, mimeType) {
		var apiKey = APP.config.geminiApiKey;
		if (!apiKey) {
			return Promise.reject(new Error("Missing API key"));
		}
		var url = APP.config.geminiBaseUrl + "/" + APP.config.geminiModel + ":generateContent?key=" + apiKey;
		var prompt = "Analyze the image. Reply in JSON only: {\"colors\":[...],\"style\":\"\",\"category\":\"\",\"occasion\":\"\"}. Use ASCII only.";
		var payload = {
			contents: [{
				role: "user",
				parts: [
					{ text: prompt },
					{ inlineData: { mimeType: mimeType, data: base64Data } }
				]
			}]
		};
		return fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload)
		}).then(function (response) {
			if (!response.ok) {
				throw new Error("Gemini image request failed");
			}
			return response.json();
		}).then(function (data) {
			var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : "";
			return text;
		});
	}

	function parseImageResponse(text) {
		var parsed = safeParse(text);
		if (!parsed) {
			return null;
		}
		return {
			colors: Array.isArray(parsed.colors) ? parsed.colors : [],
			style: parsed.style || "",
			category: parsed.category || "",
			occasion: parsed.occasion || ""
		};
	}

	function renderImageResult(data) {
		if (!imageDom.result) {
			return;
		}
		imageDom.result.innerHTML = "";
		if (!data) {
			var fail = document.createElement("p");
			fail.className = "text-muted";
			fail.textContent = "No se pudo interpretar el resultado.";
			imageDom.result.appendChild(fail);
			return;
		}
		var colors = document.createElement("li");
		colors.textContent = "Colores: " + (data.colors.length ? data.colors.join(", ") : "no detectado");
		imageDom.result.appendChild(colors);

		var style = document.createElement("li");
		style.textContent = "Estilo: " + (data.style || "no detectado");
		imageDom.result.appendChild(style);

		var category = document.createElement("li");
		category.textContent = "Categoria: " + (data.category || "no detectado");
		imageDom.result.appendChild(category);

		var occasion = document.createElement("li");
		occasion.textContent = "Ocasion: " + (data.occasion || "no detectado");
		imageDom.result.appendChild(occasion);
	}

	function handleImageSubmit(event) {
		event.preventDefault();
		if (!imageDom.form.checkValidity()) {
			imageDom.form.classList.add("was-validated");
			return;
		}
		var file = imageDom.input.files[0];
		if (!file) {
			return;
		}
		setImageStatus("Analizando imagen...");
		previewImage(file).then(function (dataUrl) {
			var base64 = dataUrl.split(",")[1] || "";
			return callGeminiImage(base64, file.type);
		}).then(function (text) {
			var parsed = parseImageResponse(text);
			renderImageResult(parsed);
			setImageStatus("");
			if (parsed) {
				var filters = {
					color: parsed.colors.length ? parsed.colors[0] : "",
					style: parsed.style || "",
					category: parsed.category || "",
					occasion: parsed.occasion || ""
				};
				if (APP.filters) {
					APP.filters.applyFilters(filters).then(function () {
						if (APP.products) {
							var items = APP.products.getFilteredProducts().slice(0, 4);
							APP.products.renderRecommendations(imageDom.recommendations, items);
						}
					});
				}
			}
		}).catch(function () {
			setImageStatus("No se pudo analizar la imagen. Revisa la API key.");
		});
	}

	function initImage() {
		cacheImageDom();
		if (imageDom.form) {
			imageDom.form.addEventListener("submit", handleImageSubmit);
		}
	}

	APP.chatbot = {
		init: initChat
	};

	APP.image = {
		init: initImage
	};
})();
