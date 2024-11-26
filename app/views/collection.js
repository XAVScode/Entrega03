const ITEMS_PER_PAGE = 4;
let products = [];
let currentPage = 0;
let selectedProductId = null;

const quantityElement = document.getElementById("items-quantity");
quantityElement.innerText = JSON.parse(sessionStorage.getItem("shopping_cart"))?.reduce((acc, item) => acc + item.quantity, 0) || 0;

const prevButton = document.getElementById("nav_previous");
const nextButton = document.getElementById("nav_next");
const pageButtons = [
    document.getElementById("page_1"),
    document.getElementById("page_2"),
    document.getElementById("page_3")
];
const productsDom = document.getElementById("products_dom");

prevButton.addEventListener("click", () => navigatePage(false));
nextButton.addEventListener("click", () => navigatePage(true));
pageButtons.forEach((button, index) => {
    button.addEventListener("click", () => goToPage(index));
});


const loadProducts = () => {
    return new Promise((resolve, reject) => {
        console.log("cargando productos");
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:3000/api/products");
        xhr.setRequestHeader("x-auth", "admin"); 

        xhr.onload = function () {
            if (xhr.status === 200) {
                products = JSON.parse(xhr.responseText);
                renderProducts(products);
                console.log("productos:", products);
                resolve(products);  
            } else {
                reject(new Error('No se pudieron cargar los productos'));
            }
        };

        xhr.onerror = function () {
            reject(new Error('Error en la solicitud'));
        };

        xhr.send();
    });
};






function goToPage(page) {
    if (page === currentPage) return;
    updatePageIndicator(page);
    currentPage = page;
    renderProducts();
}

function navigatePage(isNext) {
    const newPage = currentPage + (isNext ? 1 : -1);
    if (newPage >= 0 && newPage < pageButtons.length) {
        goToPage(newPage);
    }
}

function updatePageIndicator(newPage) {
    pageButtons[currentPage].classList.remove("active");
    pageButtons[newPage].classList.add("active");
}

function renderProducts() {
    const start = currentPage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageProducts = products.slice(start, end);

    productsDom.innerHTML = pageProducts.map(product => `
<div class="col-lg-3 col-md-4 col-sm-6 mb-4">
    <div onclick="location.href='product?id=${product.uuid}'" href="#" class="product-card d-flex flex-column align-items-start text-decoration-none w-100 h-100 position-relative" style="cursor: pointer;">
        
        <!-- Imagen del producto con mayor tamaño -->
        <img class="product-image w-100 mb-2" src="${product.imageURL}" alt="${product.title}" style="height: 300px; object-fit: contain;">
                            
        <!-- Nombre y precio con mayor tamaño -->
        <span class="product-name fw-bold fs-5">${product.title}</span> <!-- Aumenté la clase fs-6 a fs-5 -->
        <span class="product-price fs-6 text-muted">$${product.pricePerUnit}</span> <!-- Aumenté la clase fs-7 a fs-6 -->
        
        <!-- Texto que aparece al hacer hover, con mayor tamaño -->
        <span class="product-hover-text position-absolute top-50 start-50 translate-middle text-white fs-5 opacity-0">Más información</span> <!-- Aumenté fs-6 a fs-5 -->
    </div>
</div>

    `).join("");
}

function searchProduct(value) {
    console.log("bscando:", value);

    const searchResults = products.filter(product => 
        product.title.toLowerCase().includes(value.toLowerCase()) || 
        product.description.toLowerCase().includes(value.toLowerCase())
    );

    console.log("productos encontrados:", searchResults);
    
    return searchResults;
}

function selectProduct(uuid) {
    selectedProductId = uuid;
}

function addItemToCart() {
    const cantidadInput = document.querySelector("#producto_cantidad");
    const cantidad = parseInt(cantidadInput.value);

    if (isNaN(cantidad) || cantidad < 1) {
        alert("Por favor, ingrese una cantidad válida mayor a 0.");
        cantidadInput.value = 1;
        return;
    }

    let cart = JSON.parse(sessionStorage.getItem("shopping_cart")) || [];
    const existingProduct = cart.find(item => item.uuid === selectedProductId);

    if (existingProduct) {
        existingProduct.quantity += cantidad;
        quantityElement.innerText = parseInt(quantityElement.innerText) + cantidad;
    } else {
        cart.push({ uuid: selectedProductId, quantity: cantidad });
        quantityElement.innerText = parseInt(quantityElement.innerText) + cantidad;
    }

    sessionStorage.setItem("shopping_cart", JSON.stringify(cart));
    console.log(cart)
    cantidadInput.value = 1;
}


function getUrlParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category'); 
    console.log(category);
    return category
}

function setTitle(){
    document.getElementById("category_title").innerText=getUrlParameter();
}

function getProductsByCategory() {
    const category = getUrlParameter();  
    if (category) {
        const container = document.getElementById("main-container");
        container.style.width="60%"  
        const filteredProducts = products.filter(product => product.category === category);  
        console.log(filteredProducts);
        container.innerHTML = "";
        filteredProducts.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product");

            productDiv.classList.add("product-searched");

            //productDiv.setAttribute("data-bs-target", "#modal_product");
            //productDiv.setAttribute("data-bs-toggle", "modal");

            productDiv.onclick = () => {
              //selectProduct(product.uuid);
              window.open("product?id="+product.uuid,"_self")
            };



            const productImage = document.createElement("img");
            productImage.src = product.imageURL;
            productImage.alt = product.title;
            productImage.classList.add("product-image");

            const productTitle = document.createElement("h3");
            productTitle.textContent = product.title;

            const productDescription = document.createElement("p");
            productDescription.textContent = product.description;

            const productPrice = document.createElement("p");
            productPrice.textContent = `$${product.pricePerUnit.toFixed(2)}`;

            const productStock = document.createElement("p");
            productStock.textContent = `Stock: ${product.stock}`;

            productDiv.appendChild(productImage);
            productDiv.appendChild(productTitle);
            productDiv.appendChild(productDescription);
            productDiv.appendChild(productPrice);
            productDiv.appendChild(productStock);

            container.appendChild(productDiv);
        });

        return filteredProducts; 
    }

    return [];  
}


loadProducts().then(() => {
    setTitle();
    getProductsByCategory();  
}).catch((error) => {
    console.error("Error al cargar productos:", error);
});
