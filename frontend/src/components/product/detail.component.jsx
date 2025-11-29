import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../axios';
import Swal from 'sweetalert2';

export default function ProductDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/products/${id}`);
                // Assuming the API returns the product object directly or inside a data property
                // Based on list component: setProducts(response.data) which is an array.
                // For single item, it might be response.data or response.data.data
                // Let's assume response.data for now, similar to list but single object.
                // If it follows standard Laravel resource controller, show method usually returns the model.
                setProduct(response.data.product); 
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.response?.data?.message || 'Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
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
            const response = await axios.delete(`/products/${id}`);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/product');
            } else {
                 Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to delete product'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to delete product'
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

    if (error || !product) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/product')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                             <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.active === 1
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {product.active === 1 ? "Active" : "Inactive"}
                              </span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to={`/product/edit/${product.id}`}
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
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        {product.image ? (
                             <img
                                src={`http://localhost:8000/storage/product/image/${product.image}`}
                                alt={product.title}
                                className="w-full h-auto rounded-lg shadow-sm object-cover"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Description</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{product.description || 'No description available.'}</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Price</h2>
                            <p className="text-2xl font-bold text-blue-600">${product.price}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="bg-gray-100 rounded-lg p-4 mb-6 overflow-auto">
                <h3 className="text-lg font-semibold mb-2">Raw Data</h3>
                <pre className="text-xs">{JSON.stringify(product, null, 2)}</pre>
            </div> */}

            <div className="mt-6">
                <button
                    onClick={() => navigate('/product')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                    ← Back to Products
                </button>
            </div>
        </div>
    );
}
