import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function PostList() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        per_page: 15
    });

    const fetchPosts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                per_page: filters.per_page,
                ...(filters.search && { search: filters.search }),
                ...(filters.status && { status: filters.status })
            });

            const response = await axios.get(`/posts?${params}`);
            
            if (response.data.success) {
                setPosts(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const deletePost = useCallback(async (id) => {
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
                    icon: "success",
                    text: response.data.message
                });
                fetchPosts(pagination.current_page);
            }
        } catch (err) {
            Swal.fire({
                text: err.response?.data?.message || 'Failed to delete post',
                icon: "error"
            });
        }
    }, [fetchPosts, pagination.current_page]);

    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    if (loading && posts.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Posts</h1>
                {user && (
                    <Link
                        to="/post/create"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Create Post
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search posts..."
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, search: e.target.value }));
                            setTimeout(() => fetchPosts(1), 500);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, status: e.target.value }));
                            fetchPosts(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                    <select
                        value={filters.per_page}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value) }));
                            fetchPosts(1);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={10}>10 per page</option>
                        <option value={15}>15 per page</option>
                        <option value={25}>25 per page</option>
                    </select>
                </div>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-lg shadow-sm border">
                {posts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No posts found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                                            {post.excerpt && (
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                post.status === 'published' ? 'bg-green-100 text-green-800' :
                                                post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {post.user?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link to={`/post/${post.id}`} className="text-blue-600 hover:text-blue-900">
                                                    View
                                                </Link>
                                                {user && (user.id === post.user?.id || user.is_admin) && (
                                                    <>
                                                        <Link to={`/post/edit/${post.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => deletePost(post.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
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

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => fetchPosts(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-2">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        onClick={() => fetchPosts(pagination.current_page + 1)}
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
