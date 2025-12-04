import axios from 'axios';

const META_API_URL = process.env.META_SERVICE_URL || "http://localhost:5001/api/mystic";
const CHAT_API_URL = process.env.CHAT_SERVICE_URL || "http://localhost:5002/api/chat";
// const AI_API_URL = process.env.AI_API_URL || "http://localhost:5001/api/mystic";

export const AIService = {
    async callMysticEndpoint(payload: any) {
        try {
            console.log(`[AIService] Sending request to ${META_API_URL}...`);
            const response = await axios.post(META_API_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000
            });

            return response.data;
        } catch (error: any) {
            console.error('[AIService] Error calling AI Endpoint:', error.message);
            if (error.response) {
                console.error('[AIService] Python Server Response:', error.response.data);
                throw new Error(error.response.data.message || 'AI Server Error');
            }
            throw new Error('Failed to connect to AI Service');
        }
    },
    async sendChatMessage(payload: any) {
        try {
            console.log(`[AIService] Sending chat message to ${CHAT_API_URL}...`);
            // console.log('[AIService] Payload JSON:', JSON.stringify(payload, null, 2)); 
            const response = await axios.post(CHAT_API_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000
            });
            return response.data;
        } catch (error: any) {
            console.error('[AIService] Error sending chat message:', error.message);
            if (error.response) {
                console.error('[AIService] Chat Server Response:', error.response.data);
                throw new Error(error.response.data.message || 'Chat Server Error');
            }
            throw new Error('Failed to connect to Chat Service');
        }
    }
}