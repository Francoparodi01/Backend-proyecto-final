const fs = require("fs")
const { v4 : uuidv4 } = require("uuid");


class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = this.loadProducts();
    }
    
        addProduct(productData) {
            // Validamos campos obligatorios
            if (!productData.id || !productData.title || !productData.description || !productData.price || !productData.code || !productData.stock || !productData.category || !productData.thumbnails) {
                return ;
            }
    
            // Generamos un nuevo ID único
            const newId = uuidv4();
    
            // Creamos un nuevo producto con los datos proporcionados y valores predeterminados
            const newProduct = {
                id: newId,
                title: productData.title,
                description: productData.description || '',
                price: productData.price,
                code: productData.code,
                stock: productData.stock || 0,
                status: true, // Valor predeterminado
                category: productData.category || '',
                thumbnails: productData.thumbnails || []
            };
             
            // Agregamos el nuevo producto al array de productos
            this.products.push(newProduct);
            return newProduct;
        }
    loadProducts() {
        try {
            const data = fs.readFileSync(this.path, 'utf8');
            return JSON.parse(data) || [];
        } catch (error) {
            console.error(`Error leyendo el archivo: ${error.message}`);
            return [];
        }
    }

    saveProducts() {
        try {
            const data = JSON.stringify(this.products, null, 2);
            fs.writeFileSync(this.path, data);
            console.log('Se guardaron tus productos.');
        } catch (error) {
            console.error(`Error escribiendo archivo: ${error.message}`);
        }
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find(product => product.id == id);
        if (product) {
            return product;
        } else {
            console.log(`El producto con el ID número ${id}. No fue encontrado.`);
        }
    }

    updateProduct(id, updatedFields) {
        const productId = parseInt(id, 10); // Convertir ID a número
    
        const productIndex = this.products.findIndex(product => product.id === productId);
    
        if (productIndex !== -1) {
            // Sobrescribe todos los campos con los proporcionados en updatedFields
            this.products[productIndex] = {
                id: this.products[productIndex].id,
                ...updatedFields,
            };
    
            this.saveProducts();
            console.log(`El producto con el número de ID ${id} se actualizó`);
        } else {
            console.log(`El producto con el número de ID ${id} no fue encontrado`);
        }
    }
    
    
    deleteProduct(id) {
        try {
            const productIndex = this.products.findIndex(product => product.id == id);

            if (productIndex !== -1) {
                const deletedProduct = this.products.splice(productIndex, 1)[0];
                this.saveProducts();
                console.log(`El producto con el número de ID ${id} fue eliminado.`);
                return deletedProduct;
            } else {
                console.log(`El producto con el número de ID ${id} no fue encontrado.`);
                throw new Error(`El producto con el número de ID ${id} no fue encontrado.`);
            }
        } catch (error) {
            console.error(`Error al eliminar producto: ${error.message}`);
            throw error; // Relanza la excepción para que pueda manejarse adecuadamente fuera de la clase
        }
    }
}

module.exports = ProductManager;
