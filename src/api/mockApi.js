import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// This mock will intercept any axios requests
const mock = new MockAdapter(axios, { delayResponse: 500 });

// Fake Database
const users = [{ id: 1, username: 'admin', password: 'password', name: 'Admin User' }];
const tasks = [
  { id: 1, title: 'Thiết kế giao diện', description: 'Tạo UI cho phần quản lý task', status: 'In Progress' },
  { id: 2, title: 'Tích hợp API', description: 'Kết nối frontend với backend', status: 'To Do' },
  { id: 3, title: 'Viết tài liệu', description: 'Cập nhật README.md', status: 'Done' }
];

let validToken = 'mock-access-token';
const validRefreshToken = 'mock-refresh-token';

// Login Mock
mock.onPost('http://localhost:3000/api/login').reply((config) => {
  const { username, password } = JSON.parse(config.data);
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    // Reset valid token on login to simulate successful flow
    validToken = 'mock-access-token';
    return [200, {
      accessToken: validToken,
      refreshToken: validRefreshToken,
      user: { id: user.id, name: user.name, username: user.username }
    }];
  }
  return [401, { message: 'Tài khoản hoặc mật khẩu không chính xác' }];
});

// Refresh Token Mock
mock.onPost('http://localhost:3000/api/refresh-token').reply((config) => {
  const { refreshToken } = JSON.parse(config.data);
  if (refreshToken === validRefreshToken) {
    validToken = 'new-mock-access-token-' + Date.now();
    return [200, { accessToken: validToken }];
  }
  return [401, { message: 'Refresh token không hợp lệ' }];
});

// Get Tasks Mock
mock.onGet('http://localhost:3000/api/tasks').reply((config) => {
  const authHeader = config.headers.Authorization;
  if (authHeader !== `Bearer ${validToken}`) {
    return [401, { message: 'Token không hợp lệ hoặc đã hết hạn' }];
  }
  return [200, tasks];
});

// Update Task Mock
mock.onPut(/\/api\/tasks\/\d+/).reply((config) => {
  const authHeader = config.headers.Authorization;
  if (authHeader !== `Bearer ${validToken}`) {
    return [401, { message: 'Token không hợp lệ hoặc đã hết hạn' }];
  }
  
  const id = parseInt(config.url.split('/').pop());
  const updatedTaskData = JSON.parse(config.data);
  
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTaskData };
    return [200, tasks[taskIndex]];
  }
  return [404, { message: 'Không tìm thấy công việc' }];
});

// Create a special endpoint to simulate token expiration
mock.onPost('http://localhost:3000/api/simulate-expiration').reply(() => {
  validToken = 'expired-token';
  return [200, { message: 'Token đã được đánh dấu là hết hạn' }];
});

export default mock;
