
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/admin',
  withCredentials: true
});

const adminApi = {
  // ==================== USER MANAGEMENT ====================
  getAllUsers: async (page = 1, limit = 10, search = '') => {
    try {
      const { data } = await api.get('/users', {
        params: { page, limit, search }
      });
      return {
        users: data.users,
        totalUsers: data.totalUsers,
        totalPages: data.totalPages,
        currentPage: data.currentPage
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },


  getAllInstructors: () => api.get('/instructors'),
  
  promoteOrDemoteUser: async (userId, role) => {
    try {
      const { data } = await api.patch(`/users/${userId}/promote`, { role });
      
      // Updated to handle both promotion and demotion
      const action = role === "instructor" ? "promoted" : "demoted";
      toast.success(`User ${action} successfully`);
      
      return data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         (role === "instructor" 
                          ? 'Failed to promote user' 
                          : 'Failed to demote user');
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      throw error;
    }
  },

  // ==================== DASHBOARD & ANALYTICS ====================
  getDashboardStats: async () => {
    try {
      const { data } = await api.get('/dashboard', {
        withCredentials: true,
      });
      return data.stats;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard statistics';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  getSystemAnalytics: async (timeRange = 'monthly') => {
    try {
      const { data } = await api.get('/analytics', { params: { timeRange } });
      return data.analytics;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
      throw error;
    }
  },

  // ==================== SYSTEM SETTINGS ====================
  getSystemSettings: async () => {
    try {
      const { data } = await api.get('/settings');
      return data.settings;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load settings');
      throw error;
    }
  },

  updateSystemSettings: async (settings) => {
    try {
      const { data } = await api.put('/settings', settings);
      toast.success('Settings updated successfully');
      return data.settings;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
      throw error;
    }
  }
};

export default adminApi;





