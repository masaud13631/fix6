export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  permissions: {
    dashboard: boolean;
    officeEquipment: boolean;
    electronicEquipment: boolean;
    vehicles: boolean;
    reports: boolean;
    userManagement: boolean;
  };
  createdAt: string;
}

export interface BaseEquipment {
  id: string;
  propertyNumber: string;
  name: string;
  brandModel: string;
  unit: string;
  referralDate: string;
  repairStatus: 'under-repair' | 'repaired' | 'unrepairable' | 'waiting';
  workshopName: string;
  cost: number;
  invoiceImage?: string;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficeEquipment extends BaseEquipment {
  type: 'office';
}

export interface ElectronicEquipment extends BaseEquipment {
  type: 'electronic';
}

export interface Vehicle extends Omit<BaseEquipment, 'brandModel'> {
  type: 'vehicle';
  vehicleType: 'passenger' | 'pickup' | 'minibus' | 'van' | 'heavy';
  laborCost: number;
}

export type Equipment = OfficeEquipment | ElectronicEquipment | Vehicle;

export interface RepairStatusCount {
  'under-repair': number;
  'repaired': number;
  'unrepairable': number;
  'waiting': number;
}