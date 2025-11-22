import React from 'react';
import OrderList from '../components/order/list.component';

export default function Order() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <OrderList />
            </div>
        </div>
    );
}

