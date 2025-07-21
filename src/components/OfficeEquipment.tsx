import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Eye } from 'lucide-react';
import { getOfficeEquipment, addOfficeEquipment, updateEquipment } from '../utils/database';
import { OfficeEquipment as OfficeEquipmentType } from '../types';

const OfficeEquipment: React.FC = () => {
  const [equipment, setEquipment] = useState(getOfficeEquipment());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<OfficeEquipmentType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    propertyNumber: '',
    name: '',
    brandModel: '',
    unit: '',
    referralDate: '',
    repairStatus: 'waiting' as const,
    workshopName: '',
    cost: 0,
    invoiceImage: '',
    comments: '',
  });

  const filteredEquipment = equipment.filter(item =>
    item.propertyNumber.includes(searchTerm) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      const updated = updateEquipment(editingItem.id, formData, 'office');
      if (updated) {
        setEquipment(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      }
    } else {
      const newItem = addOfficeEquipment(formData);
      setEquipment(prev => [...prev, newItem]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      propertyNumber: '',
      name: '',
      brandModel: '',
      unit: '',
      referralDate: '',
      repairStatus: 'waiting',
      workshopName: '',
      cost: 0,
      invoiceImage: '',
      comments: '',
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (item: OfficeEquipmentType) => {
    setFormData({
      propertyNumber: item.propertyNumber,
      name: item.name,
      brandModel: item.brandModel,
      unit: item.unit,
      referralDate: item.referralDate,
      repairStatus: item.repairStatus,
      workshopName: item.workshopName,
      cost: item.cost,
      invoiceImage: item.invoiceImage || '',
      comments: item.comments,
    });
    setEditingItem(item);
    setShowModal(true);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تعمیر لوازم اداری</h1>
          <p className="text-gray-600 mt-1">مدیریت تعمیرات لوازم اداری سازمان</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شماره اموال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  برند و مدل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نام واحد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ ارجاع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت تعمیر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  هزینه
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.propertyNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.brandModel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.referralDate).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[item.repairStatus].color}`}>
                      {statusConfig[item.repairStatus].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.cost.toLocaleString()} ریال
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
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
                {editingItem ? 'ویرایش تعمیر' : 'افزودن تعمیر جدید'}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      برند و مدل
                    </label>
                    <input
                      type="text"
                      value={formData.brandModel}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandModel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نام واحد *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاریخ ارجاع به تعمیرگاه *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.referralDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, referralDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      میزان هزینه (ریال)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

export default OfficeEquipment;