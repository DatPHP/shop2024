import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../axios';
import { Link } from 'react-router-dom';
import RevenueChart from '../components/RevenueChart';

export default function Profile() {
	const { user } = useAuth();
	const [metrics, setMetrics] = React.useState(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const fetchMetrics = async () => {
			try {
				const response = await axios.get('/dashboard/metrics');
				setMetrics(response.data);
			} catch (error) {
				console.error("Error fetching metrics:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchMetrics();
	}, []);

	return (
		<>
			<div className="text-6xl font-bold text-slate-600">User Profile</div>
			<hr className="bg-slate-400 h-1 w-full my-4" />
			<div className="block p-10 bg-white border border-gray-200 shadow-xl rounded-lg shadowdark:border-gray-700 mb-6">
				<h5 className="my-2 text-2xl font-bold tracking-tight">
					Name: {user.name}
				</h5>
				<p className="font-normal text-gray-700">Email: {user.email}</p>
				<p className="font-normal text-gray-700">
					Created At: {user.created_at}
				</p>
			</div>

			<div className="text-4xl font-bold text-slate-600 mb-4">Dashboard Statistics</div>
			{loading ? (
				<p>Loading metrics...</p>
			) : metrics ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
					<MetricCard title="Total Customers" value={metrics.customers_count} color="bg-blue-100" link="/customer" />
					<MetricCard title="Total Products" value={metrics.products_count} color="bg-green-100" link="/product" />
					<MetricCard title="Total Orders" value={metrics.orders_count} color="bg-yellow-100" link="/order" />
					<MetricCard title="Total Revenue" value={`$${metrics.total_revenue}`} color="bg-purple-100" link="/order" />
					<MetricCard title="Total Blogs" value={metrics.blogs_count} color="bg-pink-100" link="/post" />
					<MetricCard title="Total Companies" value={metrics.companies_count} color="bg-orange-100" link="/company" />
				</div>
			) : (
				<p>Failed to load metrics.</p>
			)}

			<RevenueChart />
		</>
	);
}

function MetricCard({ title, value, color, link }) {
	return (
		<Link to={link} className={`block p-6 ${color} border border-gray-200 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200`}>
			<h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900">{title}</h5>
			<p className="font-normal text-gray-700 text-3xl">{value}</p>
		</Link>
	);
}
