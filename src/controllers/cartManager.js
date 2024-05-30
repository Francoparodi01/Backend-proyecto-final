const fs = require("fs") 
const {v4 : uuidv4} = require ("uuid")
//se usa uuidv4 para generar ids automáticos! 

class CartManager{

    constructor(){
        this.path = "./src/models/carrito.json";
        this.carts = [];
    }
    //Traemos todos lo carritos leyendo el carrito.json
    getCarts = () => {
        try {
            const response = fs.readFileSync(this.path, 'utf8');
            const responseJson = JSON.parse(response);
            return responseJson;
        } catch (error) {
            console.error(`Error leyendo el archivo: ${error.message}`);
            return [];
        }
    }

    getCartById(id) {
        const cart = this.carts.find(cart => cart.id === id);
        if (cart) {
            return cart;
        } else {
            throw { error: "Carrito no encontrado", cartId: id };
        }
    }
    
    
    //Función que trae los productos por id del carrito
    getCartProducts = async (id) => {
        //asincrónicamente llamamos la funcion getcarts utilizando la prop. this para entrar en la clase CartManager
        const carts = await this.getCarts();
        //Método find => Si por cada carrito de carts existe un carrito con ese id y que también coincida con el id pasado por parámetros, lo guardamos 
        // en la variable "cart" y lo pasamos al if
        const cart = carts.find(cart =>cart.id == id);

        //Donde si cart existe, retornamos productos, y sino clg
        if (cart) {
            return cart.products;
        } else {
            throw new Error("Carrito no encontrado");
        }
        
    }

    //Función que crea un nuevo carrito 
    async newCart() {
        try {
            const id = uuidv4();
            const newCart = { id, products: [] };
    
            this.carts = await this.getCarts();
            this.carts.push(newCart);
    
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2));
            return newCart;
        } catch (error) {
            console.error(`Error al crear un nuevo carrito: ${error.message}`);
            throw new Error(`Error al crear un nuevo carrito: ${error.message}`);
        }
    }
    

    addProductToCart = async (cartId, productId, quantity, title) => {
        try {
            // Obtenemos todos los carritos
            this.carts = await this.getCarts();
    
            // Mediante la función findIndex, buscamos el índice del id pasado por params
            const index = this.carts.findIndex(cart => cart.id === cartId);
    
            // Si se encuentra el carrito
            if (index !== -1) {
                // Obtiene la lista de productos del carrito
                const cartProducts = this.carts[index].products;
    
                // Busca el índice del producto en el carrito si existe
                const existingProductIndex = cartProducts.findIndex(product => product.title === productId);
    
                // Si el producto ya existe, incrementa la cantidad
                if (existingProductIndex !== -1) {
                    cartProducts[existingProductIndex].quantity = (cartProducts[existingProductIndex].quantity || 0) + quantity;
                } else {
                    // Si el producto no existe, agrégalo al carrito con la cantidad especificada
                    cartProducts.push({ id: productId, quantity: quantity });
                }
    
                // Actualiza la lista de productos en el carrito
                this.carts[index].products = cartProducts;
    
                // Escribe los cambios en el archivo JSON
                await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf-8');
            } else {
                // Error si no se encuentra el carrito
                throw new Error('Carrito no encontrado');
            }
        } catch (error) {
            console.error(`Error al agregar producto al carrito: ${error.message}`);
            throw error;
        }
    }
}    

module.exports = CartManager