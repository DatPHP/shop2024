import axios from '../axios';

class CustomerService {
    constructor() {
        this.baseURL = '/customers';
    }

    // Get all customers with pagination and filters
    async getCustomers(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${this.baseURL}?${queryParams}`);
            
            // Handle Laravel pagination response
            if (response.data?.data && response.data?.meta) {
                return {
                    success: true,
                    data: response.data.data,
                    pagination: {
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        per_page: response.data.meta.per_page,
                        total: response.data.meta.total,
                    }
                };
            }
            
            return {
                success: true,
                data: response.data?.data || response.data || [],
                pagination: response.data?.pagination || {}
            };
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    // Get a single customer by ID
    async getCustomer(id, withRelations = '') {
        try {
            const params = withRelations ? `?with=${withRelations}` : '';
            const response = await axios.get(`${this.baseURL}/${id}${params}`);
            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    }

    // Create a new customer
    async createCustomer(data) {
        try {
            const response = await axios.post(this.baseURL, data);
            return {
                success: true,
                data: response.data?.data || response.data,
                message: response.data?.message || 'Customer created successfully'
            };
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    // Update a customer
    async updateCustomer(id, data) {
        try {
            const response = await axios.put(`${this.baseURL}/${id}`, data);
            return {
                success: true,
                data: response.data?.data || response.data,
                message: response.data?.message || 'Customer updated successfully'
            };
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    // Delete a customer
    async deleteCustomer(id) {
        try {
            const response = await axios.delete(`${this.baseURL}/${id}`);
            return {
                success: true,
                message: 'Customer deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }
}

export default new CustomerService();

