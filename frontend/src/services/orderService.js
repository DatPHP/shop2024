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

    // Export orders as CSV
    async exportCSV(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${this.baseURL}/export/csv?${queryParams}`, {
                responseType: 'blob',
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
            let filename = 'orders.csv';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return {
                success: true,
                message: 'CSV exported successfully'
            };
        } catch (error) {
            console.error('Error exporting CSV:', error);
            throw error;
        }
    }

    // Export orders as PDF
    async exportPDF(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${this.baseURL}/export/pdf?${queryParams}`, {
                responseType: 'blob',
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
            let filename = 'orders.pdf';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return {
                success: true,
                message: 'PDF exported successfully'
            };
        } catch (error) {
            console.error('Error exporting PDF:', error);
            throw error;
        }
    }
}

export default new OrderService();

