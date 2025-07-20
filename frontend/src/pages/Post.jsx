import React from 'react';
import PostList from '../components/post/list.component';

export default function Post() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <PostList />
            </div>
        </div>
    );
}
