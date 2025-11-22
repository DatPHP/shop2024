import React from 'react';
import CustomerList from '../components/customer/list.component';

export default function Customer() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <CustomerList />
            </div>
        </div>
    );
}

