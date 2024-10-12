import axios from 'axios';

export const searchCall = async (query) => {
    try {
        const response = await axios.post('http://localhost:4000/search', { query });
        return response.data;
    } catch (error) {
        console.error('Error making POST request:', error);
        throw error;
    }
};