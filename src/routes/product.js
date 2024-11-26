const express = require("express");
const productSchema = require("../models/product");
const dataHandler = require("../../app/controllers/data_handler");

const router = express.Router();

// Crear un nuevo producto
router.post("/products", (req, res) => {
  const product = new productSchema(req.body);
  product
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener todos los productos
router.get("/products", (req, res) => {
  productSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener un producto por ID
router.get("/products/:uuid", (req, res) => {
  const { uuid } = req.params;  // Cambié 'id' por 'uuid'

  // Asegúrate de que en tu esquema de producto (productSchema) el campo de búsqueda sea un 'uuid'
  productSchema
    .findOne({ uuid: uuid })  // Usamos 'findOne' porque ahora buscamos por un campo específico
    .then((data) => {
      if (!data) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});


// Eliminar un producto
router.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  productSchema
    .remove({ _id: id })
    .then((data) => res.json({ message: "Producto eliminado", data }))
    .catch((error) => res.json({ message: error }));
});

// Actualizar un producto
router.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { uuid, title, description, imageURL, unit, stock, pricePerUnit, category, images } = req.body;

  productSchema
    .updateOne(
      { _id: id },
      { $set: { uuid, title, description, imageURL, unit, stock, pricePerUnit, category, images } }
    )
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

router.post("/cart", async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).send("Body is not an array");
  }

  const body = req.body;
  const array = [];

  for (const element of body) {
    const uuid = element.uuid;
    console.log("Buscando producto con UUID:", uuid); 

    try {
      const product = await productSchema.findOne({ uuid: uuid });

      if (!product) {
        console.log(`Producto con UUID: ${uuid} no encontrado`); 
        return res.status(404).json({ message: "Producto no encontrado con UUID: " + uuid });
      }

      array.push(product);
    } catch (error) {
      console.log("Error al buscar el producto:", error.message);  
      return res.status(500).json({ message: error.message });
    }
  }
  res.status(200).json(array);
});


module.exports = router;
