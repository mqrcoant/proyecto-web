# 👗 VestIA – Plataforma Web de Comercio Electrónico con Asistente IA

**VestIA** es una aplicación web de comercio electrónico desarrollada como proyecto final de la asignatura **Programación Orientada a la Web**.  
La plataforma simula una boutique de moda que integra un **asistente de estilo inteligente**, permitiendo a los usuarios encontrar prendas de forma intuitiva y recibir recomendaciones personalizadas basadas en gustos, preferencias y análisis de imágenes.

---

## 🎯 Objetivo del Proyecto

Desarrollar una plataforma web moderna, responsiva y funcional que:

- Muestre un catálogo dinámico de productos.
- Incorpore un asistente conversacional con **inteligencia artificial**.
- Permita análisis de imágenes para recomendaciones de estilo.
- Gestione un carrito de compras persistente.
- Almacene preferencias del usuario para personalización futura.

---

## 🚀 Funcionalidades Principales

### 🛍️ Catálogo de Productos
- Productos obtenidos dinámicamente desde **DummyJSON API**.
- Visualización con imágenes, descripción y precio.
- Paginación (mínimo 9 productos por página).
- Filtros por categoría, color, talla, estilo y ocasión.
- Barra de búsqueda por nombre o descripción.

### 🤖 Asistente de Estilo con IA
- Chatbot conversacional usando **Google Gemini API**.
- Recomendaciones personalizadas.
- Mantiene el contexto de la conversación.
- Botones de recomendación con filtros automáticos.

### 🖼️ Reconocimiento de Imágenes
- Subida de imágenes de prendas u outfits.
- Identificación de colores y estilos.
- Recomendación de productos similares del catálogo.

### 🛒 Carrito de Compras
- Agregar, modificar y eliminar productos.
- Cálculo automático del total.
- Persistencia con **localStorage**.

### 📱 Diseño Responsivo
- Adaptable a escritorio, tablet y móvil.
- Implementado con **Bootstrap 5**.

---

## 🛠️ Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5.3+
- Google Gemini API
- DummyJSON API
- Fetch API
- localStorage
- Git & GitHub
- GitHub Pages

---

## 📁 Estructura del Proyecto

```
proyecto/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── config.js
    ├── products.js
    ├── cart.js
    ├── chatbot.js
    ├── filters.js
    ├── profile.js
    └── main.js
```

---

## ⚙️ Instalación y Uso

1. Clonar el repositorio:
```
git clone https://github.com/tu-usuario/vestia.git
```

2. Abrir `index.html` en el navegador  
   o acceder al despliegue en **GitHub Pages**.

---

## 📌 Notas de Seguridad

- Las API Keys se manejan en el frontend **solo con fines académicos**.
- En producción deben usarse variables de entorno o backend.

---

## 👥 Trabajo Colaborativo

Proyecto desarrollado en equipo usando control de versiones con Git.  
Cada integrante puede explicar las partes fundamentales del desarrollo.

---

## 📄 Licencia

Proyecto académico – uso educativo.
