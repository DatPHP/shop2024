import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import About from './pages/About';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Category from './pages/Category';

import ProtectedLayout from './components/ProtectedLayout';
import GuestLayout from './components/GuestLayout';
import ListProduct from './components/product/list.component';
import CreateProduct from './components/product/create.component';
import EditProduct from './components/product/edit.component';

import CreateCategory from './components/category/create.component';


const router = createBrowserRouter([
	{
		path: '/',
		element: <GuestLayout />,
		children: [
			{
				path: '/',
				element: <Login />,
			},
			{
				path: '/register',
				element: <Register />,
			},
		],
	},
	{
		path: '/',
		element: <ProtectedLayout />,
		children: [
			{
				path: '/about',
				element: <About />,
			},
			{
				path: '/profile',
				element: <Profile />,
			},
			{
				path: '/product',
				element: <ListProduct />,
			},
			{
				path: '/product/create',
				element: <CreateProduct />,
			},
			{
				path: '/product/edit/:id',
				element: <EditProduct />,
			},


			{
				path: '/category',
				element: <Category />,
			},
			{
				path: '/category/create',
				element: <CreateCategory />,
			},

			


		],
	},
]);

export default router;
