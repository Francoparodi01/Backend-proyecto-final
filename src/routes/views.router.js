const express = require('express');
const router = express.Router();
const ProductManager = require('../controllers/productManager');
const productManager = new ProductManager("./src/models/productos.json");

//Agregamos la ruta / que muestre los productos .getProducts()
router.get('/', async (req, res) => {
    try {
        const allProducts = await productManager.getProducts();
        res.render('home', { products: allProducts });
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
        res.status(500).send('Error interno del servidor');
    }
});

//Renderizamos la ruta realTimeProducts
router.get('/realTimeProducts', async (req,res) => {
    try {
        res.render("realTimeProducts");
    } catch(error) {
        res.status(500).send({
            error: "Error interno del servidor"
        });
    }
});

module.exports = router;
