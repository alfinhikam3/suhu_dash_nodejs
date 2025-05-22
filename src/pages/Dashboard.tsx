import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import StatusBadge from '../components/StatusBadge';
import SensorGauge from '../components/GaugeChart';
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
  const [refreshInterval, setRefreshInterval] = useState<number>(30);

  const fetchData = async () => {
    setLoading(true);
    try {
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
    const interval = setInterval(fetchData, refreshInterval * 1000);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SensorGauge
          title="Phase R Voltage"
          value={electricityData?.phase_r || 0}
          minValue={180}
          maxValue={260}
          unit="V"
          colorStart="#10b981"
          colorEnd="#ef4444"
        />
        
        <SensorGauge
          title="Phase S Voltage"
          value={electricityData?.phase_s || 0}
          minValue={180}
          maxValue={260}
          unit="V"
          colorStart="#10b981"
          colorEnd="#ef4444"
        />
        
        <SensorGauge
          title="Phase T Voltage"
          value={electricityData?.phase_t || 0}
          minValue={180}
          maxValue={260}
          unit="V"
          colorStart="#10b981"
          colorEnd="#ef4444"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SensorGauge
          title="Power Factor R"
          value={electricityData?.pf_r || 0}
          minValue={0}
          maxValue={1}
          unit=""
          colorStart="#ef4444"
          colorEnd="#10b981"
          showPercent={true}
        />
        
        <SensorGauge
          title="Power Factor S"
          value={electricityData?.pf_s || 0}
          minValue={0}
          maxValue={1}
          unit=""
          colorStart="#ef4444"
          colorEnd="#10b981"
          showPercent={true}
        />
        
        <SensorGauge
          title="Power Factor T"
          value={electricityData?.pf_t || 0}
          minValue={0}
          maxValue={1}
          unit=""
          colorStart="#ef4444"
          colorEnd="#10b981"
          showPercent={true}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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