import Axios from 'axios';

const realUrl = env.VITE_API_URL;
// Get base URL from environment variable or use default
const getBaseURL = () => {
	// VITE_API_URL should be the base URL without /api (e.g., http://localhost:8000)
	const baseUrl = import.meta.env.VITE_API_URL || realUrl;
	// Add /api suffix for API routes
	return `${baseUrl}/api`;
};

const axios = Axios.create({
	baseURL: getBaseURL(),
	// For production, set VITE_API_URL in .env file:
	// VITE_API_URL=https://shop2024.onrender.com
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		"Accept": "application/json",
	},
});

export default axios;
