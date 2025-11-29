import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../axios';
import Swal from 'sweetalert2';

export default function CategoryDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/categories/${id}`);
                console.log(response.data.category);
                setCategory(response.data.category);
            } catch (err) {
                console.error('Error fetching category:', err);
                setError(err.response?.data?.message || 'Failed to fetch category');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCategory();
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
            const response = await axios.delete(`/categories/${id}`);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/category');
            } else {
                 Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: response.data.message || 'Failed to delete category'
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to delete category'
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

    if (error || !category) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'The category you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/category')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Back to Categories
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                             <span>Slug: {category.slug}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            to={`/category/edit/${category.id}`}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Category Details</h2>
                        <div className="space-y-2">
                             <div>
                                <span className="font-medium text-gray-700">Name:</span> {category.name}
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Slug:</span> {category.slug}
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Parent Category:</span> {category.parent ? category.parent.name : 'None'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="bg-gray-100 rounded-lg p-4 mb-6 overflow-auto">
                <h3 className="text-lg font-semibold mb-2">Raw Data</h3>
                <pre className="text-xs">{JSON.stringify(category, null, 2)}</pre>
            </div> */}

            <div className="mt-6">
                <button
                    onClick={() => navigate('/category')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                    ← Back to Categories
                </button>
            </div>
        </div>
    );
}
