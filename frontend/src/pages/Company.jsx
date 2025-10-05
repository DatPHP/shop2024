import React from 'react';
import CompanyList from '../components/company/list.component';

export default function Company() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
               <CompanyList></CompanyList>
            </div>
        </div>
    );
}
