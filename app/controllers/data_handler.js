const Product = require('../../src/models/product'); // Importar el modelo de Mongoose

// Obtener todos los productos
async function getProducts() {
  try {
    const productsArray = await Product.find(); // Usamos el método find() de Mongoose
    return productsArray;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
}

// Obtener un producto por su UUID
async function getProductById(uuid) {
  console.log("uuid:", uuid)

  try {
    const products = await Product.find(); 
    console.log(products); 
    const product = await Product.findOne({ uuid: uuid }); // Usamos findOne() para buscar por UUID
    console.log(product)
    return product || {}; // Retorna el producto o un objeto vacío si no se encuentra
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    return {};
  }
}

// Crear un nuevo producto
async function createProduct(product) {
  try {
    let newProduct;
    if (typeof product === 'string') {
      // Si es un string JSON, lo parseamos primero
      const productData = JSON.parse(product);
      newProduct = new Product(productData);
    } else if (typeof product === 'object') {
      // Si es un objeto, directamente lo usamos
      newProduct = new Product(product);
    }

    await newProduct.save(); // Guardamos el nuevo producto en la base de datos
  } catch (error) {
    console.error('Error al crear el producto:', error);
  }
}

// Actualizar un producto por su UUID
async function updateProduct(uuid, updatedProduct) {
  try {
    const result = await Product.findOneAndUpdate({ uuid: uuid }, updatedProduct, { new: true }); // findOneAndUpdate retorna el producto actualizado
    return result ? true : false; // Si se encontró y actualizó, retorna true
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    return false;
  }
}

// Eliminar un producto por su UUID
async function deleteProduct(uuid) {
  try {
    const result = await Product.deleteOne({ uuid: uuid }); // deleteOne elimina el producto
    return result.deletedCount > 0; // Si se eliminó al menos uno, retorna true
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    return false;
  }
}

// Buscar productos por una consulta específica
async function findProduct(query) {
  try {
    if (!query.includes(':')) {
      return await Product.find({ title: query.trim() }); // Si no tiene ":", busca por título
    }

    const queryParts = query.split(':');
    const category = queryParts[0].trim();
    const title = queryParts[1].trim();

    if (category && title) {
      return await Product.find({ category: category, title: title }); // Busca por categoría y título
    } else if (category) {
      return await Product.find({ category: category }); // Busca solo por categoría
    } else {
      return []; // Si no hay categoría ni título, retorna un array vacío
    }
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
}

exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.findProduct = findProduct;
