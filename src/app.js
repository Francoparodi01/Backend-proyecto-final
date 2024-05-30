const express = require('express');
const exphbs = require("express-handlebars");

const socket = require("socket.io")

const viewsRouter = require("./routes/views.router.js");
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");

const ProductManager = require("./controllers/productManager.js");
const productManager = new ProductManager("./src/models/productos.json");

const app = express();
const port = 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

// express-handlebars structure
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Routes
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);



const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Coneccion con socket.io

const io = socket(server);

io.on('connection', async (socket) => {
    console.log('Un cliente se conectó');

    socket.emit("productos", await productManager.getProducts());    

    socket.on("deleteProduct", async (id) => {
        await productManager.deleteProduct(id);
        //Enviamos el array de productos actualizado a todos los productos:
        io.sockets.emit("productos", await productManager.getProducts());
    });

    socket.on("addProduct", async (producto) => {
        try {
            await productManager.addProduct(producto);
            //Enviamos el array de productos actualizado a todos los productos:
            io.sockets.emit("productos", await productManager.getProducts());
        } catch (error) {
            console.error('Error agregando producto:', error);
        }
    });
});
