const cartId = window.cartId;

// Botones de eliminar producto
const deleteButtons = document.querySelectorAll("button[data-pid]");
deleteButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const pid = btn.getAttribute("data-pid");
    try {
      const res = await fetch(`/api/carts/${cartId}/products/${pid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        location.reload();
      } else {
        alert("❌ No se pudo eliminar el producto");
      }
    } catch (error) {
      alert("❌ Error eliminando producto");
    }
  });
});

// Botón de vaciar carrito
const vaciarBtn = document.getElementById("vaciarCarritoBtn");
if (vaciarBtn) {
  vaciarBtn.addEventListener("click", async () => {
    const confirmar = confirm("¿Estás seguro de vaciar el carrito?");
    if (!confirmar) return;
    try {
      const res = await fetch(`/api/carts/${cartId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        location.reload();
      } else {
        alert("❌ No se pudo vaciar el carrito");
      }
    } catch (error) {
      alert("❌ Error vaciando carrito");
    }
  });
}
