import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Eye, Filter, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { getElectronicEquipment, addElectronicEquipment, updateEquipment, deleteEquipment } from '../utils/database';
import { toJalali } from '../utils/dateUtils';
import DateInput from './DateInput';
import { ElectronicEquipment as ElectronicEquipmentType } from '../types';

const ElectronicEquipment: React.FC = () => {
  const [equipment, setEquipment] = useState(getElectronicEquipment());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ElectronicEquipmentType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyNumber: '',
    name: '',
    brandModel: '',
    unit: '',
    dateFrom: '',
    dateTo: '',
    repairStatus: '',
    workshopName: '',
    minCost: '',
    maxCost: '',
  });
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

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.propertyNumber.includes(searchTerm) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPropertyNumber = filters.propertyNumber === '' || item.propertyNumber.includes(filters.propertyNumber);
    const matchesName = filters.name === '' || item.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesBrandModel = filters.brandModel === '' || item.brandModel.toLowerCase().includes(filters.brandModel.toLowerCase());
    const matchesUnit = filters.unit === '' || item.unit.toLowerCase().includes(filters.unit.toLowerCase());
    const matchesDateRange = (!filters.dateFrom || new Date(item.referralDate) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo || new Date(item.referralDate) <= new Date(filters.dateTo));
    const matchesStatus = filters.repairStatus === '' || item.repairStatus === filters.repairStatus;
    const matchesWorkshop = filters.workshopName === '' || item.workshopName.toLowerCase().includes(filters.workshopName.toLowerCase());
    const matchesCostRange = (!filters.minCost || item.cost >= parseInt(filters.minCost)) &&
      (!filters.maxCost || item.cost <= parseInt(filters.maxCost));
    
    return matchesSearch && matchesPropertyNumber && matchesName && matchesBrandModel && 
           matchesUnit && matchesDateRange && matchesStatus && matchesWorkshop && matchesCostRange;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      const updated = updateEquipment(editingItem.id, formData, 'electronic');
      if (updated) {
        setEquipment(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      }
    } else {
      const newItem = addElectronicEquipment(formData);
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

  const handleEdit = (item: ElectronicEquipmentType) => {
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

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این مورد اطمینان دارید؟')) {
      const success = deleteEquipment(id, 'electronic');
      if (success) {
        setEquipment(prev => prev.filter(item => item.id !== id));
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

  const clearFilters = () => {
    setFilters({
      propertyNumber: '',
      name: '',
      brandModel: '',
      unit: '',
      dateFrom: '',
      dateTo: '',
      repairStatus: '',
      workshopName: '',
      minCost: '',
      maxCost: '',
    });
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const headers = ['شماره اموال', 'نام', 'برند و مدل', 'واحد', 'تاریخ ارجاع', 'وضعیت', 'تعمیرگاه', 'هزینه', 'توضیحات'];
    const csvContent = [
      headers.join(','),
      ...filteredEquipment.map(item => [
        item.propertyNumber,
        item.name,
        item.brandModel,
        item.unit,
        toJalali(new Date(item.referralDate)),
        statusConfig[item.repairStatus].label,
        item.workshopName,
        item.cost.toLocaleString(),
        item.comments || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `electronic_equipment_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredEquipment, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `electronic_equipment_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToTXT = () => {
    const txtContent = filteredEquipment.map(item => 
      `شماره اموال: ${item.propertyNumber}\nنام: ${item.name}\nبرند و مدل: ${item.brandModel}\nواحد: ${item.unit}\nتاریخ ارجاع: ${toJalali(new Date(item.referralDate))}\nوضعیت: ${statusConfig[item.repairStatus].label}\nتعمیرگاه: ${item.workshopName}\nهزینه: ${item.cost.toLocaleString()} ریال\nتوضیحات: ${item.comments || 'ندارد'}\n${'='.repeat(50)}`
    ).join('\n\n');

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `electronic_equipment_${new Date().toISOString().split('T')[0]}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-2xl font-bold text-gray-900">تعمیر لوازم الکترونیکی</h1>
          <p className="text-gray-600 mt-1">مدیریت تعمیرات لوازم الکترونیکی سازمان</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 ml-2" />
              فیلترها
            </button>
          </div>
          
          <div className="relative group">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
              <Download className="h-4 w-4 ml-2" />
              خروجی
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={exportToCSV}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FileSpreadsheet className="h-4 w-4 ml-2" />
                  CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FileText className="h-4 w-4 ml-2" />
                  JSON
                </button>
                <button
                  onClick={exportToTXT}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FileText className="h-4 w-4 ml-2" />
                  TXT
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 ml-2" />
            افزودن تعمیر جدید
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس شماره اموال، نام یا واحد..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">فیلترهای پیشرفته</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-green-600 hover:text-green-800"
            >
              پاک کردن فیلترها
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شماره اموال</label>
              <input
                type="text"
                value={filters.propertyNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, propertyNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="جستجو در شماره اموال"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="جستجو در نام"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">برند و مدل</label>
              <input
                type="text"
                value={filters.brandModel}
                onChange={(e) => setFilters(prev => ({ ...prev, brandModel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="جستجو در برند و مدل"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">واحد</label>
              <input
                type="text"
                value={filters.unit}
                onChange={(e) => setFilters(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="جستجو در واحد"
              />
            </div>
            
            <div>
              <DateInput
                label="از تاریخ"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            
            <div>
              <DateInput
                label="تا تاریخ"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت تعمیر</label>
              <select
                value={filters.repairStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, repairStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="waiting">در حال انتظار</option>
                <option value="under-repair">در حال تعمیر</option>
                <option value="repaired">تعمیر شده</option>
                <option value="unrepairable">غیرقابل تعمیر</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تعمیرگاه</label>
              <input
                type="text"
                value={filters.workshopName}
                onChange={(e) => setFilters(prev => ({ ...prev, workshopName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="جستجو در نام تعمیرگاه"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حداقل هزینه</label>
              <input
                type="number"
                value={filters.minCost}
                onChange={(e) => setFilters(prev => ({ ...prev, minCost: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ریال"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حداکثر هزینه</label>
              <input
                type="number"
                value={filters.maxCost}
                onChange={(e) => setFilters(prev => ({ ...prev, maxCost: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="ریال"
              />
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            نمایش {filteredEquipment.length} مورد از {equipment.length} مورد
          </div>
        </div>
      )}

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
                  توضیحات
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
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={item.comments}>
                      {item.comments || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-green-600 hover:text-green-900"
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

      {/* Modal - Similar to OfficeEquipment but with green theme */}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <DateInput
                      label="تاریخ ارجاع به تعمیرگاه"
                      required
                      value={formData.referralDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, referralDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    {editingItem ? 'ویرایش' : 'افزودن'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
  );
};

export default ElectronicEquipment;