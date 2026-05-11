import axiosClient from '../api/axiosClient';

const taskService = {
  getTasks: (params) => {
    return axiosClient.get('/tasks_by_weight_summary', { params });
  },
  
  updateTask: (id, taskData) => {
    return axiosClient.put(`/tasks/${id}`, taskData);
  }
};

export default taskService;
