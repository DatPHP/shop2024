import axios from '../axios';

class OrderService {
    constructor() {
        this.baseURL = '/orders';
    }

    // Get all orders with pagination and filters
    async getOrders(params = {}) {
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
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    // Get a single order by ID
    async getOrder(id, withRelations = 'customer,orderDetails,orderDetails.product') {
        try {
            const params = withRelations ? `?with=${withRelations}` : '';
            const response = await axios.get(`${this.baseURL}/${id}${params}`);
            return {
                success: true,
                data: response.data?.data || response.data
            };
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    }

    // Create a new order with order details
    async createOrder(data) {
        try {
            const response = await axios.post(this.baseURL, data);
            return {
                success: true,
                data: response.data?.data || response.data,
                message: response.data?.message || 'Order created successfully'
            };
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Update an order
    async updateOrder(id, data) {
        try {
            const response = await axios.put(`${this.baseURL}/${id}`, data);
            return {
                success: true,
                data: response.data?.data || response.data,
                message: response.data?.message || 'Order updated successfully'
            };
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    // Delete an order
    async deleteOrder(id) {
        try {
            const response = await axios.delete(`${this.baseURL}/${id}`);
            return {
                success: true,
                message: 'Order deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }
}

export default new OrderService();

