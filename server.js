// Ruta para añadir un nuevo usuario (o reemplazar uno existente)
app.post('/api/add-user', async (req, res) => {
    const { username, password, link } = req.body;

    if (!username || !password || !link) {
        return res.status(400).json({ success: false, message: 'Faltan campos.' });
    }

    try {
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ username });
        
        if (existingUser) {
            // Si el usuario ya existe, lo borramos
            await usersCollection.deleteOne({ username });
            console.log(`Usuario '${username}' antiguo borrado.`);
        }

        // Insertamos el nuevo usuario
        const result = await usersCollection.insertOne({ username, password, link });
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