let carrito = [];
let categoriaActual = "todos";

const productos = [
    {
        id: 1,
        nombre: "Bujias sail 1.4 2011-2016 + filtro de aire",
        categoria: "Bujías",
        precio: "22.310",
        imagen: "img/bujias sail 1.4 2011-2016 + filtro de aire.jpg" 
    },
    {
        id: 2,
        nombre: "Filtro de petroleo y aceite hyundai porter 1995-2005",
        categoria: "Filtros y aceites",
        precio: "22.300",
        imagen: "img/filtro de petroleo y aceite hyundai porter 1995-2005.jpg"
    },
    {
        id: 3,
        nombre: "Kit afinamiento hyundai accent RB kia rio 3-4-5",
        categoria: "Kit",
        precio: "48.800",
        imagen: "img/kit afinamiento hyundai accent RB kia rio 3-4-5.jpg"
    },
    {
        id: 4,
        nombre: "Kit de afinamiento spark 1000 cc + limpia inyectores",
        categoria: "Kit",
        precio: "32.300",
        imagen: "img/kit de afinamiento spark 1000 cc + limpia inyectores.jpg"
    }
];

window.onload = function () {
    cargarCarrito();
    mostrarProductos(productos);
};

function mostrarProductos(lista) {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";
    lista.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("producto");
        
        // Limpiamos el punto del precio para cálculos (ej: "22.310" -> 22310)
        const precioNumerico = parseInt(p.precio.replace(/\./g, ''));

        div.innerHTML = `
            <img src="${p.imagen}" alt="${p.nombre}">
            <h3>${p.nombre}</h3>
            <p><strong>$${p.precio}</strong></p>
            <button class="btn-agregar" onclick="agregarAlCarrito('${p.nombre}', ${precioNumerico})">Agregar</button>
        `;
        contenedor.appendChild(div);
    });
}

function filtrarProductos() {
    const texto = document.getElementById("buscador").value.toLowerCase();
    let filtrados = productos.filter(p => p.nombre.toLowerCase().includes(texto));
    if (categoriaActual !== "todos") {
        filtrados = filtrados.filter(p => p.categoria === categoriaActual);
    }
    mostrarProductos(filtrados);
}

function filtrarCategoria(cat) {
    categoriaActual = cat;
    filtrarProductos();
}

function irHome() {
    categoriaActual = "todos";
    document.getElementById("buscador").value = "";
    mostrarProductos(productos);
}

function agregarAlCarrito(nombre, precio) {
    const producto = carrito.find(p => p.nombre === nombre);
    if (producto) { 
        producto.cantidad++; 
    } else { 
        carrito.push({ nombre, precio, cantidad: 1 }); 
    }
    actualizarCarrito();
}

function aumentarCantidad(index) {
    carrito[index].cantidad++;
    actualizarCarrito();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) { 
        carrito[index].cantidad--; 
    } else { 
        carrito.splice(index, 1); 
    }
    actualizarCarrito();
}

function actualizarCarrito() {
    const contenedor = document.getElementById("carrito");
    contenedor.innerHTML = "";
    let total = 0;

    carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad;
        const item = document.createElement("div");
        item.classList.add("item-carrito");
        item.innerHTML = `
            <div><strong>${producto.nombre}</strong><br>$${producto.precio.toLocaleString('es-CL')} x ${producto.cantidad}</div>
            <div class="controles">
                <button onclick="disminuirCantidad(${index})">−</button>
                <button onclick="aumentarCantidad(${index})">+</button>
            </div>
        `;
        contenedor.appendChild(item);
        total += subtotal;
    });

    document.getElementById("total").textContent = total.toLocaleString('es-CL');
    guardarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarrito() {
    const data = localStorage.getItem("carrito");
    if (data) {
        carrito = JSON.parse(data);
        actualizarCarrito();
    }
}

// INTEGRACIÓN WEBPAY (Backend en puerto 4000)
async function pagarConWebpay() {
    const total = carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    if (total <= 0) { alert("El carrito está vacío"); return; }

    const btnPagar = document.getElementById("btn-pagar");
    btnPagar.disabled = true;
    btnPagar.innerText = "Cargando...";

    try {
        const response = await fetch('http://localhost:4000/create-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                buyOrder: "ORD-" + Math.floor(Math.random() * 10000),
                sessionId: "Sess-" + Math.floor(Math.random() * 10000),
                amount: total,
                returnUrl: 'http://localhost:4000/commit-transaction' 
            })
        });

        const data = await response.json();
        if (data.token && data.url) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.url;
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'token_ws';
            input.value = data.token;
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor.");
        btnPagar.disabled = false;
        btnPagar.innerText = "Pagar con Webpay";
    }
}
