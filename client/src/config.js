// API configuration
// In development, uses localhost
// In production, uses environment variable set on Render
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_URL;
