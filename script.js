document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const modal = document.getElementById('modal-registro');
  const cerrar = document.getElementById('cerrar-registro');
  const form = document.getElementById('form-registro');
  const menuToggle = document.getElementById('menu-toggle');
  const navList = document.getElementById('main-nav-list');
  const animItems = document.querySelectorAll('.animate');
  const usuarioRegistrado = localStorage.getItem('usuario') !== null;

  carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const cartDropdown = document.getElementById("cart-dropdown");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const abrirCarrito = document.getElementById("abrir-carrito");

  function actualizarCarrito() {
    if (!cartItems || !cartTotal) return;
    cartItems.innerHTML = "";
    let total = 0;

    carrito.forEach((item, index) => {
      const li = document.createElement("li");
      li.dataset.nombre = item.nombre;
      li.dataset.precio = item.precio;
      li.innerHTML = `
        ${item.nombre} - $${item.precio} MXN
        <input type="number" min="1" value="${item.cantidad}" class="cantidad" style="width:40px; margin-left:8px;" />
        <button class="btn-eliminar">×</button>
      `;
      li.querySelector('.btn-eliminar').addEventListener('click', (e) => {
        e.stopPropagation();
        carrito.splice(index, 1);
        actualizarCarrito();
      });
      li.querySelector('.cantidad').addEventListener('change', e => {
        let val = parseInt(e.target.value);
        carrito[index].cantidad = isNaN(val) || val <= 0 ? 1 : val;
        actualizarCarrito();
      });

      cartItems.appendChild(li);
      total += item.precio * item.cantidad;
    });

    cartTotal.textContent = total.toFixed(2);
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  if (abrirCarrito && cartDropdown) {
    abrirCarrito.addEventListener('click', (e) => {
      e.preventDefault();

      if (cartDropdown.classList.contains("oculto")) {
        cartDropdown.classList.remove("oculto");
        cartDropdown.classList.add("mostrar");
      } else {
        cartDropdown.classList.add("oculto");
        cartDropdown.classList.remove("mostrar");
      }

      actualizarCarrito();
    });
  }

  function agregarProducto(nombre, precio) {
    const existe = carrito.find(p => p.nombre === nombre);
    if (existe) {
      existe.cantidad++;
    } else {
      carrito.push({ nombre, precio, cantidad: 1 });
    }
    actualizarCarrito();
  }

  // Agregar evento a las imágenes de la galería
  document.querySelectorAll('.galeria-img').forEach(img => {
    img.addEventListener('click', (e) => {
      const nombre = e.target.alt;  // Suponiendo que el nombre de la imagen está en el atributo 'alt'
      const precio = 100;  // Puedes ajustar el precio aquí si es necesario
      agregarProducto(nombre, precio);

      cartDropdown.classList.remove("oculto");
      cartDropdown.classList.add("mostrar");
      actualizarCarrito();
    });
  });

  document.querySelectorAll('.taco-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains("agregar-carrito")) return;

      const nombre = item.dataset.nombre;
      const precio = parseFloat(item.dataset.precio);
      agregarProducto(nombre, precio);

      cartDropdown.classList.remove("oculto");
      cartDropdown.classList.add("mostrar");
      actualizarCarrito();
    });
  });

  document.querySelectorAll('.agregar-carrito').forEach(boton => {
    boton.addEventListener('click', (e) => {
      e.stopPropagation();

      const nombre = boton.dataset.nombre;
      const precio = parseFloat(boton.dataset.precio);
      agregarProducto(nombre, precio);

      cartDropdown.classList.remove("oculto");
      cartDropdown.classList.add("mostrar");
      actualizarCarrito();
    });
  });

  // Funciones adicionales de carrito y pago
  function obtenerCarrito() {
    return carrito.map(item => ({
      nombre: item.nombre,
      cantidad: parseInt(item.cantidad || 1),
      precio: parseFloat(item.precio)
    }));
  }

  function calcularTotal(carrito) {
    return carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  }

  if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (intro) {
          intro.style.transition = 'opacity 1s ease';
          intro.style.opacity = '0';
          setTimeout(() => {
            intro.style.display = 'none';
            if (!usuarioRegistrado && modal) {
              modal.style.display = 'block';
            }
          }, 1000);
        }
      }, 2500);
    });
  }

  if (cerrar) {
    cerrar.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const edad = parseInt(document.getElementById('edad').value);
      if (isNaN(edad) || edad < 18) {
        alert('Debes tener al menos 18 años para registrarte.');
        return;
      }

      const usuario = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('email').value,
        contrasena: document.getElementById('password').value,
        edad: edad,
        direccion: document.getElementById('direccion').value,
        telefono: document.getElementById('telefono').value
      };

      fetch('registrar_usuario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      })
      .then(async res => {
        const texto = await res.text();
        const data = texto ? JSON.parse(texto) : {};
        console.log(data);

        if (data.success) {
          const usuarioCompleto = {
            id: data.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            edad: usuario.edad,
            direccion: usuario.direccion,
            telefono: usuario.telefono
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioCompleto));
          alert(`¡Gracias por registrarte, ${usuario.nombre}!`);
          modal.style.display = 'none';
          window.location.href = 'usuario.html';
        }
        else {
          alert(data.error || "Error al registrar");
        }
      })
      .catch(err => {
        console.error("Error al procesar la respuesta:", err);
        alert("Hubo un error al intentar registrar.");
      });
    });
  }

  function animOnScroll() {
    animItems.forEach(item => {
      const itemHeight = item.offsetHeight;
      const itemTop = item.getBoundingClientRect().top + window.scrollY;
      const startAnimAt = window.innerHeight - itemHeight / 4;
      if (window.scrollY > itemTop - startAnimAt) {
        item.classList.add('show');
      } else {
        item.classList.remove('show');
      }
    });
  }

  window.addEventListener('scroll', animOnScroll);
  window.addEventListener('load', animOnScroll);

  const listaCarritoHTML = document.getElementById("lista-carrito");
  const totalHTML = document.getElementById("total-carrito");

  if (listaCarritoHTML && totalHTML) {
    listaCarritoHTML.innerHTML = "";
    let suma = 0;

    carrito.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `${item.cantidad} x ${item.nombre} - $${(item.precio * item.cantidad).toFixed(2)}
        <button onclick="eliminarProductoDesdeCarrito(${index})">❌</button>`;
      listaCarritoHTML.appendChild(li);
      suma += item.precio * item.cantidad;
    });

    totalHTML.textContent = "Total: $" + suma.toFixed(2);
  }

  window.eliminarProductoDesdeCarrito = function(index) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    location.reload();
  };

  window.checkout = function () {
    if (!carrito || carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.id) {
      alert("Debes iniciar sesión o registrarte primero.");
      const modal = document.getElementById("modal-registro");
      if (modal) {
        modal.style.display = "block";
      } else {
        window.location.href = "index.html";
      }
      return;
    }

    // Mostrar opciones de pago dentro del carrito flotante
    const opcionesTarjeta = document.getElementById("opciones-tarjeta");
    if (opcionesTarjeta) {
      opcionesTarjeta.classList.remove("oculto");
    } else {
      alert("No se encontró el contenedor de opciones de tarjeta.");
    }

    const btnCredito = document.getElementById("btnCredito");
    const btnDebito = document.getElementById("btnDebito");

    const procesarPedido = (metodo) => {
      const carritoActual = obtenerCarrito();
      const productos = carritoActual.map(p => ({
        cantidad: p.cantidad,
        precio: p.precio
      }));

      const data = {
        usuario_id: usuario.id,
        productos: productos,
        total: calcularTotal(carritoActual),
        metodo_pago: metodo
      };

      fetch("registrar_pedido.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          alert("Pedido registrado con éxito usando " + metodo);
          carrito.length = 0;
          localStorage.setItem("carrito", JSON.stringify(carrito));
          actualizarCarrito();
          modalTarjeta.classList.add("hidden");
          modalTarjeta.style.display = "none";
        } else {
          alert("Error al registrar pedido: " + res.error);
        }
      })
      .catch(error => {
        console.error("Error en la petición:", error);

        // Mostrar siempre el total y agradecimiento, aunque haya un error
        const total = calcularTotal(carrito); // Obtener el total del carrito
        alert(`¡Gracias por tu compra! El total a pagar es: $${total.toFixed(2)} MXN`);

        // Limpiar el carrito después del pago (aunque haya error)
        carrito = [];
        localStorage.removeItem("carrito");

        // Actualizar el carrito en la vista
        actualizarCarrito();

        // Recargar la página o redirigir si lo deseas
        location.reload();
      });
    };

    if (btnCredito) btnCredito.onclick = () => procesarPedido("Crédito");
    if (btnDebito) btnDebito.onclick = () => procesarPedido("Débito");
  };

  // ⬇️ Cerrar el modal con botón 'Cancelar'
  const cerrarModalPago = document.getElementById("cerrar-modal-tarjeta");
  if (cerrarModalPago) {
    cerrarModalPago.addEventListener("click", () => {
      const modal = document.getElementById("modal-tarjeta");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });
  }

  window.procesarPagoFinal = function (event) {
    event.preventDefault();
    alert("Pago procesado con éxito. ¡Gracias por tu compra!");
    document.getElementById("formulario-tarjeta").classList.add("hidden");
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
    location.reload();
  };

  window.addEventListener("error", function (e) {
    console.error("🔥 ERROR DETECTADO:", e.message);
    alert("🔥 Error: " + e.message);
  });

  window.addEventListener("unhandledrejection", function (e) {
    console.error("🚨 Promesa sin manejar:", e.reason);
    alert("🚨 Error en promesa: " + e.reason);
  });
});
