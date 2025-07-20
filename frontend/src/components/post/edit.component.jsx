import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../axios';
import Swal from 'sweetalert2';

export default function EditPost() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [post, setPost] = useState(null);

    // Fetch post data on component mount
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setFetching(true);
                const response = await axios.get(`/posts/${id}`);
                
                if (response.data.success) {
                    const postData = response.data.data;
                    setPost(postData);
                    setFormData({
                        title: postData.title,
                        content: postData.content,
                        status: postData.status
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Post not found'
                    });
                    navigate('/post');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: err.response?.data?.message || 'Failed to fetch post'
                });
                navigate('/post');
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        } else if (formData.title.length > 255) {
            newErrors.title = 'Title must be less than 255 characters';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        } else if (formData.content.length < 10) {
            newErrors.content = 'Content must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.put(`/posts/${id}`, formData);
            
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // Navigate to posts list
                navigate('/post');
            }
        } catch (err) {
            console.error('Error updating post:', err);
            
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: err.response?.data?.message || 'Failed to update post'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                    <button
                        onClick={() => navigate('/post')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Back to Posts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
                <p className="text-gray-600 mt-2">Update your blog post</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Field */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter post title..."
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* Content Field */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            Content *
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={12}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.content ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Write your post content here..."
                        />
                        {errors.content && (
                            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            {formData.content.length} characters
                        </p>
                    </div>

                    {/* Status Field */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">
                            Draft: Save for later editing | Published: Make it public | Archived: Hide from public view
                        </p>
                    </div>

                    {/* Post Info */}
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Post Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Created:</span> {new Date(post.created_at).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium">Last Updated:</span> {new Date(post.updated_at).toLocaleString()}
                            </div>
                            {post.published_at && (
                                <div>
                                    <span className="font-medium">Published:</span> {new Date(post.published_at).toLocaleString()}
                                </div>
                            )}
                            <div>
                                <span className="font-medium">Author:</span> {post.user?.name || 'Unknown'}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/post')}
                            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
