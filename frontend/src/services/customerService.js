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

    // Export customers as CSV
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
            let filename = 'customers.csv';
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

    // Export customers as PDF
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
            let filename = 'customers.pdf';
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

export default new CustomerService();

