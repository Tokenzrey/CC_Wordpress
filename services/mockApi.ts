import { Instance, InstanceStatus, Stats } from '../types';

// Initial Mock Data
const INITIAL_INSTANCES: Instance[] = [
  {
    id: '101',
    name: 'Tech Blog Production',
    subdomain: 'techblog',
    url: 'https://techblog.wpcube.local',
    status: 'running',
    createdAt: '2023-10-15T10:00:00Z',
    region: 'us-east-1',
    specs: { cpu: '2 vCPU', ram: '4GB', storage: '20GB' },
    db: { host: 'db-cluster-01', name: 'wp_techblog', user: 'wp_user_101' }
  },
  {
    id: '102',
    name: 'Marketing Landing Page',
    subdomain: 'marketing',
    url: 'https://marketing.wpcube.local',
    status: 'stopped',
    createdAt: '2023-11-02T14:30:00Z',
    region: 'us-east-1',
    specs: { cpu: '1 vCPU', ram: '2GB', storage: '10GB' },
    db: { host: 'db-cluster-01', name: 'wp_marketing', user: 'wp_user_102' }
  },
  {
    id: '103',
    name: 'Dev Environment',
    subdomain: 'dev-sandbox',
    url: 'https://dev-sandbox.wpcube.local',
    status: 'running',
    createdAt: '2023-11-20T09:15:00Z',
    region: 'eu-west-2',
    specs: { cpu: '1 vCPU', ram: '1GB', storage: '5GB' },
    db: { host: 'db-cluster-02', name: 'wp_dev', user: 'wp_user_103' }
  }
];

const STORAGE_KEY = 'wpcube_instances';

// Helper to get from storage
const getStoredInstances = (): Instance[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INSTANCES));
    return INITIAL_INSTANCES;
  }
  return JSON.parse(stored);
};

// Helper to save to storage
const saveInstances = (instances: Instance[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
};

export const mockApi = {
  getInstances: async (): Promise<Instance[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredInstances());
      }, 600); // Simulate network latency
    });
  },

  getInstanceById: async (id: string): Promise<Instance | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instances = getStoredInstances();
        resolve(instances.find(i => i.id === id));
      }, 500);
    });
  },

  createInstance: async (data: { name: string; subdomain: string }): Promise<Instance> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInstance: Instance = {
          id: Math.floor(Math.random() * 10000).toString(),
          name: data.name,
          subdomain: data.subdomain,
          url: `https://${data.subdomain}.wpcube.local`,
          status: 'running', // Usually starts provisioning, but we simulate success quickly
          createdAt: new Date().toISOString(),
          region: 'us-east-1',
          specs: { cpu: '1 vCPU', ram: '2GB', storage: '10GB' },
          db: {
            host: 'db-cluster-01',
            name: `wp_${data.subdomain.replace('-', '_')}`,
            user: `wp_${Math.floor(Math.random() * 1000)}`
          }
        };
        const instances = getStoredInstances();
        saveInstances([newInstance, ...instances]);
        resolve(newInstance);
      }, 3000); // 3 seconds provisioning time
    });
  },

  updateInstanceStatus: async (id: string, status: InstanceStatus): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instances = getStoredInstances();
        const updated = instances.map(i => i.id === id ? { ...i, status } : i);
        saveInstances(updated);
        resolve();
      }, 1000);
    });
  },

  deleteInstance: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instances = getStoredInstances();
        const filtered = instances.filter(i => i.id !== id);
        saveInstances(filtered);
        resolve();
      }, 1500);
    });
  },

  getStats: async (): Promise<Stats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instances = getStoredInstances();
        const active = instances.filter(i => i.status === 'running').length;
        // Mock resource calculation
        const totalCpu = instances.reduce((acc, curr) => acc + parseInt(curr.specs.cpu), 0);
        const totalRam = instances.reduce((acc, curr) => acc + parseInt(curr.specs.ram), 0);
        
        resolve({
          totalInstances: instances.length,
          activeInstances: active,
          totalCpu,
          totalRam
        });
      }, 500);
    });
  }
};