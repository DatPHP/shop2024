import Axios from 'axios';

const axios = Axios.create({
	// baseURL: "http://localhost:8000/api",
	baseURL: "https://shop2024.onrender.com/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
		"Accept": "application/json",
	},
});

export default axios;
