const express = require("express");
const router = express.Router();
const dataHandler = require("../controllers/data_handler");


router.get("/", (req, res) => {
    if (Object.keys(req.query).length == 0)
        return res.status(200).send(dataHandler.getProducts());

    const category = req.query.category ? req.query.category + ":" : "";
    const title = req.query.title ? " " + req.query.title : "";
    const value = dataHandler.findProduct(category + title);

    value.length == 0 ? res.status(404).send("Product not found") : res.json(value);
});

router.get("/:id", (req, res) => {
    const product = dataHandler.getProductById(req.params.id);
    Object.entries(product) == 0 ? res.status(404).send("Product not found") : res.status(200).send(product)
});

router.post("/cart", (req, res) => {
    if (!Array.isArray(req.body))
        return res.status(400).send("Body is not an array");

    const body = req.body;
    const array = [];

    for (const element of body) {
        const uuid = element.uuid;
        const product = dataHandler.getProductById(uuid);
        if (Object.entries(product) == 0)
            return res.status(404).send("Product with UUID: " + uuid + " not found");

        array.push(product)
    }
    res.status(200).json(array)
});



module.exports = router;