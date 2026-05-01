const express = require('express');
const { WebpayPlus } = require('transbank-sdk');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que tu HTML se comunique con el servidor

// 1. INICIAR PAGO
app.post('/create-transaction', async (req, res) => {
    const { buyOrder, sessionId, amount, returnUrl } = req.body;

    try {
        // Usamos el SDK en modo Integración (Pruebas) por defecto
        const tx = new WebpayPlus.Transaction();
        const response = await tx.create(buyOrder, sessionId, amount, returnUrl);
        
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la transacción' });
    }
});

// 2. CONFIRMAR PAGO (Al volver de Webpay)
app.get('/commit-transaction', async (req, res) => {
    const token = req.query.token_ws;

    try {
        const tx = new WebpayPlus.Transaction();
        const response = await tx.commit(token);
        
        // Aquí podrías guardar en tu base de datos que el pago fue exitoso
        res.send(`<h1>Pago Exitoso</h1><p>Orden: ${response.buy_order}</p>`);
    } catch (error) {
        res.status(500).send('Error al confirmar el pago');
    }
});

app.listen(4000, () => {
    console.log("Servidor corriendo en http://localhost:4000");
});