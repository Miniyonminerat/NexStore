# ⚡ NexStore

NexStore es una tienda online desarrollada con **HTML, CSS y JavaScript puro**, que simula una experiencia completa de e-commerce: desde la exploración de productos hasta el proceso de pago.

---

## 🚀 Características principales

- 🛍️ Catálogo dinámico de productos desde API
- 🧠 Filtros por categorías generados automáticamente
- 🛒 Carrito de compras funcional
- 📍 Selección de dirección con mapa interactivo (Google Maps)
- 💳 Simulación de pagos con Stripe
- 📩 Integración con EmailJS
- ⚡ Interfaz moderna, rápida y responsive
- 🔔 Sistema de notificaciones (toast)

---

## 🧩 Tecnologías utilizadas

- HTML5  
- CSS3  
- JavaScript (Vanilla JS)  
- FakeStore API  
- Stripe (modo prueba)  
- Google Maps API  
- EmailJS  

---

## 📁 Estructura del proyecto
```
NexStore/
│
├── index.html
├── Tienda.html
├── carrito.html
│
├── css/
│ ├── index.css
│ ├── tienda.css
│ └── carrito.css
│
├── js/
│ └── script.js
```
---

## 🏠 Páginas del sistema

### 🔹 Inicio
Página principal con presentación del proyecto, acceso a la tienda y al carrito, y un modal informativo.

### 🔹 Tienda
- Productos cargados en tiempo real desde FakeStore API  
- Filtros dinámicos por categoría  
- Agregar productos al carrito  
- Contador de carrito en tiempo real  

### 🔹 Carrito
- Visualización de productos seleccionados  
- Cálculo automático de precios  
- Vaciar carrito  
- Selección de dirección en mapa  
- Simulación de pago  

---

## 🧠 Funcionamiento

- Los productos se obtienen desde una API externa  
- El carrito se gestiona con JavaScript  
- El usuario puede agregar productos, seleccionar dirección y simular una compra  

---

## 💳 Pago de prueba
Tarjeta: 4242 4242 4242 4242
Fecha: cualquier fecha futura
CVC: cualquier número de 3 dígitos


---

## 📍 Mapa

El usuario puede buscar o seleccionar su dirección directamente en el mapa antes de realizar el pago.

---

## 📦 Instalación

```bash
git clone https://github.com/tu-usuario/nexstore.git
cd nexstore
```

⚠️ Nota

Este proyecto es una simulación de e-commerce, no realiza pagos reales.

📌 Futuras mejoras
Backend real
Sistema de autenticación
Base de datos
Pagos reales
Historial de compras
Panel de administración
👨‍💻 Autor

Juan Diego Monsalve Martinez

⭐ Objetivo

Proyecto desarrollado como parte de portafolio para demostrar habilidades en desarrollo frontend, consumo de APIs y lógica de e-commerce.
