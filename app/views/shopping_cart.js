const cartItems = document.getElementById("cartItems");
const cartSummary = document.getElementById("cartSummary");
const totalAmount = document.getElementById("totalAmount");
const itemsQuantity = document.getElementById("items-quantity");

let shoppingCart = JSON.parse(sessionStorage.getItem("shopping_cart")) || [];
let productData = [];

// Cargar productos en el carrito
function loadCart() {
    // Hacer solicitud XHR para obtener detalles de cada producto en el carrito
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/api/cart");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(shoppingCart));

    xhr.onload = function () {
        if (xhr.status === 200) {
            productData = JSON.parse(xhr.responseText);
            renderCartItems();
            updateSummary();
            updateItemsQuantity();
        }
    };
}

// Renderizar productos en el carrito
function renderCartItems() {
    cartItems.innerHTML = "";
    productData.forEach((product, index) => {
        const cartItem = shoppingCart.find(item => item.uuid === product.uuid);
        const totalPrice = product.pricePerUnit * cartItem.quantity;

        cartItems.innerHTML += `

            <tr>
                <!-- Columna ITEM -->
                <td>
                    <img src="${product.imageURL}" alt="${product.title}" style="width: 100px; height: auto;">
                </td>
                <!-- Columna DESCRIPTION -->
                <td class="align-middle" style="width: 30%;">
                    <strong>${product.title}</strong><br/>
                    ${product.description}
                </td>
                <!-- Columna QTY -->
                <td class="align-middle text-end" style="width: 25%;">
                    <div style="display: flex; justify-content: flex-end; align-items: center; gap:5px">
                        <input type="number" value="${cartItem.quantity}" class="form-control mx-2 w-25 quantity-input" min="0" disabled>
                        <button class="btn btn-primary btn-sm" onclick="editQuantity('${product.uuid}', this)"><i class="fa fa-pencil-alt"></i></button>
                        <button class="btn btn-success btn-sm d-none" onclick="confirmQuantity('${product.uuid}', this)"><i class="fa fa-check"></i></button>
                        <button class="btn btn-danger btn-sm d-none" onclick="cancelEdit('${product.uuid}', this)"><i class="fa fa-times"></i></button>
                    </div>
                </td>
                <!-- Columna PRICE -->
                <td class="align-middle text-end" style="width: 20%;">
                    <strong>$${product.pricePerUnit} x ${cartItem.quantity}</strong>
                </td>
                <!-- Columna para QUITAR -->
                <td class="align-middle text-end">
                    <button class="btn btn-link p-0 text-dark" onclick="removeItem('${product.uuid}')">QUITAR</button>
                </td>
            </tr>


        `;
    });
}

// Activar edición de cantidad
function editQuantity(uuid, editButton) {
    editButton.classList.add("d-none");
    const confirmButton = editButton.nextElementSibling;
    const cancelButton = confirmButton.nextElementSibling;
    confirmButton.classList.remove("d-none");
    cancelButton.classList.remove("d-none");

    const quantityInput = editButton.previousElementSibling;
    quantityInput.disabled = false;
}

// Confirmar la edición de la cantidad
function confirmQuantity(uuid, confirmButton) {
    const quantityInput = confirmButton.previousElementSibling.previousElementSibling;
    const newQuantity = parseInt(quantityInput.value);
    updateQuantity(uuid, newQuantity);
    resetEditMode(uuid);
}

// Cancelar edición de la cantidad
function cancelEdit(uuid, cancelButton) {
    const item = shoppingCart.find(item => item.uuid === uuid);
    const quantityInput = cancelButton.previousElementSibling.previousElementSibling.previousElementSibling;
    quantityInput.value = item.quantity;
    resetEditMode(uuid);
}

// Restablecer el modo de edición (oculta los botones de confirmación/cancelación y vuelve a mostrar el lápiz)
function resetEditMode(uuid) {
    const cartItemContainer = document.querySelector(`#cartItems [onclick="editQuantity('${uuid}', this)"]`).parentElement;
    const editButton = cartItemContainer.querySelector(".btn-primary");
    const confirmButton = cartItemContainer.querySelector(".btn-success");
    const cancelButton = cartItemContainer.querySelector(".btn-secondary");
    const quantityInput = cartItemContainer.querySelector(".quantity-input");

    editButton.classList.remove("d-none");
    confirmButton.classList.add("d-none");
    cancelButton.classList.add("d-none");
    quantityInput.disabled = true;
}

// Actualizar la cantidad en el carrito
function updateQuantity(uuid, newQuantity) {
    const item = shoppingCart.find(item => item.uuid === uuid);
    if (newQuantity == 0) {
        removeItem(uuid);
        return;
    }
    if (newQuantity < 0) {
        alert("La cantidad no puede ser menor a 0");
        loadCart();
        return;
    }
    if (isNaN(newQuantity)) {
        alert("Por favor, ingrese una cantidad válida");
        loadCart();
        return;
    }
    item.quantity = parseInt(newQuantity);
    sessionStorage.setItem("shopping_cart", JSON.stringify(shoppingCart));
    loadCart();
}

// Eliminar un producto del carrito
function removeItem(uuid) {
    shoppingCart = shoppingCart.filter(item => item.uuid !== uuid);
    sessionStorage.setItem("shopping_cart", JSON.stringify(shoppingCart));
    loadCart();
}

// Actualizar el resumen de compra
function updateSummary() {
    cartSummary.innerHTML = "";
    let total = 0;
    shoppingCart.forEach(cartItem => {
        const product = productData.find(product => product.uuid === cartItem.uuid);
        if (product) {
            const subtotal = product.pricePerUnit * cartItem.quantity;
            total += subtotal;
            cartSummary.innerHTML += `<div>${product.title}: ${cartItem.quantity} x $${product.pricePerUnit}</div>`;
        }
    });
    totalAmount.innerHTML = `Monto a pagar: $${total.toFixed(2)}`;
}

// Actualizar la cantidad de productos en el `span` de items-quantity
function updateItemsQuantity() {
    const totalQuantity = shoppingCart.reduce((acc, item) => acc + item.quantity, 0);
    itemsQuantity.textContent = totalQuantity;
}

// Función de pago
async function checkout() {
    const stripe = Stripe('pk_test_51KswFlAOj1SK3jZdHziFhp0lOg9OutEUVFBOzsVJEBjJd4RS9NQ7RS196NjWtIS2Vz9NXlgvUDmJJbZ1VAZX2Rn800F9tmC5We');

    // Obtener el carrito de compras desde sessionStorage
    const cart = JSON.parse(sessionStorage.getItem("shopping_cart"));

    // Preparar los productos para la sesión de pago
    const lineItemsPromises = cart.map(async product => {

        return getProductInfo(product.uuid).then(productInfo => {
            return {
                price_data: {
                    currency: 'mxn', // O la moneda que uses
                    product_data: {
                        name: productInfo?.title, // Cambia esto por el nombre real del producto
                    },
                    unit_amount: productInfo?.pricePerUnit * 100, // Stripe espera el precio en centavos
                },
                quantity: product.quantity
            };
        });
    });
    const lineItems = await Promise.all(lineItemsPromises);


    // Enviar la solicitud al servidor para crear la sesión de checkout
    const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lineItems })  // Enviar los productos con sus cantidades y precios
    });

    const session = await response.json();

    // Redirigir al cliente a Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId: session.id });

    if (result.error) {
        alert(result.error.message);
    }

}

// Función para obtener el precio de un producto por su UUID
async function getProductInfo(uuid) {
    const response = await fetch('/api/products/'+uuid)
    const data= await response.json()
    console.log(data)
    //return data.pricePerUnit
    return data
}



// Cancelar el carrito
function cancelCart() {
    if (confirm("¿Estás seguro de que deseas cancelar el carrito?")) {
        sessionStorage.removeItem("shopping_cart");
        loadCart();
    }
}

loadCart();
