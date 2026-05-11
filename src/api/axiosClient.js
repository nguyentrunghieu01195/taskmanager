import axios from 'axios';

// const baseURL = 'https://1.getfly.vn';
const baseURL = 'https://icdt.getflycrm.com';
// Use mock backend URL
const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Phát hiện lỗi 401, đang kiểm tra refresh token...');
      
      if (isRefreshing) {
        console.log('Đang có tiến trình refresh token khác, đợi...');
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('Không tìm thấy refresh token, thực hiện logout.');
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      console.log('Đang gọi API refresh token...');
      console.log('refresh_token', refreshToken);
      try {
        const { data } = await axios.post(`${baseURL}/refresh_token`, { refresh_token: refreshToken });
        console.log('Refresh token thành công!', data);
        
        const newAccessToken = data.access_token || data.accessToken;
        const newRefreshToken = data.token || data.refreshToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = newAccessToken;
        return axiosClient(originalRequest);
      } catch (err) {
        console.error('Refresh token thất bại:', err);
        processQueue(err, null);
        isRefreshing = false;
        
        // Chỉ logout khi thực sự thất bại trong việc lấy token mới
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
