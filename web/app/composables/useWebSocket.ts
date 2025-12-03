import { ref, onMounted, onUnmounted } from 'vue'

interface ControlData {
    plane?: number
    transport?: number
    promptIA?: number
    meat? : number
    products?: number
    phone?: number
    clothes?: number
}

export const useWebSocket = (url: string) => {
    const ws = ref<WebSocket | null>(null)
    const isConnected = ref(false)
    const data = ref<ControlData>({
        plane: 0,
        transport: 0,
        promptIA: 0,
        meat: 0,
        products: 0,
        phone: 0,
        clothes: 0
    })
    const lastUpdate = ref('')

    const connect = () => {
        try {
            console.log('Tentative de connexion à:', url)
            
            ws.value = new WebSocket(url)

            ws.value.onopen = () => {
                console.log('Connecté au serveur WebSocket')
                isConnected.value = true
            }

            ws.value.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    console.log('Reçu:', message)

                    if (message.type === 'message' && message.data?.type === 'control') {
                        data.value.plane = message.data.plane
                        data.value.transport = message.data.transport
                        data.value.promptIA = message.data.promptIA
                        data.value.meat = message.data.meat
                        data.value.products = message.data.products
                        data.value.phone = message.data.phone
                        data.value.clothes = message.data.clothes
                        lastUpdate.value = new Date().toLocaleTimeString('fr-FR')
                        console.log('Valeurs mises à jour:', data.value)
                    }
                } catch (error) {
                    console.error('Erreur:', error)
                }
            }


            ws.value.onerror = (error) => {
                console.error('Erreur WebSocket:', error)
            }

            ws.value.onclose = () => {
                console.log('Déconnecté du serveur')
                isConnected.value = false

                setTimeout(() => {
                    console.log('Tentative de reconnexion...')
                    connect()
                }, 3000)
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error)
        }
    }

    const disconnect = () => {
        if (ws.value) {
            ws.value.close()
            ws.value = null
        }
    }

    onMounted(() => {
        connect()
    })

    onUnmounted(() => {
        disconnect()
    })

    return {
        isConnected,
        data,
        lastUpdate,
        connect,
        disconnect
    }
}