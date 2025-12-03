const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const clients = new Set();

console.log('🔌 Initialisation du serveur WebSocket...');

wss.on('connection', (ws) => {
console.log('Nouveau client connecté');
console.log(`Clients connectés: ${clients.size + 1}`);

clients.add(ws);

ws.send(JSON.stringify({
    type: 'connection',
    message: 'connecté au serveur',
    clientsCount: clients.size,
    timestamp: new Date().toISOString()
}));


ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        console.log('📨 Message reçu:', message);

        let sentCount = 0;
        clients.forEach((client) => {

            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'message',
                    data: message,
                    timestamp: new Date().toISOString()
                }));
                sentCount++;
            }
        });

        console.log(`Message envoyé à ${sentCount} client(s)`);

    } catch (error) {
        console.error('Erreur lors du parsing du message:', error);
    }
});

ws.on('close', () => {
    clients.delete(ws);
    console.log('Client déconnecté');
    console.log(`Clients restants: ${clients.size}`);
});

ws.on('error', (error) => {
        console.error('Erreur WebSocket:', error);
        clients.delete(ws);
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Serveur WebSocket opérationnel',
        clients: clients.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
console.log('');
console.log('🎉 ========================================');
console.log('🎉 SERVEUR DÉMARRÉ AVEC SUCCÈS !');
console.log('🎉 ========================================');
console.log('');
console.log(`📍 Serveur HTTP    : http://localhost:${PORT}`);
console.log(`🔌 WebSocket       : ws://localhost:${PORT}`);
console.log(`🏥 Health Check    : http://localhost:${PORT}/health`);
console.log('');
console.log('⚡ En attente de connexions...');
console.log('');
});