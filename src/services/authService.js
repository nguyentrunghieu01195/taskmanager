import axiosClient from '../api/axiosClient';

const authService = {
  login: (user_username, user_password) => {
    return axiosClient.post('/authenticate', { user_username, user_password });
  },
  
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  simulateExpiration: () => {
    return axiosClient.post('/simulate-expiration');
  }
};

export default authService;
