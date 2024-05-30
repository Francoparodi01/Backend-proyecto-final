const express = require('express');
const router = express.Router();
const fs = require('fs/promises')

const ProductManager = require('../controllers/productManager.js');
const productManager = new ProductManager("./src/models/productos.json");

const CartManager = require("../controllers/cartManager.js");
const cartManager = new CartManager("./src/models/carrito.json");

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        let limit = req.query.limit
        let listedProducts;

        if (!isNaN(limit)) {
            listedProducts = products.slice(0, limit);
        } else {
            listedProducts = products;
        }

        res.send({ listedProducts });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid
        const product = await productManager.getProductById(productId);

        if (product) {
            res.send(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

router.post('/', async (req, res) => {
    try {
        // Obtener los datos del nuevo producto desde el cuerpo de la solicitud
        const productData = req.body;

        // Agregar el nuevo producto utilizando el método addProduct de tu ProductManager
        const newProduct = productManager.addProduct(productData);

        if (!newProduct) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para agregar el producto' });
        }

        // Convertir el array de productos a formato JSON
        const productsJson = JSON.stringify(productManager.products, null, 2);

        // Obtener la ruta del archivo desde la instancia de ProductManager
        const filePath = productManager.path;

        // Verificar si filePath está definido y es una cadena
        if (typeof filePath !== 'string') {
            throw new Error('La propiedad filePath no está definida o no es una cadena.');
        }

        // Escribir los productos actualizados de vuelta al archivo
        await fs.writeFile(filePath, productsJson, 'utf-8');

        res.json({ message: 'Producto agregado con éxito', newProduct });
    } catch (error) {
        console.error('Error al agregar producto', error.message);
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

router.put('/editProduct/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const { title, description, price, thumbnail, code, stock } = req.body;

        const filePath = productManager.path;

        const currentContent = await fs.readFile(filePath, 'utf-8');
        const products = JSON.parse(currentContent);

        // Validamos si el producto con el ID proporcionado existe
        const productIndex = products.findIndex(product => product.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado', productId });
        }

        products[productIndex] = {
            ...products[productIndex],
            title,
            description,
            price,
            thumbnail,
            code,
            stock
        };

        const updatedContent = JSON.stringify(products, null, 2);

        await fs.writeFile(filePath, updatedContent, 'utf-8');

        res.json({ message: 'Producto actualizado con éxito', updatedProduct: products[productIndex] });
    } catch (error) {
        console.error('Error al editar producto:', error.message);
        res.status(500).json({ error: 'Error al editar producto' });
    }
});


router.delete('/:pid', async (req, res) => {
    const { pid } = req.params;

    try {
        // Verificamos si el producto con el ID proporcionado existe
        const existingProduct = productManager.getProductById(pid);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Producto no encontrado', productId: pid });
        }

        // Eliminamos el producto
        await productManager.deleteProduct(pid);

        res.send('Producto eliminado correctamente');
    } catch (error) {
        console.error('Error al intentar eliminar el producto:', error.message);
        res.status(500).send('Error al intentar eliminar el producto');
    }
});


module.exports = router;
