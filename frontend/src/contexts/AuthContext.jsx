import { createContext, useContext, useState } from 'react';
import axios from '../axios';

const AuthContent = createContext({
	user: null,
	setUser: () => {},
	csrfToken: () => {},
});

export const AuthProvider = ({ children }) => {
	const [user, _setUser] = useState(
		JSON.parse(localStorage.getItem('user')) || null
	);

	// set user to local storage
	const setUser = (user) => {
		if (user) {
			localStorage.setItem('user', JSON.stringify(user));
		} else {
			localStorage.removeItem('user');
		}
		_setUser(user);
	};

	// csrf token generation for guest methods
	const csrfToken = async () => {
		// Sanctum CSRF cookie route is at /sanctum/csrf-cookie (not under /api)
		// So we need to use the base URL without /api prefix
		// Use VITE_API_URL from environment variable if available
		const realUrl = env.VITE_API_URL;
		const sanctumBaseURL = import.meta.env.VITE_API_URL 
			? import.meta.env.VITE_API_URL 
			: (axios.defaults.baseURL || realUrl + '/api').replace('/api', '');
		
		await axios.get('/sanctum/csrf-cookie', {
			baseURL: sanctumBaseURL
		});
		return true;
	};

	return (
		<AuthContent.Provider value={{ user, setUser, csrfToken }}>
			{children}
		</AuthContent.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContent);
};
