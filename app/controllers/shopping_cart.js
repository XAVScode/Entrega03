class ShoppingCartException {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

class ProductProxy {

    constructor(productUUID, quantity) {
        this.productUUID = productUUID;
        this.quantity = quantity;
    }
    set setProductUUID(productUUID) {
        if (typeof productUUID != "string" || !productUUID)
            throw new ShoppingCartException("ProductUUID is not valid");
        this.productUUID = productUUID;
    }

    set setQuantity(quantity) {
        if (typeof quantity != "number")
            throw new ShoppingCartException("quantity must be a number");
        if (quantity < 0)
            throw new ShoppingCartException("quantity can't be negative");
        this.quantity = quantity;
    }

    get getProductUUID() {
        return this.productUUID;
    }

    get getCuantity() {
        return this.quantity;
    }
}

class ShoppingCart {
    products = []
    constructor(products) {
        this.proxies = [];
        this.products = products;
    }
    set setProxies(data) {
        throw new ShoppingCartException("Proxies can't be manipulated");
    }
    get getProxies() {
        return this.proxies;
    }

    get getProducts() {
        return this.products;
    }

    addItem(productUUID, amount) {
        if (amount < 1)
            throw new ShoppingCartException("Amount can't be negative or 0");
        const index = this.proxies.findIndex(element => element.productUUID === productUUID);
        if (index !== -1) {
            this.proxies[index].quantity += amount;
        } else {
            this.proxies.push(new ProductProxy(productUUID, amount));
        }
    }

    updateItem(productUUID, newAmount) {
        if (newAmount < 0)
            throw new ShoppingCartException("The amount can't be negative");
        else if (newAmount === 0) {
            this.removeItem(productUUID);
        } else {
            let index = this.proxies.findIndex(element => element.productUUID === productUUID);
            this.proxies[index].quantity = newAmount;
        }
    }

    removeItem(productUUID) {
        let proxyIndex = this.proxies.findIndex(element => element.productUUID === productUUID);
        let productIndex = this.products.findIndex(element => element.uuid === productUUID);
        if (proxyIndex < 0 || productIndex < 0)
            throw new ShoppingCartException("The UUID is not valid");
        this.products.splice(productIndex, 1);
        this.proxies.splice(productIndex, 1);
    }

    calculateTotal() {
        let total = 0;
        for (let i = 0; i < this.proxies.length; i++) {
            let n = this.proxies[i].quantity;
            let product = this.products.find(element => element.uuid === this.proxies[i].productUUID)
            total += n * product.pricePerUnit;
        }
        return total;
    }
}

module.exports = ShoppingCart