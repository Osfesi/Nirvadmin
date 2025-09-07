// Importa la librería de Express
const express = require('express');
const app = express();

// Middleware para procesar cuerpos de solicitud JSON
app.use(express.json());

// Define la ruta principal (puedes personalizarla)
app.get('/', (req, res) => {
  res.send('El servidor está funcionando. Puedes acceder a las rutas de la API.');
});

// Define la ruta para agregar un usuario
app.post('/api/add-user', async (req, res) => {
  try {
    // Aquí iría el código para procesar la solicitud
    // Por ejemplo, guardar los datos en una base de datos
    const userData = req.body;
    console.log('Datos de usuario recibidos:', userData);

    // Envía una respuesta al cliente
    res.status(200).json({ message: 'Usuario agregado correctamente', user: userData });
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Define el puerto del servidor
const PORT = process.env.PORT || 3000;

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});