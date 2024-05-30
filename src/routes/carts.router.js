const express = require("express");
const router = express.Router();
const fs = require('fs');

const CartManager = require("../controllers/cartManager.js");
const cartManager = new CartManager("./src/models/carrito.json");

const ProductManager = require('../controllers/productManager.js');
const productManager = new ProductManager("./src/models/productos.json");

// Rutas

// http://localhost:8080/api/carts/

// Obtenemos todos los carritos
router.post("/", async (req, res) => {
    try {
        const response = await cartManager.newCart();
        res.json(response);
    } catch (error) {
        console.log("Error, no se pudo crear carrito", error);
        res.status(500).json({ error: "Error al intentar crear el carrito" });
    }
});

// Agregamos producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    const { quantity } = req.body;

    const result = await cartManager.addProductToCart(cartId, productId, quantity);
    try {
        res.json(result);
        console.log("Producto agregado")
    } catch (error) {
        res.send('Error al intentar guardar producto en el carrito');
    }
});

// Obtenemos un carrito por su ID
router.get("/:cid", async (req, res) => {
    const { cid } = req.params;
    try {
        const response = await cartManager.getCartProducts(cid);
        res.json(response);
    } catch (error) {
        res.status(500).send('Error al intentar enviar los productos al carrito');
    }
});

module.exports = router;
