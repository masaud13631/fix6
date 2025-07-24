import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { getVehicles, addVehicle, updateEquipment, deleteEquipment } from '../utils/database';
import { toJalali } from '../utils/dateUtils';
import DateInput from './DateInput';
import { Vehicle } from '../types';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState(getVehicles());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    propertyNumber: '',
    name: '',
    licensePlate: '',
    vehicleType: 'passenger' as const,
    unit: '',
    referralDate: '',
    repairStatus: 'waiting' as const,
    workshopName: '',
    cost: 0,
    laborCost: 0,
    invoiceImage: '',
    comments: '',
  });

  const filteredVehicles = vehicles.filter(item =>
    item.propertyNumber.includes(searchTerm) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      const updated = updateEquipment(editingItem.id, formData, 'vehicle');
      if (updated) {
        setVehicles(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      }
    } else {
      const newItem = addVehicle(formData);
      setVehicles(prev => [...prev, newItem]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      propertyNumber: '',
      name: '',
      licensePlate: '',
      vehicleType: 'passenger',
      unit: '',
      referralDate: '',
      repairStatus: 'waiting',
      workshopName: '',
      cost: 0,
      laborCost: 0,
      invoiceImage: '',
      comments: '',
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (item: Vehicle) => {
    setFormData({
      propertyNumber: item.propertyNumber,
      name: item.name,
      licensePlate: item.licensePlate,
      vehicleType: item.vehicleType,
      unit: item.unit,
      referralDate: item.referralDate,
      repairStatus: item.repairStatus,
      workshopName: item.workshopName,
      cost: item.cost,
      laborCost: item.laborCost,
      invoiceImage: item.invoiceImage || '',
      comments: item.comments,
    });
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      const success = deleteEquipment(id, 'vehicle');
      if (success) {
        setVehicles(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, invoiceImage: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const statusConfig = {
    'under-repair': { label: 'در حال تعمیر', color: 'bg-yellow-100 text-yellow-800' },
    'repaired': { label: 'تعمیر شده', color: 'bg-green-100 text-green-800' },
    'unrepairable': { label: 'غیرقابل تعمیر', color: 'bg-red-100 text-red-800' },
    'waiting': { label: 'در حال انتظار', color: 'bg-blue-100 text-blue-800' },
  };

  const vehicleTypeConfig = {
    'passenger': 'سواری',
    'pickup': 'وانت',
    'minibus': 'مینی بوس',
    'van': 'ون',
    'heavy': 'سنگین',
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تعمیر خودروهای اداری</h1>
          <p className="text-gray-600 mt-1">مدیریت تعمیرات خودروهای سازمانی</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 ml-2" />
          افزودن تعمیر جدید
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس شماره اموال، نام یا واحد..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شماره اموال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام خودرو
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شماره پلاک
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  واحد استفاده کننده
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ ارجاع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت تعمیر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  هزینه تعمیر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  هزینه دستمزد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  توضیحات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.propertyNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.licensePlate || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicleTypeConfig[item.vehicleType]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {toJalali(new Date(item.referralDate))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[item.repairStatus].color}`}>
                      {statusConfig[item.repairStatus].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.cost.toLocaleString()} ریال
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.laborCost.toLocaleString()} ریال
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={item.comments}>
                      {item.comments || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? 'ویرایش تعمیر خودرو' : 'افزودن تعمیر خودرو جدید'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره اموال *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.propertyNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, propertyNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام خودرو *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      شماره پلاک انتظامی
                    </label>
                    <input
                      type="text"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="مثال: 12ج345-14"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع خودرو *
                    </label>
                    <select
                      required
                      value={formData.vehicleType}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="passenger">سواری</option>
                      <option value="pickup">وانت</option>
                      <option value="minibus">مینی بوس</option>
                      <option value="van">ون</option>
                      <option value="heavy">سنگین</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      واحد استفاده کننده *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <DateInput
                      label="تاریخ ارجاع به تعمیرگاه"
                      required
                      value={formData.referralDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, referralDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وضعیت تعمیر *
                    </label>
                    <select
                      required
                      value={formData.repairStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, repairStatus: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="waiting">در حال انتظار</option>
                      <option value="under-repair">در حال تعمیر</option>
                      <option value="repaired">تعمیر شده</option>
                      <option value="unrepairable">غیرقابل تعمیر</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام تعمیرگاه
                    </label>
                    <input
                      type="text"
                      value={formData.workshopName}
                      onChange={(e) => setFormData(prev => ({ ...prev, workshopName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      میزان هزینه تعمیر (ریال)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      میزان هزینه دستمزد (ریال)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.laborCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, laborCost: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تصویر فاکتور
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {formData.invoiceImage && (
                    <img 
                      src={formData.invoiceImage} 
                      alt="Invoice" 
                      className="mt-2 h-32 w-auto object-cover rounded border"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    توضیحات
                  </label>
                  <textarea
                    rows={3}
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    {editingItem ? 'ویرایش' : 'افزودن'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;