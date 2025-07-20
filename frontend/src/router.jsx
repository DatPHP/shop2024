import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import About from './pages/About';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Post from './pages/Post';
import Category from './pages/Category';

import ProtectedLayout from './components/ProtectedLayout';
import GuestLayout from './components/GuestLayout';
import ListProduct from './components/product/list.component';
import CreateProduct from './components/product/create.component';
import EditProduct from './components/product/edit.component';

import CreateCategory from './components/category/create.component';
import EditCategory from './components/category/edit.component';
import CreatePost from './components/post/create.component';
import EditPost from './components/post/edit.component';
import PostDetail from './components/post/detail.component';

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
			{
				path: '/category/edit/:id',
				element: <EditCategory />,
			},

			{
				path: '/post',
				element: <Post />,
			},
			{
				path: '/post/create',
				element: <CreatePost />,
			},
			{
				path: '/post/edit/:id',
				element: <EditPost />,
			},
			{
				path: '/post/:id',
				element: <PostDetail />,
			},
		],
	},
]);

export default router;
