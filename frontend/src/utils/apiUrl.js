import axios from '../axios';

/**
 * Get the base API URL without the /api prefix
 * This is useful for storage routes and other non-API endpoints
 */
export const getBaseUrl = () => {
	// Use VITE_API_URL from environment variable if available
	if (import.meta.env.VITE_API_URL) {
		return import.meta.env.VITE_API_URL;
	}
	
	// Fallback: extract from axios instance or use default
	const baseURL = axios.defaults.baseURL || 'http://localhost:8000/api';
	// Remove /api suffix if present
	return baseURL.replace('/api', '');
};

/**
 * Get the full storage URL for a given path
 */
export const getStorageUrl = (path) => {
	if (!path) return '';
	const baseUrl = getBaseUrl();
	return `${baseUrl}/storage/${path}`;
};

