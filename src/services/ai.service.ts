import axios from 'axios';

// URL của Python Server
const AI_API_URL = process.env.AI_API_URL || "http://localhost:5001/api/mystic";

export const AIService = {
    async callMysticEndpoint(payload: any) {
        try {
            console.log(`[AIService] Sending request to ${AI_API_URL}...`);
            const response = await axios.post(AI_API_URL, payload, {
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
    }
};