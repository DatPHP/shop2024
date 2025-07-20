import axios from '../axios';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class PostService {
    constructor() {
        this.baseURL = '/posts';
    }

    // Cache management
    setCache(key, data) {
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getCache(key) {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
        cache.delete(key);
        return null;
    }

    clearCache(pattern = null) {
        if (pattern) {
            for (const key of cache.keys()) {
                if (key.includes(pattern)) {
                    cache.delete(key);
                }
            }
        } else {
            cache.clear();
        }
    }

    // Get all posts with pagination and filters
    async getPosts(params = {}) {
        const cacheKey = `posts_${JSON.stringify(params)}`;
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${this.baseURL}?${queryParams}`);
            
            if (response.data.success) {
                this.setCache(cacheKey, response.data);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    // Get a single post by ID
    async getPost(id) {
        const cacheKey = `post_${id}`;
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseURL}/${id}`);
            
            if (response.data.success) {
                this.setCache(cacheKey, response.data);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Post not found');
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    // Create a new post
    async createPost(postData) {
        try {
            const response = await axios.post(this.baseURL, postData);
            
            if (response.data.success) {
                // Clear related caches
                this.clearCache('posts_');
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    // Update an existing post
    async updatePost(id, postData) {
        try {
            const response = await axios.put(`${this.baseURL}/${id}`, postData);
            
            if (response.data.success) {
                // Clear related caches
                this.clearCache('posts_');
                this.clearCache(`post_${id}`);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to update post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            throw error;
        }
    }

    // Delete a post
    async deletePost(id) {
        try {
            const response = await axios.delete(`${this.baseURL}/${id}`);
            
            if (response.data.success) {
                // Clear related caches
                this.clearCache('posts_');
                this.clearCache(`post_${id}`);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }

    // Publish a post
    async publishPost(id) {
        try {
            const response = await axios.patch(`${this.baseURL}/${id}/publish`);
            
            if (response.data.success) {
                // Clear related caches
                this.clearCache('posts_');
                this.clearCache(`post_${id}`);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to publish post');
            }
        } catch (error) {
            console.error('Error publishing post:', error);
            throw error;
        }
    }

    // Archive a post
    async archivePost(id) {
        try {
            const response = await axios.patch(`${this.baseURL}/${id}/archive`);
            
            if (response.data.success) {
                // Clear related caches
                this.clearCache('posts_');
                this.clearCache(`post_${id}`);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to archive post');
            }
        } catch (error) {
            console.error('Error archiving post:', error);
            throw error;
        }
    }

    // Get user's posts
    async getMyPosts(params = {}) {
        const cacheKey = `my_posts_${JSON.stringify(params)}`;
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`/my-posts?${queryParams}`);
            
            if (response.data.success) {
                this.setCache(cacheKey, response.data);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch user posts');
            }
        } catch (error) {
            console.error('Error fetching user posts:', error);
            throw error;
        }
    }

    // Get post statistics
    async getPostStats() {
        const cacheKey = 'post_stats';
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseURL}/stats`);
            
            if (response.data.success) {
                this.setCache(cacheKey, response.data);
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch post statistics');
            }
        } catch (error) {
            console.error('Error fetching post statistics:', error);
            throw error;
        }
    }

    // Search posts
    async searchPosts(query, params = {}) {
        const searchParams = { ...params, search: query };
        return this.getPosts(searchParams);
    }

    // Get posts by status
    async getPostsByStatus(status, params = {}) {
        const statusParams = { ...params, status };
        return this.getPosts(statusParams);
    }

    // Utility method to format error messages
    formatError(error) {
        if (error.response?.data?.errors) {
            return error.response.data.errors;
        }
        if (error.response?.data?.message) {
            return { general: error.response.data.message };
        }
        return { general: error.message || 'An unexpected error occurred' };
    }

    // Utility method to validate post data
    validatePostData(data) {
        const errors = {};

        if (!data.title || data.title.trim().length < 3) {
            errors.title = 'Title must be at least 3 characters long';
        }

        if (!data.content || data.content.trim().length < 10) {
            errors.content = 'Content must be at least 10 characters long';
        }

        if (data.title && data.title.length > 255) {
            errors.title = 'Title must be less than 255 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

// Create and export a singleton instance
const postService = new PostService();
export default postService; 