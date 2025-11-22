import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';
import orderService from '../../services/orderService';
import Swal from 'sweetalert2';

export default function CreateOrder() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        customer_id: '',
        order_date: new Date().toISOString().slice(0, 16),
        total_price: 0,
        order_details: []
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const response = await axios.get('/customers?per_page=100');
            const customersData = response.data?.data || response.data || [];
            setCustomers(customersData);
        } catch (err) {
            console.error('Error fetching customers:', err);
            Swal.fire({
                text: 'Failed to load customers',
                icon: 'error',
            });
        } finally {
            setLoadingCustomers(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const response = await axios.get('/products');
            const productsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            setProducts(productsData);
        } catch (err) {
            console.error('Error fetching products:', err);
            Swal.fire({
                text: 'Failed to load products',
                icon: 'error',
            });
        } finally {
            setLoadingProducts(false);
        }
    };

    const calculateTotal = (details) => {
        return details.reduce((sum, detail) => {
            return sum + (parseFloat(detail.quantity) * parseFloat(detail.unit_price));
        }, 0);
    };

    const handleCustomerChange = (e) => {
        const customerId = e.target.value;
        setFormData(prev => ({
            ...prev,
            customer_id: customerId
        }));
        if (errors.customer_id) {
            setErrors(prev => ({ ...prev, customer_id: '' }));
        }
    };

    const addProduct = () => {
        setFormData(prev => ({
            ...prev,
            order_details: [
                ...prev.order_details,
                {
                    product_id: '',
                    quantity: 1,
                    unit_price: 0
                }
            ]
        }));
    };

    const removeProduct = (index) => {
        setFormData(prev => ({
            ...prev,
            order_details: prev.order_details.filter((_, i) => i !== index),
            total_price: calculateTotal(prev.order_details.filter((_, i) => i !== index))
        }));
    };

    const updateProductDetail = (index, field, value) => {
        setFormData(prev => {
            const newDetails = [...prev.order_details];
            newDetails[index] = {
                ...newDetails[index],
                [field]: value
            };

            // If product_id changed, update unit_price from product
            if (field === 'product_id' && value) {
                const product = products.find(p => p.id === parseInt(value));
                if (product) {
                    newDetails[index].unit_price = parseFloat(product.price) || 0;
                }
            }

            const total = calculateTotal(newDetails);
            return {
                ...prev,
                order_details: newDetails,
                total_price: total
            };
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customer_id) {
            newErrors.customer_id = 'Please select a customer';
        }

        if (!formData.order_date) {
            newErrors.order_date = 'Order date is required';
        }

        if (formData.order_details.length === 0) {
            newErrors.order_details = 'Please add at least one product';
        } else {
            formData.order_details.forEach((detail, index) => {
                if (!detail.product_id) {
                    newErrors[`product_${index}`] = 'Please select a product';
                }
                if (!detail.quantity || detail.quantity < 1) {
                    newErrors[`quantity_${index}`] = 'Quantity must be at least 1';
                }
                if (!detail.unit_price || detail.unit_price <= 0) {
                    newErrors[`price_${index}`] = 'Unit price must be greater than 0';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fix the errors in the form',
            });
            return;
        }

        setSaving(true);
        try {
            const orderData = {
                customer_id: parseInt(formData.customer_id),
                order_date: formData.order_date,
                total_price: formData.total_price,
                order_details: formData.order_details.map(detail => ({
                    product_id: parseInt(detail.product_id),
                    quantity: parseInt(detail.quantity),
                    unit_price: parseFloat(detail.unit_price)
                }))
            };

            const result = await orderService.createOrder(orderData);
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: result.message || 'Order created successfully',
                    timer: 1800,
                    showConfirmButton: false,
                });
                navigate('/order');
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.response?.data?.message || 'Failed to create order',
                });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Create Order</h1>
                <p className="text-gray-600 mt-2">Create a new order with products</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Selection */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                    <div>
                        <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Customer *
                        </label>
                        <select
                            id="customer_id"
                            value={formData.customer_id}
                            onChange={handleCustomerChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customer_id ? 'border-red-500' : 'border-gray-300'}`}
                            disabled={loadingCustomers}
                        >
                            <option value="">-- Select Customer --</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.username} ({customer.email})
                                </option>
                            ))}
                        </select>
                        {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="order_date" className="block text-sm font-medium text-gray-700 mb-2">
                            Order Date *
                        </label>
                        <input
                            type="datetime-local"
                            id="order_date"
                            value={formData.order_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.order_date ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.order_date && <p className="mt-1 text-sm text-red-600">{errors.order_date}</p>}
                    </div>
                </div>

                {/* Products Selection */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Products</h2>
                        <button
                            type="button"
                            onClick={addProduct}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        >
                            + Add Product
                        </button>
                    </div>

                    {errors.order_details && (
                        <p className="text-sm text-red-600 mb-4">{errors.order_details}</p>
                    )}

                    {formData.order_details.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No products added. Click "Add Product" to start.</p>
                    ) : (
                        <div className="space-y-4">
                            {formData.order_details.map((detail, index) => {
                                const selectedProduct = products.find(p => p.id === parseInt(detail.product_id));
                                return (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Product *
                                                </label>
                                                <select
                                                    value={detail.product_id}
                                                    onChange={(e) => updateProductDetail(index, 'product_id', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`product_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                                                    disabled={loadingProducts}
                                                >
                                                    <option value="">-- Select Product --</option>
                                                    {products.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.title} (Stock: {product.stock_quantity || 0})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`product_${index}`] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[`product_${index}`]}</p>
                                                )}
                                                {selectedProduct && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Price: ${parseFloat(selectedProduct.price).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quantity *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={detail.quantity}
                                                    onChange={(e) => updateProductDetail(index, 'quantity', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                {errors[`quantity_${index}`] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[`quantity_${index}`]}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Unit Price *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={detail.unit_price}
                                                    onChange={(e) => updateProductDetail(index, 'unit_price', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`price_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                                                />
                                                {errors[`price_${index}`] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors[`price_${index}`]}</p>
                                                )}
                                            </div>

                                            <div className="flex items-end">
                                                <div className="w-full">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Subtotal
                                                    </label>
                                                    <p className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-semibold">
                                                        ${(parseFloat(detail.quantity) * parseFloat(detail.unit_price)).toFixed(2)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(index)}
                                                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Total Amount</h2>
                        <p className="text-3xl font-bold text-blue-600">
                            ${formData.total_price.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/order')}
                        className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving || formData.order_details.length === 0}
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Creating...' : 'Create Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}

