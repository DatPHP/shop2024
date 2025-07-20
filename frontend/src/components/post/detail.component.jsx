import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function PostDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/posts/${id}`);
                
                if (response.data.success) {
                    setPost(response.data.data);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err.response?.data?.message || 'Failed to fetch post');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
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
            const response = await axios.delete(`/posts/${id}`);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/post');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to delete post'
            });
        }
    };

    const handleStatusChange = async (action) => {
        try {
            const response = await axios.patch(`/posts/${id}/${action}`);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                // Refresh post data
                const refreshResponse = await axios.get(`/posts/${id}`);
                if (refreshResponse.data.success) {
                    setPost(refreshResponse.data.data);
                }
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.response?.data?.message || `Failed to ${action} post`
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

    if (error || !post) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'The post you are looking for does not exist.'}</p>
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

    const canEdit = user && (user.id === post.user?.id || user.is_admin);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>By {post.user?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            {post.published_at && (
                                <>
                                    <span>•</span>
                                    <span>Published {new Date(post.published_at).toLocaleDateString()}</span>
                                </>
                            )}
                        </div>
                    </div>
                    {canEdit && (
                        <div className="flex space-x-2">
                            <Link
                                to={`/post/edit/${post.id}`}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                            >
                                Edit
                            </Link>
                            {post.status === 'draft' && (
                                <button
                                    onClick={() => handleStatusChange('publish')}
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    Publish
                                </button>
                            )}
                            {post.status === 'published' && (
                                <button
                                    onClick={() => handleStatusChange('archive')}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                                >
                                    Archive
                                </button>
                            )}
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

            {/* Status Badge */}
            <div className="mb-6">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' :
                    post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {post.content}
                    </div>
                </div>
            </div>

            {/* Post Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Post Information</h3>
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
                    {post.read_time && (
                        <div>
                            <span className="font-medium">Read Time:</span> {post.read_time} minute{post.read_time !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* Back Button */}
            <div className="mt-6">
                <button
                    onClick={() => navigate('/post')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                    ← Back to Posts
                </button>
            </div>
        </div>
    );
} 