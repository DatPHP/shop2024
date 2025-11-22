import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function OrderDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await orderService.getOrder(id, 'customer,orderDetails,orderDetails.product');
                if (result.success && result.data) {
                    setOrder(result.data);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.response?.data?.message || 'Failed to fetch order');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
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
            const result = await orderService.deleteOrder(id);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Order deleted successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/order');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to delete order'
            });
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/order')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const canEdit = !!user;
    const orderDetails = order.order_details || order.orderDetails || [];

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.id}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Order Date: {new Date(order.order_date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Created {new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {canEdit && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Delete Order
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Details */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                        {order.customer ? (
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Name:</span>
                                    <p className="text-gray-900 font-medium">
                                        <Link to={`/customer/${order.customer.id}`} className="text-blue-600 hover:underline">
                                            {order.customer.username}
                                        </Link>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Email:</span>
                                    <p className="text-gray-900">
                                        <a href={`mailto:${order.customer.email}`} className="text-blue-600 hover:underline">
                                            {order.customer.email}
                                        </a>
                                    </p>
                                </div>
                                {order.customer.phone_number && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Phone:</span>
                                        <p className="text-gray-900">{order.customer.phone_number}</p>
                                    </div>
                                )}
                                {order.customer.address && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Address:</span>
                                        <p className="text-gray-900">{order.customer.address}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">Customer information not available</p>
                        )}
                    </div>
                </div>

                {/* Order Details and Products */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Information */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-500">Order ID:</span>
                                <p className="text-gray-900">#{order.id}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Order Date:</span>
                                <p className="text-gray-900">{new Date(order.order_date).toLocaleString()}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Total Items:</span>
                                <p className="text-gray-900">{orderDetails.length} item(s)</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-500">Total Quantity:</span>
                                <p className="text-gray-900">
                                    {orderDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0)} units
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Products List */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4">Products in Order</h2>
                        {orderDetails.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No products in this order</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orderDetails.map((detail) => {
                                            const product = detail.product || {};
                                            const quantity = detail.quantity || 0;
                                            const unitPrice = parseFloat(detail.unit_price) || 0;
                                            const subtotal = quantity * unitPrice;

                                            return (
                                                <tr key={detail.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {product.title || 'Product N/A'}
                                                            </p>
                                                            {product.id && (
                                                                <Link
                                                                    to={`/product/${product.id}`}
                                                                    className="text-xs text-blue-600 hover:underline"
                                                                >
                                                                    View Product
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">{quantity}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-900">${unitPrice.toFixed(2)}</td>
                                                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">${subtotal.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Total Amount</h2>
                            <p className="text-3xl font-bold text-blue-600">
                                ${parseFloat(order.total_price).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="mt-6">
                <button
                    onClick={() => navigate('/order')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                    ← Back to Orders
                </button>
            </div>
        </div>
    );
}

