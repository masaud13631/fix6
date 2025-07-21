import { User, Equipment, OfficeEquipment, ElectronicEquipment, Vehicle } from '../types';

const STORAGE_KEYS = {
  users: 'maintenance_users',
  officeEquipment: 'maintenance_office_equipment',
  electronicEquipment: 'maintenance_electronic_equipment',
  vehicles: 'maintenance_vehicles',
};

// Initialize default admin user if not exists
export const initializeDatabase = () => {
  const users = getUsers();
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: '1',
      username: 'admin',
      password: 'admin123',
      name: 'مدیر سیستم',
      role: 'admin',
      permissions: {
        dashboard: true,
        officeEquipment: true,
        electronicEquipment: true,
        vehicles: true,
        reports: true,
        userManagement: true,
      },
      createdAt: new Date().toISOString(),
    };
    saveUsers([defaultAdmin]);
  }
};

// Users
export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.users);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
};

export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
  }
  return null;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length !== users.length) {
    saveUsers(filtered);
    return true;
  }
  return false;
};

export const validateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  return users.find(u => u.username === username && u.password === password) || null;
};

// Office Equipment
export const getOfficeEquipment = (): OfficeEquipment[] => {
  const equipment = localStorage.getItem(STORAGE_KEYS.officeEquipment);
  return equipment ? JSON.parse(equipment) : [];
};

export const saveOfficeEquipment = (equipment: OfficeEquipment[]) => {
  localStorage.setItem(STORAGE_KEYS.officeEquipment, JSON.stringify(equipment));
};

export const addOfficeEquipment = (equipment: Omit<OfficeEquipment, 'id' | 'createdAt' | 'updatedAt'>): OfficeEquipment => {
  const equipmentList = getOfficeEquipment();
  const newEquipment: OfficeEquipment = {
    ...equipment,
    id: Date.now().toString(),
    type: 'office',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  equipmentList.push(newEquipment);
  saveOfficeEquipment(equipmentList);
  return newEquipment;
};

// Electronic Equipment
export const getElectronicEquipment = (): ElectronicEquipment[] => {
  const equipment = localStorage.getItem(STORAGE_KEYS.electronicEquipment);
  return equipment ? JSON.parse(equipment) : [];
};

export const saveElectronicEquipment = (equipment: ElectronicEquipment[]) => {
  localStorage.setItem(STORAGE_KEYS.electronicEquipment, JSON.stringify(equipment));
};

export const addElectronicEquipment = (equipment: Omit<ElectronicEquipment, 'id' | 'createdAt' | 'updatedAt'>): ElectronicEquipment => {
  const equipmentList = getElectronicEquipment();
  const newEquipment: ElectronicEquipment = {
    ...equipment,
    id: Date.now().toString(),
    type: 'electronic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  equipmentList.push(newEquipment);
  saveElectronicEquipment(equipmentList);
  return newEquipment;
};

// Vehicles
export const getVehicles = (): Vehicle[] => {
  const vehicles = localStorage.getItem(STORAGE_KEYS.vehicles);
  return vehicles ? JSON.parse(vehicles) : [];
};

export const saveVehicles = (vehicles: Vehicle[]) => {
  localStorage.setItem(STORAGE_KEYS.vehicles, JSON.stringify(vehicles));
};

export const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle => {
  const vehicles = getVehicles();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: Date.now().toString(),
    type: 'vehicle',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  vehicles.push(newVehicle);
  saveVehicles(vehicles);
  return newVehicle;
};

// Generic update function
export const updateEquipment = <T extends Equipment>(
  id: string,
  updates: Partial<T>,
  type: 'office' | 'electronic' | 'vehicle'
): T | null => {
  let equipment: T[];
  let saveFunction: (equipment: T[]) => void;

  switch (type) {
    case 'office':
      equipment = getOfficeEquipment() as T[];
      saveFunction = saveOfficeEquipment as (equipment: T[]) => void;
      break;
    case 'electronic':
      equipment = getElectronicEquipment() as T[];
      saveFunction = saveElectronicEquipment as (equipment: T[]) => void;
      break;
    case 'vehicle':
      equipment = getVehicles() as T[];
      saveFunction = saveVehicles as (equipment: T[]) => void;
      break;
    default:
      return null;
  }

  const index = equipment.findIndex(e => e.id === id);
  if (index !== -1) {
    equipment[index] = { ...equipment[index], ...updates, updatedAt: new Date().toISOString() };
    saveFunction(equipment);
    return equipment[index];
  }
  return null;
};