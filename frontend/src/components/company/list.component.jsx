import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function CompanyList() {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        per_page: 15
    });

    const fetchCompanies = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                per_page: filters.per_page,
                ...(filters.search && { search: filters.search })
            });

            const response = await axios.get(`/companies?${params}`);

            // Expecting a standard paginated shape { data, meta } or custom { success, data, pagination }
            if (response.data?.data && response.data?.meta) {
                setCompanies(response.data.data);
                setPagination({
                    current_page: response.data.meta.current_page,
                    last_page: response.data.meta.last_page,
                    per_page: response.data.meta.per_page,
                    total: response.data.meta.total,
                });
            } else if (response.data?.success) {
                setCompanies(response.data.data || []);
                setPagination(response.data.pagination || pagination);
            } else {
                setCompanies(Array.isArray(response.data) ? response.data : []);
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination]);

    const deleteCompany = useCallback(async (id) => {
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
            const response = await axios.delete(`/companies/${id}`);
            if (response.data?.success !== false) {
                Swal.fire({
                    icon: 'success',
                    text: response.data?.message || 'Deleted successfully',
                });
                fetchCompanies(pagination.current_page);
            }
        } catch (err) {
            Swal.fire({
                text: err.response?.data?.message || 'Failed to delete company',
                icon: 'error',
            });
        }
    }, [fetchCompanies, pagination.current_page]);

    useEffect(() => {
        fetchCompanies(1);
    }, [fetchCompanies]);

    if (loading && companies.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Companies</h1>
                {user && (
                    <Link
                        to="/company/create"
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Create Company
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search companies..."
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, search: e.target.value }));
                            setTimeout(() => fetchCompanies(1), 500);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filters.per_page}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value) }));
                            fetchCompanies(1);
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
                {companies.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No companies found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {companies.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{company.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{company.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{company.address}</td>
                                        <td className="px-6 py-4 text-sm text-blue-700">
                                            {company.website ? (
                                                <a href={company.website} target="_blank" rel="noreferrer" className="hover:underline">
                                                    {company.website}
                                                </a>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link to={`/company/${company.id}`} className="text-blue-600 hover:text-blue-900">
                                                    View
                                                </Link>
                                                {user && (
                                                    <>
                                                        <Link to={`/company/edit/${company.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteCompany(company.id)}
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

            {pagination.last_page > 1 && (
                <div className="flex justify-center space-x-2">
                    <button
                        onClick={() => fetchCompanies(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-2">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        onClick={() => fetchCompanies(pagination.current_page + 1)}
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
