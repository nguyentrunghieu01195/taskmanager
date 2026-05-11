import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Tasks from './pages/Tasks';

// Component bảo vệ route
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Route danh sách công việc - Cần bảo vệ */}
        <Route 
          path="/update_task" 
          element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          } 
        />

        {/* Chuyển hướng mặc định */}
        <Route path="/" element={<Navigate to="/update_task" />} />
        
        {/* Xử lý 404 - Chuyển về tasks hoặc login */}
        <Route path="*" element={<Navigate to="/update_task" />} />
      </Routes>
    </Router>
  );
}

export default App;
