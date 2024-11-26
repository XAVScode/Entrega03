const productForm = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const productList = document.getElementById("productList");

let editingProductId = null;

// Función para cargar productos
function loadProducts() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:3000/api/products");
  xhr.setRequestHeader("x-auth", "admin"); // Añadir encabezado de autenticación
  xhr.onload = function () {
    if (xhr.status === 200) {
      const products = JSON.parse(xhr.responseText);
      renderProducts(products);
    }
  };
  xhr.send();
}

// Función para renderizar productos
function renderProducts(products) {
  productList.innerHTML = "";
  products.forEach(product => {
    productList.innerHTML += `
            <div class="col-12 mb-3">
                <div class="card">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5>${product.title}</h5>
                            <p>${product.description}</p>
                            <div>Precio: $${product.pricePerUnit}</div>
                            <div>Stock: ${product.stock}</div>
                            <div>Categoría: ${product.category}</div>
                        </div>
                        <div>
                            <img src="${product.imageURL}" alt="${product.title}" class="img-thumbnail" style="width: 100px; height: auto;">
                        </div>
                        <div>
                            <button class="btn btn-primary btn-sm" onclick="editProduct('${product.uuid}')"><i class="fa fa-edit"></i> Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.uuid}')"><i class="fa fa-trash"></i> Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  });
}

// Función para enviar el formulario (Crear o Editar)
productForm.onsubmit = function (e) {
  e.preventDefault();

  const productData = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    imageURL: document.getElementById("imageURL").value,
    unit: document.getElementById("unit").value,
    stock: parseInt(document.getElementById("stock").value),
    pricePerUnit: parseFloat(document.getElementById("pricePerUnit").value),
    category: document.getElementById("category").value
  };

  if (editingProductId) {
    updateProduct(editingProductId, productData);
  } else {
    createProduct(productData);
  }
};

// Función para crear un nuevo producto
function createProduct(productData) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "http://localhost:3000/admin/products");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("x-auth", "admin"); // Añadir encabezado de autenticación
  xhr.onload = function () {
    if (xhr.status === 201) {
      loadProducts();
      productForm.reset();
    } else {
      alert("Error al crear el producto");
    }
  };
  xhr.send(JSON.stringify(productData));
}

// Función para cargar datos en el formulario para editar
function editProduct(uuid) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `http://localhost:3000/products/${uuid}`);
  xhr.setRequestHeader("x-auth", "admin"); // Añadir encabezado de autenticación
  xhr.onload = function () {
    if (xhr.status === 200) {
      const product = JSON.parse(xhr.responseText);
      document.getElementById("title").value = product.title;
      document.getElementById("description").value = product.description;
      document.getElementById("imageURL").value = product.imageURL;
      document.getElementById("unit").value = product.unit;
      document.getElementById("stock").value = product.stock;
      document.getElementById("pricePerUnit").value = product.pricePerUnit;
      document.getElementById("category").value = product.category;

      formTitle.textContent = "Editar Producto";
      submitButton.textContent = "Guardar Cambios";
      cancelEditButton.classList.remove("d-none");
      editingProductId = uuid;
    }
  };
  xhr.send();
}

// Función para cancelar la edición
cancelEditButton.onclick = function () {
  resetForm();
};

// Función para actualizar producto
function updateProduct(uuid, productData) {
  const xhr = new XMLHttpRequest();
  xhr.open("PUT", `http://localhost:3000/admin/products/${uuid}`);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("x-auth", "admin"); // Añadir encabezado de autenticación
  xhr.onload = function () {
    if (xhr.status === 200) {
      loadProducts();
      resetForm();
    } else {
      alert("Error al actualizar el producto");
    }
  };
  xhr.send(JSON.stringify(productData));
}

// Función para eliminar producto
function deleteProduct(uuid) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  const xhr = new XMLHttpRequest();
  xhr.open("DELETE", `http://localhost:3000/admin/products/${uuid}`);
  xhr.setRequestHeader("x-auth", "admin"); // Añadir encabezado de autenticación
  xhr.onload = function () {
    if (xhr.status === 200) {
      loadProducts();
      const array = JSON.parse(sessionStorage.getItem("shopping_cart"));
      const newArray = array.filter(item => item.uuid !== uuid);
      sessionStorage.setItem("shopping_cart", JSON.stringify(newArray));
    } else {
      alert("Error al eliminar el producto");
    }
  };
  xhr.send();
}

// Función para restablecer el formulario
function resetForm() {
  productForm.reset();
  formTitle.textContent = "Crear Nuevo Producto";
  submitButton.textContent = "Crear Producto";
  cancelEditButton.classList.add("d-none");
  editingProductId = null;
}

// Cargar productos al iniciar
loadProducts();
