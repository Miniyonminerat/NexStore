// ===== VARIABLES DE STORAGE Y APIS =====
var _carritoMemoria = [];
var stripe = null;
var stripeElements = null;
var stripeCardNumber = null;

function getCarrito() {
    try {
        return JSON.parse(sessionStorage.getItem("carrito")) || [];
    } catch(e) {
        return _carritoMemoria;
    }
}

function setCarrito(carrito) {
    try {
        sessionStorage.setItem("carrito", JSON.stringify(carrito));
    } catch(e) {
        _carritoMemoria = carrito;
    }
}

function removeCarrito() {
    try {
        sessionStorage.removeItem("carrito");
    } catch(e) {
        _carritoMemoria = [];
    }
}

// ===== TOAST =====
function mostrarToast(mensaje, tipo) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = mensaje;
    toast.className = "toast " + (tipo || "");
    toast.classList.add("show");
    setTimeout(function() {
        toast.classList.remove("show");
    }, 2800);
}

// ===== AGREGAR =====
function agregarProducto(nombre, precio, imagen) {
    var carrito = getCarrito();
    carrito.push({ nombre: nombre, precio: parseFloat(precio), imagen: imagen });
    setCarrito(carrito);
    actualizarContadorFlotante();
    mostrarToast("✓  " + nombre.substring(0, 30) + "... agregado", "success");
}

// ===== CONTADOR FLOTANTE =====
function actualizarContadorFlotante() {
    var contador = document.getElementById("carrito-count");
    if (!contador) return;
    var carrito = getCarrito();
    contador.textContent = carrito.length;
}

// ===== MOSTRAR CARRITO =====
function mostrarCarrito() {
    var lista = document.getElementById("lista");
    var totalEl = document.getElementById("total");
    var subtotalEl = document.getElementById("subtotal");
    var itemsEl = document.getElementById("items-count");
    var carritoSection = document.getElementById("carrito-section");
    var vacioSection = document.getElementById("vacio-section");

    if (!lista) return;

    var carrito = getCarrito();
    lista.innerHTML = "";
    var total = 0;

    if (carrito.length === 0) {
        if (carritoSection) carritoSection.style.display = "none";
        if (vacioSection) vacioSection.style.display = "block";
        return;
    }

    if (carritoSection) carritoSection.style.display = "block";
    if (vacioSection) vacioSection.style.display = "none";

    carrito.forEach(function(producto, index) {
        var li = document.createElement("li");
        li.className = "carrito-item";
        li.innerHTML =
            '<div class="item-info">' +
                '<span class="item-indice">Artículo #' + (index + 1) + '</span>' +
                '<span class="item-nombre">' + producto.nombre + '</span>' +
            '</div>' +
            '<span class="item-precio">$' + producto.precio.toFixed(2) + '</span>' +
            '<button class="btn btn-danger" onclick="eliminarProducto(' + index + ')">✕</button>';
        lista.appendChild(li);
        total += producto.precio;
    });

    if (totalEl) totalEl.textContent = total.toFixed(2);
    if (subtotalEl) subtotalEl.textContent = total.toFixed(2);
    if (itemsEl) itemsEl.textContent = carrito.length + (carrito.length === 1 ? " artículo" : " artículos");

    // Actualizar label
    var label = document.getElementById("carrito-count-label");
    if (label) label.textContent = carrito.length + (carrito.length === 1 ? " artículo" : " artículos");
}

// ===== ELIMINAR =====
function eliminarProducto(indice) {
    var carrito = getCarrito();
    carrito.splice(indice, 1);
    setCarrito(carrito);
    mostrarCarrito();
    mostrarToast("Artículo eliminado", "danger");
}

// ===== VACIAR =====
function vaciarCarrito() {
    removeCarrito();
    mostrarCarrito();
    mostrarToast("Carrito vaciado", "danger");
}

// ===== COMPRAR =====
function comprar() {
    var carrito = getCarrito();
    if (carrito.length === 0) {
        mostrarToast("El carrito está vacío", "danger");
        return;
    }
    removeCarrito();
    mostrarCarrito();
    mostrarToast("✓  ¡Compra realizada con éxito!", "success");
}

// ===== FAKESTORE API =====
function cargarProductos() {
    var contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    // Mostrar skeletons mientras carga
    contenedor.innerHTML = "";
    for (var s = 0; s < 8; s++) {
        contenedor.innerHTML +=
            '<div class="skeleton">' +
                '<div class="skeleton-img"></div>' +
                '<div class="skeleton-body">' +
                    '<div class="skeleton-line short"></div>' +
                    '<div class="skeleton-line medium"></div>' +
                    '<div class="skeleton-line short"></div>' +
                '</div>' +
            '</div>';
    }

    fetch("https://fakestoreapi.com/products")
        .then(function(res) { return res.json(); })
        .then(function(productos) {
            contenedor.innerHTML = "";
            window._todosProductos = productos;
            renderizarProductos(productos);
            configurarFiltros(productos);
            actualizarContadorFlotante();
        })
        .catch(function() {
            contenedor.innerHTML =
                '<div class="error-state">' +
                    '<h3>⚠ Error al cargar productos</h3>' +
                    '<p>No se pudo conectar con la API. Intenta de nuevo.</p>' +
                '</div>';
        });
}

function renderizarProductos(productos) {
    var contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    productos.forEach(function(p) {
        var div = document.createElement("div");
        div.className = "producto-card";
        div.dataset.categoria = p.category;

        var btn = document.createElement("button");
        btn.className = "btn-agregar";
        btn.textContent = "+ Agregar";
        btn.addEventListener("click", function() {
            agregarProducto(p.title, p.price, p.image);
        });

        div.innerHTML =
            '<div class="producto-card-img">' +
                '<span class="producto-card-badge">' + p.category.substring(0, 12) + '</span>' +
                '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy">' +
            '</div>' +
            '<div class="producto-card-body">' +
                '<span class="producto-card-category">' + p.category + '</span>' +
                '<span class="producto-card-title">' + p.title + '</span>' +
            '</div>' +
            '<div class="producto-card-footer">' +
                '<span class="producto-card-price"><span class="currency">USD </span>$' + p.price.toFixed(2) + '</span>' +
            '</div>';

        div.querySelector(".producto-card-footer").appendChild(btn);
        contenedor.appendChild(div);
    });
}

function configurarFiltros(productos) {
    var filterBar = document.getElementById("filter-bar");
    if (!filterBar) return;

    var categorias = [...new Set(productos.map(function(p) { return p.category; }))];
    filterBar.innerHTML = '<button class="filter-btn active" data-cat="all">Todos</button>';

    categorias.forEach(function(cat) {
        var btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.dataset.cat = cat;
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        filterBar.appendChild(btn);
    });

    filterBar.addEventListener("click", function(e) {
        var btn = e.target.closest(".filter-btn");
        if (!btn) return;
        filterBar.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var cat = btn.dataset.cat;
        var filtrados = cat === "all" ? window._todosProductos : window._todosProductos.filter(function(p) { return p.category === cat; });
        renderizarProductos(filtrados);
    });
}

// ===== GOOGLE MAPS =====
var mapa = null;
var marcador = null;
var geocoder = null;
var direccionConfirmada = null;

function abrirModalMapa() {
    var carrito = getCarrito();
    if (carrito.length === 0) {
        mostrarToast("El carrito está vacío", "danger");
        return;
    }

    var modal = document.getElementById("modal-mapa");
    modal.style.display = "flex";

    // Inicializar mapa solo la primera vez
    if (!mapa) {
        setTimeout(function() {
            iniciarMapa();
        }, 100);
    }
}

function cerrarModalMapa() {
    document.getElementById("modal-mapa").style.display = "none";
}

function iniciarMapa() {
    geocoder = new google.maps.Geocoder();

    var centro = { lat: 4.7110, lng: -74.0721 };

    mapa = new google.maps.Map(document.getElementById("mapa-contenedor"), {
        center: centro,
        zoom: 13,
        styles: [
            { elementType: "geometry",           stylers: [{ color: "#1c2333" }] },
            { elementType: "labels.text.fill",   stylers: [{ color: "#8b949e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
            { featureType: "road", elementType: "geometry",         stylers: [{ color: "#30363d" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
            { featureType: "water", elementType: "geometry",        stylers: [{ color: "#0d1117" }] },
            { featureType: "poi",                stylers: [{ visibility: "off" }] }
        ]
    });

    // Clic en el mapa
    mapa.addListener("click", function(e) {
        colocarMarcador(e.latLng);

        // Fallback inmediato: usa coordenadas si geocoder falla
        var lat = e.latLng.lat().toFixed(5);
        var lng = e.latLng.lng().toFixed(5);
        var fallback = "Lat: " + lat + ", Lng: " + lng;

        geocoder.geocode({ location: e.latLng }, function(results, status) {
            if (status === "OK" && results[0]) {
                mostrarDireccion(results[0].formatted_address);
            } else {
                // Aunque no encuentre dirección, igual habilita el botón con coordenadas
                mostrarDireccion(fallback);
            }
        });
    });

    // Autocompletar
    var autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("mapa-busqueda"),
        { types: ["geocode"] }
    );
    autocomplete.addListener("place_changed", function() {
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            mostrarToast("Selecciona una opción de la lista desplegable", "danger");
            return;
        }
        mapa.setCenter(place.geometry.location);
        mapa.setZoom(16);
        colocarMarcador(place.geometry.location);
        mostrarDireccion(place.formatted_address);
    });
}

function colocarMarcador(posicion) {
    if (marcador) marcador.setMap(null);
    marcador = new google.maps.Marker({
        position: posicion,
        map: mapa,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#00c7ff",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2
        }
    });
}

function mostrarDireccion(texto) {
    direccionConfirmada = texto;
    document.getElementById("direccion-texto").textContent = texto;
    document.getElementById("direccion-chip").style.display = "block";

    var btn = document.getElementById("btn-confirmar-dir");
    btn.disabled = false;
    btn.style.opacity = "1";
    btn.style.cursor = "pointer";
}

function buscarEnMapa() {
    var query = document.getElementById("mapa-busqueda").value.trim();
    if (!query) return;

    if (!geocoder) geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: query }, function(results, status) {
        if (status === "OK" && results[0]) {
            mapa.setCenter(results[0].geometry.location);
            mapa.setZoom(16);
            colocarMarcador(results[0].geometry.location);
            mostrarDireccion(results[0].formatted_address);
        } else {
            mostrarToast("No se encontró esa dirección, intenta con más detalle", "danger");
        }
    });
}

function confirmarDireccion() {
    if (!direccionConfirmada) return;
    cerrarModalMapa();
    mostrarToast("📍 Dirección confirmada", "success");
    setTimeout(function() {
        abrirModalPago();
    }, 400);
}

// ===== COMPRAR (temporal hasta integrar Stripe) =====
function comprar() {
    var carrito = getCarrito();
    if (carrito.length === 0) {
        mostrarToast("El carrito está vacío", "danger");
        return;
    }

    var dir = direccionConfirmada ? "\nEntrega en: " + direccionConfirmada : "";
    mostrarToast("✓ ¡Compra realizada!" + (dir ? " 📍" : ""), "success");
    removeCarrito();
    mostrarCarrito();
    direccionConfirmada = null;
}


// ===== MODAL =====
function initModal() {
    var modal = document.getElementById("modal");
    var btnAbrir = document.getElementById("openModal");
    var btnCerrar = document.querySelector(".close");

    if (btnAbrir && modal) {
        btnAbrir.addEventListener("click", function() {
            modal.classList.add("active");
        });
    }

    if (btnCerrar && modal) {
        btnCerrar.addEventListener("click", function() {
            modal.classList.remove("active");
        });
    }

    if (modal) {
        window.addEventListener("click", function(e) {
            if (e.target === modal) modal.classList.remove("active");
        });
    }
}

// ===== ACTIVE NAV =====
function marcarNavActivo() {
    var path = window.location.pathname.split("/").pop();
    document.querySelectorAll(".navbar a").forEach(function(a) {
        var href = a.getAttribute("href");
        if (href === path || (path === "" && href === "index.html")) {
            a.classList.add("active");
        }
    });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", function() {
    mostrarCarrito();
    cargarProductos();
    actualizarContadorFlotante();
    initModal();
    marcarNavActivo();
});



// ===== STRIPE =====
function iniciarStripe() {
    // Reemplaza con tu publishable key
    stripe = Stripe("pk_test_51TEbXNGTHjpftBwxCUqXDA4BT9uzhsVdXIgAd4XCM6YrQIedUeUPWiLxL4qE5n38k5YnfPAtfwaEa7UIUI2MwSZK00KrFrLZOT");

    stripeElements = stripe.elements({
        fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Exo+2:wght@400&display=swap" }]
    });

    var estilo = {
        base: {
            color: "#e6edf3",
            fontFamily: "'Exo 2', sans-serif",
            fontSize: "14px",
            "::placeholder": { color: "#484f58" },
            iconColor: "#00c7ff"
        },
        invalid: { color: "#f85149", iconColor: "#f85149" }
    };

    stripeCardNumber = stripeElements.create("cardNumber", { style: estilo, showIcon: true });
    var cardExpiry  = stripeElements.create("cardExpiry",  { style: estilo });
    var cardCvc     = stripeElements.create("cardCvc",     { style: estilo });

    stripeCardNumber.mount("#stripe-card-number");
    cardExpiry.mount("#stripe-card-expiry");
    cardCvc.mount("#stripe-card-cvc");

    // Mostrar errores en tiempo real
    [stripeCardNumber, cardExpiry, cardCvc].forEach(function(el) {
        el.on("change", function(event) {
            var errorDiv = document.getElementById("stripe-error");
            if (event.error) {
                errorDiv.textContent = event.error.message;
                errorDiv.style.display = "block";
            } else {
                errorDiv.style.display = "none";
            }
        });
    });
}

function abrirModalPago() {
    var carrito = getCarrito();
    if (carrito.length === 0) return;

    // Llenar resumen
    var itemsHtml = "";
    var total = 0;
    carrito.forEach(function(p) {
        itemsHtml += '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">' +
            '<span>' + p.nombre.substring(0, 38) + (p.nombre.length > 38 ? "…" : "") + '</span>' +
            '<span>$' + p.precio.toFixed(2) + '</span>' +
        '</div>';
        total += p.precio;
    });

    document.getElementById("stripe-items").innerHTML = itemsHtml;
    document.getElementById("stripe-total").textContent = total.toFixed(2);
    document.getElementById("stripe-dir-texto").textContent = direccionConfirmada || "No especificada";

    var modal = document.getElementById("modal-pago");
    modal.style.display = "flex";

    // Iniciar Stripe solo la primera vez
    if (!stripe) {
        setTimeout(function() { iniciarStripe(); }, 150);
    }
}

function cerrarModalPago() {
    document.getElementById("modal-pago").style.display = "none";
}

function procesarPago() {
    var nombre = document.getElementById("stripe-nombre").value.trim();
    var email  = document.getElementById("stripe-email").value.trim();
    var errorDiv = document.getElementById("stripe-error");

    if (!nombre) {
        errorDiv.textContent = "Ingresa el nombre en la tarjeta";
        errorDiv.style.display = "block";
        return;
    }
    if (!email || !email.includes("@")) {
        errorDiv.textContent = "Ingresa un correo válido";
        errorDiv.style.display = "block";
        return;
    }

    var btn = document.getElementById("btn-pagar");
    btn.textContent = "⏳ Procesando...";
    btn.disabled = true;

    stripe.createToken(stripeCardNumber, { name: nombre }).then(function(result) {
        if (result.error) {
            errorDiv.textContent = result.error.message;
            errorDiv.style.display = "block";
            btn.textContent = "⚡ Pagar ahora";
            btn.disabled = false;
        } else {
            pagoExitoso(nombre, email, result.token);
        }
    });
}

function pagoExitoso(nombre, email, token) {
    var carrito = getCarrito();
    var total = carrito.reduce(function(sum, p) { return sum + p.precio; }, 0);

    cerrarModalPago();
    removeCarrito();
    mostrarCarrito();
    direccionConfirmada = null;

    mostrarToast("✅ ¡Pago aprobado! Revisa tu correo", "success");
    enviarRecibo(nombre, email, carrito, total, token.id);
}

// ===== EMAILJS =====
(function() {
    emailjs.init("KAN4rNWg120zznrFM");
})();

function enviarRecibo(nombre, email, carrito, total, tokenId) {
    var productos = carrito.map(function(p, i) {
        return (i + 1) + ". " + p.nombre + "\n   Precio: $" + p.precio.toFixed(2);
    }).join("\n\n");

    var fecha = new Date().toLocaleString("es-CO", {
        dateStyle: "long",
        timeStyle: "short"
    });

    var ordenId = tokenId.substring(0, 12).toUpperCase();

    emailjs.send("service_lfezklj", "template_1s9pxs2", {
        nombre:    nombre,
        email:     email,
        productos: productos,
        total:     total.toFixed(2),
        direccion: direccionConfirmada || "No especificada",
        fecha:     fecha,
        orden_id:  ordenId
    }).then(function() {
        mostrarToast("📧 Recibo enviado a " + email, "success");
    }).catch(function(err) {
        console.error("EmailJS error:", err);
        mostrarToast("⚠️ Pago ok, pero no se pudo enviar el correo", "danger");
    });
}
