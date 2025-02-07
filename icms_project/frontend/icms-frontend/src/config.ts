interface Config {
  apiUrl: string;
  appName: string;
  version: string;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  appName: import.meta.env.VITE_APP_NAME || 'ICMS - Integrated Clinic Management System',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

export default config;
