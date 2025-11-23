import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import customerService from '../../services/customerService';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function CustomerList() {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
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
    const searchTimeoutRef = useRef(null);

    const fetchCustomers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const result = await customerService.getCustomers({
                page,
                per_page: filters.per_page,
                ...(filters.search && { search: filters.search })
            });

            if (result.success) {
                setCustomers(result.data);
                setPagination(prev => result.pagination || prev);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            Swal.fire({
                text: err.response?.data?.message || 'Failed to fetch customers',
                icon: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const deleteCustomer = useCallback(async (id) => {
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
                    text: result.message || 'Customer deleted successfully',
                });
                fetchCustomers(pagination.current_page);
            }
        } catch (err) {
            Swal.fire({
                text: err.response?.data?.message || 'Failed to delete customer',
                icon: 'error',
            });
        }
    }, [fetchCustomers, pagination.current_page]);

    const handleExportCSV = async () => {
        try {
            Swal.fire({
                title: 'Exporting...',
                text: 'Please wait while we generate your CSV file',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const params = {};
            if (filters.search) {
                params.search = filters.search;
            }

            await customerService.exportCSV(params);
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'CSV file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                text: err.response?.data?.message || 'Failed to export CSV',
                icon: 'error',
            });
        }
    };

    const handleExportPDF = async () => {
        try {
            Swal.fire({
                title: 'Exporting...',
                text: 'Please wait while we generate your PDF file',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const params = {};
            if (filters.search) {
                params.search = filters.search;
            }

            await customerService.exportPDF(params);
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'PDF file downloaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({
                text: err.response?.data?.message || 'Failed to export PDF',
                icon: 'error',
            });
        }
    };

    useEffect(() => {
        fetchCustomers(1);
    }, [fetchCustomers]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    if (loading && customers.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customers</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                        title="Export as CSV"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                        title="Export as PDF"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Export PDF
                    </button>
                    {user && (
                        <Link
                            to="/customer/create"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Create Customer
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search customers..."
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilters(prev => ({ ...prev, search: value }));
                            
                            // Clear previous timeout
                            if (searchTimeoutRef.current) {
                                clearTimeout(searchTimeoutRef.current);
                            }
                            
                            // Set new timeout for debounced search
                            searchTimeoutRef.current = setTimeout(() => {
                                fetchCustomers(1);
                            }, 500);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filters.per_page}
                        onChange={(e) => {
                            setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value) }));
                            fetchCustomers(1);
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
                {customers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No customers found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.username}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{customer.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{customer.phone_number || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{customer.address || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link to={`/customer/${customer.id}`} className="text-blue-600 hover:text-blue-900">
                                                    View
                                                </Link>
                                                {user && (
                                                    <>
                                                        <Link to={`/customer/edit/${customer.id}`} className="text-indigo-600 hover:text-indigo-900">
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteCustomer(customer.id)}
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
                        onClick={() => fetchCustomers(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-2">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        onClick={() => fetchCustomers(pagination.current_page + 1)}
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

