import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Flame, Wind, Zap } from 'lucide-react';
import { format } from 'date-fns';

import SensorCard from '../components/SensorCard';
import StatusBadge from '../components/StatusBadge';
import SensorLineChart from '../components/LineChart';
import { 
  fetchSensor1Data, 
  fetchSensor2Data, 
  fetchFireSmokeData, 
  fetchElectricityData 
} from '../api/api';
import { SensorData, ApiAsapData, ListrikData } from '../types';

const Dashboard: React.FC = () => {
  const [sensor1Data, setSensor1Data] = useState<SensorData | null>(null);
  const [sensor2Data, setSensor2Data] = useState<SensorData | null>(null);
  const [fireSmokeData, setFireSmokeData] = useState<ApiAsapData | null>(null);
  const [electricityData, setElectricityData] = useState<ListrikData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds

  // Mock historical data for charts
  const tempData = [
    { name: '00:00', sensor1: 23, sensor2: 24 },
    { name: '04:00', sensor1: 22, sensor2: 23 },
    { name: '08:00', sensor1: 24, sensor2: 25 },
    { name: '12:00', sensor1: 26, sensor2: 27 },
    { name: '16:00', sensor1: 25, sensor2: 26 },
    { name: '20:00', sensor1: 24, sensor2: 25 },
    { name: '24:00', sensor1: sensor1Data?.suhu || 23, sensor2: sensor2Data?.suhu || 24 },
  ];

  const humidityData = [
    { name: '00:00', sensor1: 55, sensor2: 58 },
    { name: '04:00', sensor1: 56, sensor2: 59 },
    { name: '08:00', sensor1: 54, sensor2: 57 },
    { name: '12:00', sensor1: 52, sensor2: 55 },
    { name: '16:00', sensor1: 53, sensor2: 56 },
    { name: '20:00', sensor1: 54, sensor2: 57 },
    { name: '24:00', sensor1: sensor1Data?.kelembapan || 55, sensor2: sensor2Data?.kelembapan || 58 },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch data from all sensors
      const [sensor1, sensor2, fireSmoke, electricity] = await Promise.all([
        fetchSensor1Data(),
        fetchSensor2Data(),
        fetchFireSmokeData(),
        fetchElectricityData()
      ]);
      
      setSensor1Data(sensor1);
      setSensor2Data(sensor2);
      setFireSmokeData(fireSmoke);
      setElectricityData(electricity);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusFromTemp = (temp: number) => {
    if (temp < 10) return 'critical';
    if (temp > 35) return 'critical';
    if (temp < 18 || temp > 30) return 'warning';
    return 'normal';
  };

  const getStatusFromHumidity = (humidity: number) => {
    if (humidity < 20) return 'critical';
    if (humidity > 80) return 'critical';
    if (humidity < 30 || humidity > 70) return 'warning';
    return 'normal';
  };

  const getStatusFromFire = (fireValue: number) => {
    if (fireValue > 80) return 'critical';
    if (fireValue > 50) return 'warning';
    return 'normal';
  };

  const getStatusFromSmoke = (smokeValue: number) => {
    if (smokeValue > 80) return 'critical';
    if (smokeValue > 50) return 'warning';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Monitoring Dashboard</h2>
          <p className="text-gray-400">
            Real-time sensor data from UMM-BSID monitoring systems
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <p className="text-sm text-gray-400">
            Last updated: {format(lastUpdate, 'dd MMM yyyy HH:mm:ss')}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-400 mr-2">Auto refresh:</span>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-gray-700 text-white text-sm rounded-md border-0 focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
            <button 
              onClick={fetchData}
              className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature Sensors */}
        <SensorCard
          title="Temperature (Sensor 1)"
          value={sensor1Data?.suhu || 0}
          unit="°C"
          icon={<Thermometer size={24} className="text-red-400" />}
          color="border-red-600"
          isLoading={loading}
          trend={sensor1Data?.suhu && sensor1Data.suhu > 25 ? 'up' : 'down'}
        />
        
        <SensorCard
          title="Temperature (Sensor 2)"
          value={sensor2Data?.suhu || 0}
          unit="°C"
          icon={<Thermometer size={24} className="text-orange-400" />}
          color="border-orange-600"
          isLoading={loading}
          trend={sensor2Data?.suhu && sensor2Data.suhu > 25 ? 'up' : 'down'}
        />
        
        {/* Humidity Sensors */}
        <SensorCard
          title="Humidity (Sensor 1)"
          value={sensor1Data?.kelembapan || 0}
          unit="%"
          icon={<Droplets size={24} className="text-blue-400" />}
          color="border-blue-600"
          isLoading={loading}
          trend={sensor1Data?.kelembapan && sensor1Data.kelembapan > 60 ? 'up' : 'down'}
        />
        
        <SensorCard
          title="Humidity (Sensor 2)"
          value={sensor2Data?.kelembapan || 0}
          unit="%"
          icon={<Droplets size={24} className="text-indigo-400" />}
          color="border-indigo-600"
          isLoading={loading}
          trend={sensor2Data?.kelembapan && sensor2Data.kelembapan > 60 ? 'up' : 'down'}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fire & Smoke Sensors */}
        <SensorCard
          title="Fire Detection"
          value={fireSmokeData?.api_value || 0}
          unit="%"
          icon={<Flame size={24} className="text-red-400" />}
          color="border-red-600"
          isLoading={loading}
        />
        
        <SensorCard
          title="Smoke Detection"
          value={fireSmokeData?.asap_value || 0}
          unit="%"
          icon={<Wind size={24} className="text-gray-400" />}
          color="border-gray-600"
          isLoading={loading}
        />
        
        {/* Electricity */}
        <SensorCard
          title="Voltage (3-Phase)"
          value={electricityData?.voltage_3ph || 0}
          unit="V"
          icon={<Zap size={24} className="text-yellow-400" />}
          color="border-yellow-600"
          isLoading={loading}
        />
        
        <SensorCard
          title="Power (3-Phase)"
          value={electricityData?.power_3ph || 0}
          unit="W"
          icon={<Zap size={24} className="text-green-400" />}
          color="border-green-600"
          isLoading={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorLineChart 
          title="Temperature Trends (24h)"
          data={tempData}
          lines={[
            { id: 'sensor1', name: 'Sensor 1', color: '#f87171' },
            { id: 'sensor2', name: 'Sensor 2', color: '#fb923c' }
          ]}
          xAxisLabel="Time"
          yAxisLabel="Temperature (°C)"
        />
        
        <SensorLineChart 
          title="Humidity Trends (24h)"
          data={humidityData}
          lines={[
            { id: 'sensor1', name: 'Sensor 1', color: '#60a5fa' },
            { id: 'sensor2', name: 'Sensor 2', color: '#818cf8' }
          ]}
          xAxisLabel="Time"
          yAxisLabel="Humidity (%)"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-white text-base font-medium mb-3">Sensor Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Temperature (S1)</span>
              <StatusBadge 
                status={sensor1Data?.suhu ? getStatusFromTemp(sensor1Data.suhu) : 'offline'} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Temperature (S2)</span>
              <StatusBadge 
                status={sensor2Data?.suhu ? getStatusFromTemp(sensor2Data.suhu) : 'offline'} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Humidity (S1)</span>
              <StatusBadge 
                status={sensor1Data?.kelembapan ? getStatusFromHumidity(sensor1Data.kelembapan) : 'offline'} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Humidity (S2)</span>
              <StatusBadge 
                status={sensor2Data?.kelembapan ? getStatusFromHumidity(sensor2Data.kelembapan) : 'offline'} 
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-white text-base font-medium mb-3">Safety Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fire Detection</span>
              <StatusBadge 
                status={fireSmokeData?.api_value ? getStatusFromFire(fireSmokeData.api_value) : 'offline'} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Smoke Detection</span>
              <StatusBadge 
                status={fireSmokeData?.asap_value ? getStatusFromSmoke(fireSmokeData.asap_value) : 'offline'} 
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Network Status</span>
              <StatusBadge status="normal" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">System Status</span>
              <StatusBadge status="normal" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg col-span-1 md:col-span-2">
          <h3 className="text-white text-base font-medium mb-3">Server Information</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <span className="text-gray-400 text-sm">Hostname:</span>
              <p className="text-white">dev-suhu.umm.ac.id</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">IP Address:</span>
              <p className="text-white">10.10.1.25</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Database Server:</span>
              <p className="text-white">10.10.11.27</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Database:</span>
              <p className="text-white">suhu</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Uptime:</span>
              <p className="text-white">23 days, 4 hours</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Last Maintenance:</span>
              <p className="text-white">2025-03-15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;