import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

export default function CompanyDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/companies/${id}`);
                const companyData = response.data?.data || response.data;
                if (companyData) {
                    setCompany(companyData);
                } else {
                    setError('Company not found');
                }
            } catch (err) {
                console.error('Error fetching company:', err);
                setError(err.response?.data?.message || 'Failed to fetch company');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCompany();
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
            const response = await axios.delete(`/companies/${id}`);
            if (response.status === 204 || response.data?.success !== false) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Company deleted successfully',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/company');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to delete company'
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

    if (error || !company) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'The company you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/company')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Back to Companies
                    </button>
                </div>
            </div>
        );
    }

    const canEdit = !!user;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Created {new Date(company.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Updated {new Date(company.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    {canEdit && (
                        <div className="flex space-x-2">
                            <Link
                                to={`/company/edit/${company.id}`}
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
                    )}
                </div>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                        <span className="font-medium">Email:</span>{' '}
                        {company.email ? (
                            <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">{company.email}</a>
                        ) : (
                            '-'
                        )}
                    </div>
                    <div>
                        <span className="font-medium">Website:</span>{' '}
                        {company.website ? (
                            <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                {company.website}
                            </a>
                        ) : (
                            '-'
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium">Address:</span>{' '}
                        {company.address || '-'}
                    </div>
                </div>
            </div>

            {/* Meta */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <span className="font-medium">Created:</span> {new Date(company.created_at).toLocaleString()}
                    </div>
                    <div>
                        <span className="font-medium">Last Updated:</span> {new Date(company.updated_at).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Back Button */}
            <div className="mt-6">
                <button
                    onClick={() => navigate('/company')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                    ← Back to Companies
                </button>
            </div>
        </div>
    );
}