import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import About from './pages/About';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Post from './pages/Post';
import Company from './pages/Company';
import Customer from './pages/Customer';
import Order from './pages/Order';
import CreateCompany from './components/company/create.component';
import EditCompany from './components/company/edit.component';
import CompanyDetail from './components/company/detail.component';
// import Category from './pages/Category';

import ProtectedLayout from './components/ProtectedLayout';
import GuestLayout from './components/GuestLayout';
// product
import ListProduct from './components/product/list.component';
import CreateProduct from './components/product/create.component';
import EditProduct from './components/product/edit.component';
import ProductDetail from './components/product/detail.component';
// category
import ListCategory from './components/category/list.component';
import CreateCategory from './components/category/create.component';
import EditCategory from './components/category/edit.component';
import CategoryDetail from './components/category/detail.component';
// post
import CreatePost from './components/post/create.component';
import EditPost from './components/post/edit.component';
import PostDetail from './components/post/detail.component';
// customer
import CreateCustomer from './components/customer/create.component';
import EditCustomer from './components/customer/edit.component';
import CustomerDetail from './components/customer/detail.component';
// order
import CreateOrder from './components/order/create.component';
import OrderDetail from './components/order/detail.component';

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
				path: '/company',
				element: <Company />,
			},
            {
                path: '/company/create',
                element: <CreateCompany />,
            },
            {
                path: '/company/edit/:id',
                element: <EditCompany />,
            },
            {
                path: '/company/:id',
                element: <CompanyDetail />,
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
				path: '/product/:id',
				element: <ProductDetail />,
			},

			{
				path: '/category',
				element: <ListCategory />,
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
				path: '/category/:id',
				element: <CategoryDetail />,
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
			{
				path: '/customer',
				element: <Customer />,
			},
			{
				path: '/customer/create',
				element: <CreateCustomer />,
			},
			{
				path: '/customer/edit/:id',
				element: <EditCustomer />,
			},
			{
				path: '/customer/:id',
				element: <CustomerDetail />,
			},
			{
				path: '/order',
				element: <Order />,
			},
			{
				path: '/order/create',
				element: <CreateOrder />,
			},
			{
				path: '/order/:id',
				element: <OrderDetail />,
			},
		],
	},
]);

export default router;
