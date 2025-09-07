const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

// Declarar 'app' al inicio para que sea accesible
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON
app.use(express.json());

// URI de conexión a MongoDB
const uri = process.env.MONGODB_URI;

let db;
const client = new MongoClient(uri);

// Definir las rutas AQUÍ, antes de las funciones
// Ruta para añadir un nuevo usuario
app.post('/api/add-user', async (req, res) => {
    const { username, password, link } = req.body;

    if (!username || !password || !link) {
        return res.status(400).json({ success: false, message: 'Faltan campos.' });
    }

    try {
        const usersCollection = db.collection('users');
        
        // Usamos updateOne con upsert: true para una operación atómica
        const result = await usersCollection.updateOne(
            { username: username },
            { $set: { username, password, link } },
            { upsert: true }
        );

        if (result.acknowledged) {
            res.json({ success: true, message: `Usuario '${username}' añadido/actualizado con éxito.` });
        } else {
            res.status(500).json({ success: false, message: 'No se pudo añadir o actualizar el usuario.' });
        }

    } catch (e) {
        console.error("Error al añadir o actualizar usuario:", e);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Ruta para el inicio de sesión
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const adminUser = "1955";
    const adminPass = "Nirvauto00";

    if (username === adminUser && password === adminPass) {
        return res.json({ success: true, isAdmin: true });
    }

    try {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ username, password });
        
        if (user) {
            const link = user.link;
            return res.json({ success: true, link });
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }

    } catch (e) {
        console.error("Error al iniciar sesión:", e);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ahora sí, la función para conectar a la DB y el servidor
async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db("admin_db");
        console.log("Conectado a la base de datos de MongoDB.");
    } catch (e) {
        console.error("Error al conectar a la base de datos:", e.message);
        process.exit(1);
    }
}

async function startApp() {
    await connectToDatabase();
    
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}

// Iniciar la aplicación
startApp();

// Exportar la app Express para Vercel
module.exports = app;