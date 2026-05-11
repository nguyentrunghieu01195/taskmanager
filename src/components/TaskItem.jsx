import React from 'react';
import { Edit2, Clock, CheckCircle, Circle } from 'lucide-react';

const TaskItem = ({ task, onEdit }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Done':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
      case 'In Progress':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock };
      default:
        return { color: 'text-slate-500', bg: 'bg-slate-100', icon: Circle };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-primary-400 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5 mr-1" />
          {task.status}
        </span>
        
        <button 
          onClick={onEdit}
          className="text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Cập nhật"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{task.title}</h3>
      <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
    </div>
  );
};

export default TaskItem;
