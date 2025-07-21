import React, { useState } from 'react';
import { FileText, Download, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { getOfficeEquipment, getElectronicEquipment, getVehicles } from '../utils/database';

const Reports: React.FC = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const officeEquipment = getOfficeEquipment();
  const electronicEquipment = getElectronicEquipment();
  const vehicles = getVehicles();

  const allEquipment = [
    ...officeEquipment.map(item => ({ ...item, category: 'اداری' })),
    ...electronicEquipment.map(item => ({ ...item, category: 'الکترونیکی' })),
    ...vehicles.map(item => ({ ...item, category: 'خودرو', totalCost: item.cost + (item.laborCost || 0) })),
  ];

  const filteredEquipment = allEquipment.filter(item => {
    const matchesType = selectedType === 'all' || 
      (selectedType === 'office' && item.category === 'اداری') ||
      (selectedType === 'electronic' && item.category === 'الکترونیکی') ||
      (selectedType === 'vehicle' && item.category === 'خودرو');
    
    const matchesStatus = selectedStatus === 'all' || item.repairStatus === selectedStatus;
    
    const matchesDateRange = (!dateFrom || new Date(item.referralDate) >= new Date(dateFrom)) &&
      (!dateTo || new Date(item.referralDate) <= new Date(dateTo));
    
    return matchesType && matchesStatus && matchesDateRange;
  });

  const statusConfig = {
    'under-repair': { label: 'در حال تعمیر', color: 'text-yellow-600' },
    'repaired': { label: 'تعمیر شده', color: 'text-green-600' },
    'unrepairable': { label: 'غیرقابل تعمیر', color: 'text-red-600' },
    'waiting': { label: 'در حال انتظار', color: 'text-blue-600' },
  };

  const getStatusCounts = () => {
    return filteredEquipment.reduce((acc, item) => {
      acc[item.repairStatus] = (acc[item.repairStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const getCostSummary = () => {
    return filteredEquipment.reduce((acc, item) => {
      const cost = 'totalCost' in item ? item.totalCost : item.cost;
      acc.totalCost += cost;
      acc.count += 1;
      return acc;
    }, { totalCost: 0, count: 0 });
  };

  const getCategoryCosts = () => {
    const costs = {
      'اداری': 0,
      'الکترونیکی': 0,
      'خودرو': 0,
    };

    filteredEquipment.forEach(item => {
      const cost = 'totalCost' in item ? item.totalCost : item.cost;
      costs[item.category as keyof typeof costs] += cost;
    });

    return costs;
  };

  const exportToCSV = () => {
    const headers = ['شماره اموال', 'نام', 'دسته‌بندی', 'واحد', 'تاریخ ارجاع', 'وضعیت', 'هزینه'];
    const csvContent = [
      headers.join(','),
      ...filteredEquipment.map(item => [
        item.propertyNumber,
        item.name,
        item.category,
        item.unit,
        new Date(item.referralDate).toLocaleDateString('fa-IR'),
        statusConfig[item.repairStatus].label,
        ('totalCost' in item ? item.totalCost : item.cost).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `maintenance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusCounts = getStatusCounts();
  const costSummary = getCostSummary();
  const categoryCosts = getCategoryCosts();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">گزارشات تحلیلی</h1>
          <p className="text-gray-600 mt-1">گزارشات جامع از تعمیرات و هزینه‌ها</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 ml-2" />
          دریافت گزارش
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 ml-2" />
          فیلترها
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              از تاریخ
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تا تاریخ
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع تجهیزات
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه</option>
              <option value="office">لوازم اداری</option>
              <option value="electronic">لوازم الکترونیکی</option>
              <option value="vehicle">خودرو</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              وضعیت تعمیر
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه</option>
              <option value="waiting">در حال انتظار</option>
              <option value="under-repair">در حال تعمیر</option>
              <option value="repaired">تعمیر شده</option>
              <option value="unrepairable">غیرقابل تعمیر</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">کل موارد</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredEquipment.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">کل هزینه</p>
              <p className="text-2xl font-semibold text-gray-900">{costSummary.totalCost.toLocaleString()}</p>
              <p className="text-xs text-gray-500">ریال</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">میانگین هزینه</p>
              <p className="text-2xl font-semibold text-gray-900">
                {costSummary.count > 0 ? Math.round(costSummary.totalCost / costSummary.count).toLocaleString() : 0}
              </p>
              <p className="text-xs text-gray-500">ریال</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزیع وضعیت تعمیرات</h3>
          <div className="space-y-3">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = statusCounts[status] || 0;
              const percentage = filteredEquipment.length > 0 ? (count / filteredEquipment.length) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ml-3 ${config.color.replace('text-', 'bg-').replace('600', '500')}`} />
                    <span className="text-sm font-medium text-gray-900">{config.label}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 ml-2">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزیع هزینه بر اساس دسته‌بندی</h3>
          <div className="space-y-3">
            {Object.entries(categoryCosts).map(([category, cost]) => {
              const percentage = costSummary.totalCost > 0 ? (cost / costSummary.totalCost) * 100 : 0;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{category}</span>
                  <div className="text-left">
                    <span className="text-sm text-gray-600">{cost.toLocaleString()} ریال</span>
                    <span className="text-xs text-gray-500 block">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">جزئیات گزارش</h3>
          <p className="text-sm text-gray-600 mt-1">نمایش {filteredEquipment.length} مورد</p>
        </div>
        
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
                  دسته‌بندی
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  واحد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاریخ ارجاع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  وضعیت
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  هزینه
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
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.referralDate).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${statusConfig[item.repairStatus].color}`}>
                      {statusConfig[item.repairStatus].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {('totalCost' in item ? item.totalCost : item.cost).toLocaleString()} ریال
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;