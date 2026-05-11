/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const EditTaskModal = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    task_name: '',
    task_weight: '',
    task_description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        task_name: task.task_name || '',
        task_weight: task.task_weight || '',
        task_description: task.task_description || '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(task.id, formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">
            Cập nhật công việc
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5 cursor-pointer" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="task_name" className="block text-sm font-semibold text-slate-700 mb-1">
                Tên công việc
              </label>
              <input
                type="text"
                id="task_name"
                name="task_name"
                value={formData.task_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="task_weight" className="block text-sm font-semibold text-slate-700 mb-1">
                Khối lượng công việc
              </label>
              <input
                type="number"
                id="task_weight"
                name="task_weight"
                value={formData.task_weight}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                required
              />
            </div>
            
            <div>
              <label htmlFor="task_description" className="block text-sm font-semibold text-slate-700 mb-1">
                Nội dung ck
              </label>
              <div dangerouslySetInnerHTML={{__html: formData.task_description}} />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 transition-colors disabled:opacity-70  cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
