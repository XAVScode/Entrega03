const express = require("express");
const router = express.Router();
const dataHandler = require('../controllers/data_handler');

router.post("/", (req, res) => {
    const body = req.body
    try {
        dataHandler.createProduct(body);
        res.status(201).send("Product created :)");
    }
    catch (err) {
        const keys = ["title", "description", "imageURL", "unit", "stock", "pricePerUnit", "category"];
        const notFound = [];
        for (const key of keys) {
            if (!body.hasOwnProperty(key)) {
                notFound.push(key);
            }
        }
        res.status(400).send(err.errorMessage + "\n" + "The following atributes are missing: " + notFound);
    }
});

router.put("/:id", (req, res) => {
    const uuid = req.params.id;
    const body = req.body;

    if ("uuid" in body)
        throw new Error('uuids are auto-generated');
    if (dataHandler.updateProduct(uuid, body))
        return res.status(200).send('Product has been updated :)');
    return res.status(400).send("Product not found :(");

});

router.delete("/:id", (req, res) => {
    const uuid = req.params.id;
    if (dataHandler.deleteProduct(uuid))
        return res.status(200).send('The product with UUID: ' + uuid + ' has been deleted >:)');
    return res.status(400).send("Product not found");

});
module.exports = router; 