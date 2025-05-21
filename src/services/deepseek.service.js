import { config } from '../config';

class DeepSeekService {
    constructor() {
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        // Usar directamente la API key
        this.apiKey = 'sk-0728bc5b19fa40309517fa81eea0f130';
        
        console.log('=== DEBUG: DeepSeek Service ===');
        console.log('API Key configurada:', !!this.apiKey);
        console.log('API URL:', this.apiUrl);
        console.log('=============================');
    }

    async sendMessage(message) {
        try {
            console.log('Enviando mensaje a DeepSeek...');
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: message
                    }],
                    model: 'deepseek-chat',
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error en la respuesta de DeepSeek:', errorData);
                throw new Error(`Error en la API: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
            }

            const data = await response.json();
            console.log('Respuesta recibida de DeepSeek:', data);
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error al enviar mensaje a DeepSeek:', error);
            throw new Error('No se pudo obtener una respuesta del asistente. Por favor, intenta de nuevo.');
        }
    }
}

export const deepseekService = new DeepSeekService(); 