import axios from 'axios';

// Create a robust Axios client
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // If using HTTP-only cookies in future
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token if available
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const { token } = JSON.parse(userInfo);
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
            } catch (error) {
                console.error('Error parsing user info:', error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        if (response) {
            // Handle 401: Unauthorized (Token Expired or Invalid)
            if (response.status === 401) {
                // We should handle token refresh here if implemented
                // For now, allow the error to propagate so Redux/Components handle it
            }
            // Handle 403: Forbidden (Access Denied for Admin routes)
            if (response.status === 403) {
                console.error("Access Forbidden: You do not have permission.");
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
