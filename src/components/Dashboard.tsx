import React from 'react';
import { Monitor, Smartphone, Car, Wrench, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getOfficeEquipment, getElectronicEquipment, getVehicles } from '../utils/database';
import { RepairStatusCount } from '../types';

const Dashboard: React.FC = () => {
  const officeEquipment = getOfficeEquipment();
  const electronicEquipment = getElectronicEquipment();
  const vehicles = getVehicles();

  const getStatusCounts = (equipment: any[]): RepairStatusCount => {
    return equipment.reduce((acc, item) => {
      acc[item.repairStatus] = (acc[item.repairStatus] || 0) + 1;
      return acc;
    }, {
      'under-repair': 0,
      'repaired': 0,
      'unrepairable': 0,
      'waiting': 0,
    });
  };

  const officeStats = getStatusCounts(officeEquipment);
  const electronicStats = getStatusCounts(electronicEquipment);
  const vehicleStats = getStatusCounts(vehicles);

  const totalStats = {
    'under-repair': officeStats['under-repair'] + electronicStats['under-repair'] + vehicleStats['under-repair'],
    'repaired': officeStats['repaired'] + electronicStats['repaired'] + vehicleStats['repaired'],
    'unrepairable': officeStats['unrepairable'] + electronicStats['unrepairable'] + vehicleStats['unrepairable'],
    'waiting': officeStats['waiting'] + electronicStats['waiting'] + vehicleStats['waiting'],
  };

  const statusConfig = {
    'under-repair': { label: 'در حال تعمیر', color: 'bg-yellow-500', icon: Wrench },
    'repaired': { label: 'تعمیر شده', color: 'bg-green-500', icon: CheckCircle },
    'unrepairable': { label: 'غیرقابل تعمیر', color: 'bg-red-500', icon: XCircle },
    'waiting': { label: 'در حال انتظار', color: 'bg-blue-500', icon: Clock },
  };

  const recentItems = [
    ...officeEquipment.slice(-3).map(item => ({ ...item, category: 'لوازم اداری' })),
    ...electronicEquipment.slice(-3).map(item => ({ ...item, category: 'لوازم الکترونیکی' })),
    ...vehicles.slice(-3).map(item => ({ ...item, category: 'خودرو' })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">داشبورد</h1>
        <p className="text-gray-600 mt-2">نمای کلی سیستم تعمیر و نگهداری</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">لوازم اداری</p>
              <p className="text-2xl font-semibold text-gray-900">{officeEquipment.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">لوازم الکترونیکی</p>
              <p className="text-2xl font-semibold text-gray-900">{electronicEquipment.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">خودروها</p>
              <p className="text-2xl font-semibold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">وضعیت کلی تعمیرات</h2>
          <div className="space-y-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              const count = totalStats[status as keyof RepairStatusCount];
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${config.color.replace('bg-', 'bg-').replace('500', '100')}`}>
                      <Icon className={`h-4 w-4 ${config.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="mr-3 text-sm font-medium text-gray-900">{config.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">آخرین فعالیت‌ها</h2>
          <div className="space-y-3">
            {recentItems.length > 0 ? (
              recentItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.category} - {item.propertyNumber}</p>
                  </div>
                  <div className="text-left">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      statusConfig[item.repairStatus].color.replace('bg-', 'bg-').replace('500', '100')
                    } ${statusConfig[item.repairStatus].color.replace('bg-', 'text-')}`}>
                      {statusConfig[item.repairStatus].label}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">هیچ فعالیتی ثبت نشده است</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;