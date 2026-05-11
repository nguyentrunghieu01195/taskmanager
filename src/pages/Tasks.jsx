import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import taskService from '../services/taskService';
import EditTaskModal from '../components/EditTaskModal';
import { LogOut, RefreshCw } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const format = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    return { start: format(firstDay), end: format(lastDay) };
  };

  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        fields: ['task_name', 'task_weight', 'project_name', 'task_description'].join(','),
        filtering: {
          task_receiver: user?.user_id,
          nature_status: 'completed'
        }
      };

      // Add date filters if set
      if (startDate) {
        // Convert YYYY-MM-DD to start of day timestamp (seconds)
        const startTimestamp = Math.floor(new Date(startDate).setHours(0, 0, 0, 0) / 1000);
        params['filtering[task_completed_date:between][0]'] = startTimestamp;
      }

      if (endDate) {
        // Convert YYYY-MM-DD to end of day timestamp (seconds)
        const endTimestamp = Math.floor(new Date(endDate).setHours(23, 59, 59, 999) / 1000);
        params['filtering[task_completed_date:between][1]'] = endTimestamp;
      }

      const data = await taskService.getTasks(params);
      setTasks(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      fetchTasks();
      hasFetched.current = true;
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateTask = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API cập nhật cho từng công việc trong danh sách
      const updatePromises = tasks.map(task => 
        taskService.updateTask(task.id, {
          task_name: task.task_name,
          task_weight: task.task_weight,
        })
      );
      
      await Promise.all(updatePromises);
      alert('Đã cập nhật thành công tất cả công việc!');
      await fetchTasks(); // Tải lại danh sách để đảm bảo dữ liệu đồng bộ
    } catch (err) {
      console.error('Lỗi cập nhật hàng loạt:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hàng loạt công việc');
      alert('Cập nhật thất bại, vui lòng kiểm tra lại console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh sách công việc</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
              Xin chào, <span className="text-primary-600">{user?.name}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-slate-500 hover:text-red-600 transition-colors bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Từ ngày:</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đến ngày:</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>
            <button 
              onClick={fetchTasks}
              className="bg-blue-600 hover:bg-primary-700 text-white text-xs font-bold py-1.5 px-4 rounded transition-colors cursor-pointer"
            >
              Lọc
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <h2 className="text-lg font-semibold text-slate-700">Công việc ({tasks.length})</h2>
            <button 
              onClick={fetchTasks}
              className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tải lại
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md shadow-sm border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="w-5">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên công việc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Khối lượng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên dự án</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tasks.map((task, index) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{task.task_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{task.task_weight}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{task.project_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center">
                    <button 
                      onClick={() => setEditingTask(task)} 
                      className="text-primary-600 hover:text-primary-900 cursor-pointer"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-500">Chưa có công việc nào.</p>
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap font-bold" colSpan={2}>Tổng khối lượng:</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold">{tasks.reduce((total, task) => total + parseFloat(task.task_weight), 0)}</td>
                <td />
                <td className="px-6 py-4 whitespace-nowrap font-bold">
                  <button
                    onClick={updateTask}
                    className="px-6 py-2 bg-blue-500 hover:bg-primary-700 text-white font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                  >
                    Cập nhật
                  </button>
                </td>

              </tr>
            </tbody>
          </table>
        )}
      </main>

      {editingTask && (
        <EditTaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
          onSave={(id, data) => {
            let newTasks = [...tasks];
            let index = newTasks.findIndex(task => task.id === id);
            newTasks[index] = {...newTasks[index], ...data};
            setTasks(newTasks);
            setEditingTask(null)
          }} 
        />
      )}
    </div>
  );
};

export default Tasks;
