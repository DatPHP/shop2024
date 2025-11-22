import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import customerService from '../../services/customerService';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await customerService.getCustomer(id, 'orders,orderHistory');
                if (result.success && result.data) {
                    setCustomer(result.data);
                } else {
                    setError('Customer not found');
                }
            } catch (err) {
                console.error('Error fetching customer:', err);
                setError(err.response?.data?.message || 'Failed to fetch customer');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCustomer();
        }
    }, [id]);

    const handleDelete = async () => {
        const isConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => result.isConfirmed);

        if (!isConfirm) return;

        try {
            const result = await customerService.deleteCustomer(id);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Customer deleted successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/customer');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to delete customer'
            });
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'The customer you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/customer')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    const canEdit = !!user;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{customer.username}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Created {new Date(customer.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated {new Date(customer.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {canEdit && (
                        <div className="flex space-x-2">
                            <Link
                                to={`/customer/edit/${customer.id}`}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                        <span className="font-medium">Email:</span>{' '}
                        {customer.email ? (
                            <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">{customer.email}</a>
                        ) : (
                            '-'
                        )}
                    </div>
                    <div>
                        <span className="font-medium">Phone:</span>{' '}
                        {customer.phone_number || '-'}
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium">Address:</span>{' '}
                        {customer.address || '-'}
                    </div>
                </div>
            </div>

            {customer.orders && customer.orders.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Orders ({customer.orders.length})</h2>
                    <div className="space-y-2">
                        {customer.orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <Link to={`/order/${order.id}`} className="text-blue-600 hover:underline font-medium">
                                        Order #{order.id}
                                    </Link>
                                    <p className="text-sm text-gray-600">
                                        {new Date(order.order_date).toLocaleDateString()} - ${parseFloat(order.total_price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {customer.orders.length > 5 && (
                            <p className="text-sm text-gray-600 text-center">... and {customer.orders.length - 5} more orders</p>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6">
                <button
                    onClick={() => navigate('/customer')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                    ← Back to Customers
                </button>
            </div>
        </div>
    );
}

