<script setup lang="ts">
import { ref } from 'vue'

const WS_URL = 'ws://172.20.10.4:3001'  
const { isConnected, data, lastUpdate } = useWebSocket(WS_URL)

</script>

<template>
<div>
    <div>
        <h1>WebSocket Configurator</h1>
        <div>
            <span>
                {{ isConnected ? 'Connecté' : 'Déconnecté' }}
            </span>
        </div>
    </div>

    <div>
        <div>
            <p>Utilisation de l'avion : {{ data.plane }}</p>
            <p>Moyen de transport choisit : {{ data.transport }}</p>
            <p>Utilisation prompt / IA : {{ data.promptIA }}</p>
            <p>Consomation de viande : {{ data.meat }}</p>
            <p>Consommation de produits : {{ data.products }}</p>
            <p>Utilisation du téléphone : {{ data.phone }}</p>
            <p>Consommation de vêtements : {{ data.clothes }}</p>

        </div>
    </div>

</div>
</template>
