const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();

app.use(express.json());

const uri = process.env.MONGODB_URI;

let db;

// Conexión a la base de datos
async function connectToDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        db = client.db("admin_db");
        console.log("Conectado a la base de datos de MongoDB.");
    } catch (e) {
        console.error("Error al conectar a la base de datos:", e.message);
        throw e; // Lanza el error para detener el proceso de Vercel
    }
}

// Iniciar la aplicación después de conectar a la DB
async function startApp() {
    try {
        await connectToDatabase();

        // Ruta para añadir un nuevo usuario
        app.post('/add-user', async (req, res) => {
            const { username, password, link } = req.body;

            if (!username || !password || !link) {
                return res.status(400).json({ success: false, message: 'Faltan campos.' });
            }

            try {
                const usersCollection = db.collection('users');
                const existingUser = await usersCollection.findOne({ username });
                
                if (existingUser) {
                    return res.status(409).json({ success: false, message: 'Este usuario ya existe.' });
                }

                const result = await usersCollection.insertOne({ username, password, link });
                res.json({ success: true, message: `Usuario '${username}' añadido con éxito.` });

            } catch (e) {
                console.error("Error al añadir usuario:", e);
                res.status(500).json({ success: false, message: 'Error interno del servidor.' });
            }
        });

        // Servir el archivo HTML
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });

        // Este `app.listen` es solo para desarrollo local.
        // Vercel lo ignorará.
        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Servidor de administrador escuchando en el puerto ${PORT}`);
        });

    } catch (e) {
        console.error("No se pudo iniciar la aplicación:", e.message);
    }
}

startApp();

module.exports = app;