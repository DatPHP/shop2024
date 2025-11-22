import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function OrderList() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        customer_id: '',
        per_page: 15
    });
    const searchTimeoutRef = useRef(null);

    const fetchOrders = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                per_page: filters.per_page,
                with: 'customer,orderDetails',
                ...(filters.search && { search: filters.search }),
                ...(filters.customer_id && { customer_id: filters.customer_id })
            };

            const result = await orderService.getOrders(params);

            if (result.success) {
                setOrders(result.data);
                setPagination(prev => result.pagination || prev);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            Swal.fire({
                text: err.response?.data?.message || 'Failed to fetch orders',
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const deleteOrder = useCallback(async (id) => {
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
            const result = await orderService.deleteOrder(id);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    text: result.message || 'Order deleted successfully',
                });
                fetchOrders(pagination.current_page);
            }
        } catch (err) {
            Swal.fire({
                text: err.response?.data?.message || 'Failed to delete order',
                icon: 'error',
            });
        }
    }, [fetchOrders, pagination.current_page]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    if (loading && orders.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Orders</h1>
                {user && (
                    <Link
                        to="/order/create"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Create Order
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilters(prev => ({ ...prev, search: value }));
                            
                            // Clear previous timeout
                            if (searchTimeoutRef.current) {
                                clearTimeout(searchTimeoutRef.current);
                            }
                            
                            // Set new timeout for debounced search
                            searchTimeoutRef.current = setTimeout(() => {
                                fetchOrders(1);
                            }, 500);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filters.per_page}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value) }));
                            fetchOrders(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10 per page</option>
                        <option value={15}>15 per page</option>
                        <option value={25}>25 per page</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
                {orders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No orders found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {order.customer ? (
                                                <Link to={`/customer/${order.customer.id}`} className="text-blue-600 hover:underline">
                                                    {order.customer.username}
                                                </Link>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(order.order_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            ${parseFloat(order.total_price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link to={`/order/${order.id}`} className="text-blue-600 hover:text-blue-900">
                                                    View Details
                                                </Link>
                                                {user && (
                                                    <button
                                                        onClick={() => deleteOrder(order.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {pagination.last_page > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => fetchOrders(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-2">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        onClick={() => fetchOrders(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

