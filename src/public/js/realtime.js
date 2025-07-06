const socket = io();

const lista = document.getElementById("listaProductos");
const form = document.getElementById("formProducto");

socket.on("productosActualizados", (productos) => {
  lista.innerHTML = "";

  productos.forEach((p) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
      <span><strong>${p.title}</strong> - $${p.price}</span>
      <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${p.id}')">Eliminar</button>
    `;

    lista.appendChild(li);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const producto = Object.fromEntries(formData.entries());

  producto.price = Number(producto.price);
  producto.stock = Number(producto.stock);
  producto.status = true;
  producto.thumbnails = producto.thumbnails ? [producto.thumbnails] : [];

  socket.emit("nuevoProducto", producto);
  form.reset();
});

function eliminarProducto(id) {
  socket.emit("eliminarProducto", id);
}
