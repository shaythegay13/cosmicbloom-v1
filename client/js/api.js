// API Client for Farm & Give
import { API_BASE_URL } from './config.js';

export class API {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // Game endpoints
    async getCharacters() {
        return this.request('/game/characters');
    }

    async selectCharacter(characterId) {
        return this.request('/game/select-character', {
            method: 'POST',
            body: JSON.stringify({ characterId })
        });
    }

    async saveGame(gameProgress) {
        return this.request('/game/save', {
            method: 'POST',
            body: JSON.stringify({ gameProgress })
        });
    }

    async loadGame() {
        return this.request('/game/load');
    }

    // Charity endpoints
    async getCharities(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/charity/organizations?${params}`);
    }

    async selectCharity(charityId) {
        return this.request('/charity/select', {
            method: 'POST',
            body: JSON.stringify({ charityId })
        });
    }

    async getImpactStats() {
        return this.request('/charity/stats/impact');
    }

    async getMyImpact() {
        return this.request('/charity/my-impact');
    }

    // Payment endpoints
    async createPaymentIntent(amount, items) {
        return this.request('/payments/create-intent', {
            method: 'POST',
            body: JSON.stringify({ amount, items })
        });
    }

    async confirmPayment(transactionId, paymentIntentId) {
        return this.request('/payments/confirm', {
            method: 'POST',
            body: JSON.stringify({ transactionId, paymentIntentId })
        });
    }

    async getPaymentHistory() {
        return this.request('/payments/history');
    }
}

// Shared API instance
export const api = new API();
