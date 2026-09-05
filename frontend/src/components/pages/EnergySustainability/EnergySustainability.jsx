import React, { useState, useEffect } from 'react';
import { getNodeNames, getTelemetryData } from "../../../api";
import { toGB, extractMetric, extractItemData } from "../../../formatters";

import TotalEnergyCard from './components/TotalEnergyCard/TotalEnergyCard';
import AveragePowerCard from './components/AveragePowerCard/AveragePowerCard';
import AverageVoltageCard from './components/AverageVoltageCard/AverageVoltageCard';
import EnergyEfficiencyCard from './components/EnergyEfficiencyCard/EnergyEfficiencyCard';
import TopConsumersChart from './components/TopConsumersChart/TopConsumersChart';
import EfficiencyTrendChart from './components/EfficiencyTrendChart/EfficiencyTrendChart';
import EnergySustainabilityTable from './components/EnergySustainabilityTable/EnergySustainabilityTable';

import './EnergySustainability.css';

export default function EnergySustainability({ viewMode }) {
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedStation, setSelectedStation] = useState('ALL');
  const [chartBucketSize, setChartBucketSize] = useState('15m');
  const [availableNodes, setAvailableNodes] = useState([]);

  const [selectedMetric, setSelectedMetric] = useState('efficiency_trend');

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });

  const startIso = `${startDate}T00:00:00+03:00`;
  const endIso = `${endDate}T23:59:59+03:00`;

  const metrics = [
    "RFM_Energy_Consumption",
    "RFM_Energy_Monitoring",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume"
  ];

  const extractTime = (item) => {
    return (
      item?.bucket_time ||
      item?.time ||
      item?.timestamp ||
      item?.period_start_time ||
      ""
    );
  };

  const formatDisplayTime = (timeStr, currentBucket) => {
    if (!timeStr) return "";

    const cleanTime = String(timeStr).trim();
    
    if (currentBucket === '1d') {
      const datePart =
        cleanTime.split(' ')[0] ||
        cleanTime.split('T')[0];

      if (datePart) {
        const parts = datePart.split('-');

        if (parts.length >= 3) {
          return `${parts[2]}.${parts[1]}`;
        }
      }

      return datePart.substring(0, 10);
    }
    
    let timePart = "";

    if (cleanTime.includes(' ')) {
      timePart = cleanTime.split(' ')[1];
    } else if (cleanTime.includes('T')) {
      timePart = cleanTime.split('T')[1];
    } else {
      timePart = cleanTime;
    }

    if (timePart) {
      return timePart.substring(0, 5);
    }

    return cleanTime;
  };

  useEffect(() => {
    const fetchEnergyData = async () => {
      setLoading(true);

      try {
        const { data: rawNodes } = await getNodeNames();

        const nodes = Array.isArray(rawNodes)
          ? rawNodes
          : (rawNodes?.nodes || []);

        setAvailableNodes(nodes);

        const targetNodes =
          selectedStation === 'ALL'
            ? nodes
            : nodes.filter(
                n => String(n) === String(selectedStation)
              );

        let detectedPowerUnit = 'W';
        let detectedVoltageUnit = 'V';

        const stationPromises = targetNodes.map(
          async (nodeName, index) => {
            try {
              const { data } = await getTelemetryData(
                nodeName,
                metrics,
                "1d",
                true,
                startIso,
                endIso
              );

              const powerMetric = extractMetric(data, "RFM_Energy_Consumption");
              const voltageMetric = extractMetric(data, "RFM_Energy_Monitoring");
              const dlMetric = extractMetric(data, "DL_Traffic_Volume");
              const ulMetric = extractMetric(data, "UL_Traffic_Volume");

              if (powerMetric.units) detectedPowerUnit = powerMetric.units;
              if (voltageMetric.units) detectedVoltageUnit = voltageMetric.units;

              const power = powerMetric.value;
              const voltage = voltageMetric.value;

              const dlGb = toGB(dlMetric.value, dlMetric.units);
              const ulGb = toGB(ulMetric.value, ulMetric.units);
              const trafficGb = dlGb + ulGb;

              const energyKwh = power > 0 ? (power / 1000) * 24 : 0;

              const efficiency = energyKwh > 0 ? trafficGb / energyKwh : 0;

              return {
                id: index + 1,
                node_name: nodeName,
                name: `gNB_${nodeName}`,
                voltage: +(voltage || 0).toFixed(2),
                voltage_unit: detectedVoltageUnit,
                power: +(power || 0).toFixed(2),
                power_unit: detectedPowerUnit,
                traffic: +(trafficGb || 0).toFixed(4),
                traffic_unit: 'GB',
                efficiency: +(efficiency || 0).toFixed(4),
                efficiency_unit: 'GB/kWh',
                energy: +(energyKwh || 0).toFixed(4),
                energy_unit: 'kWh'
              };

            } catch (error) {
              console.error(
                `Eroare agregare pentru stația ${nodeName}:`,
                error
              );
              return null;
            }
          }
        );

        const validStations = (await Promise.all(stationPromises)).filter(Boolean);

        let sumEnergy = 0;
        let sumPower = 0;
        let sumVoltage = 0;
        let sumTraffic = 0;
        let validVoltCount = 0;
        let validPowerCount = 0;

        validStations.forEach(st => {
          sumEnergy += st.energy;
          sumTraffic += st.traffic;
          if (st.power > 0) {
            sumPower += st.power;
            validPowerCount++;
          }
          if (st.voltage > 0) {
            sumVoltage += st.voltage;
            validVoltCount++;
          }
        });

        const topConsumersData = [...validStations]
          .sort((a, b) => b.power - a.power)
          .slice(0, 5)
          .map(({ name, power }) => ({
            name,
            power
          }));

        const trendMap = {};

        const addTrendVal = (t, key, val) => {
          if (!t) return;

          if (!trendMap[t]) {
            trendMap[t] = {
              rawTime: t,
              power: 0,
              voltage: 0,
              dl: 0,
              ul: 0
            };
          }

          trendMap[t][key] += Number(val) || 0;
        };

        for (const nodeName of targetNodes) {
          try {
            const { data } = await getTelemetryData(
              nodeName,
              metrics,
              chartBucketSize,
              false,
              startIso,
              endIso
            );

            const pArr = Array.isArray(data?.RFM_Energy_Consumption) ? data.RFM_Energy_Consumption : [];
            const vArr = Array.isArray(data?.RFM_Energy_Monitoring) ? data.RFM_Energy_Monitoring : [];
            const dlArr = Array.isArray(data?.DL_Traffic_Volume) ? data.DL_Traffic_Volume : [];
            const ulArr = Array.isArray(data?.UL_Traffic_Volume) ? data.UL_Traffic_Volume : [];

            pArr.forEach(item => {
              const t = extractTime(item);
              const { value: val } = extractItemData(item, "RFM_Energy_Consumption");
              addTrendVal(t, "power", val);
            });

            vArr.forEach(item => {
              const t = extractTime(item);
              const { value: val } = extractItemData(item, "RFM_Energy_Monitoring");
              addTrendVal(t, "voltage", val);
            });

            dlArr.forEach(item => {
              const t = extractTime(item);
              const { value: rawVal, units } = extractItemData(item, "DL_Traffic_Volume");
              const valGb = toGB(rawVal, units || item?.units || 'GB');
              addTrendVal(t, "dl", valGb);
            });

            ulArr.forEach(item => {
              const t = extractTime(item);
              const { value: rawVal, units } = extractItemData(item, "UL_Traffic_Volume");
              const valGb = toGB(rawVal, units || item?.units || 'Kb');
              addTrendVal(t, "ul", valGb);
            });

          } catch (err) {
            console.warn(`Eroare trend stația ${nodeName}:`, err);
          }
        }

        const count = validStations.length;

        const efficiencyTrendData = Object.values(trendMap)
          .sort((a, b) => String(a.rawTime).localeCompare(String(b.rawTime)))
          .map(item => {
            const trafficGb = item.dl + item.ul;
            const energyKwh = item.power > 0 ? item.power / 1000 : 0;
            const eficienta = energyKwh > 0 ? trafficGb / energyKwh : 0;
            const avgVolt = count > 0 ? item.voltage / count : item.voltage;

            return {
              time: formatDisplayTime(item.rawTime, chartBucketSize),
              eficienta: +(eficienta || 0).toFixed(4),
              power: +(item.power || 0).toFixed(2),
              voltage: +(avgVolt || 0).toFixed(2),
              traffic: +(trafficGb || 0).toFixed(4)
            };
          });

        const overallEfficiency = sumEnergy > 0 ? sumTraffic / sumEnergy : 0;

        setEnergyData({
          totalEnergy: +sumEnergy.toFixed(2),
          energyUnit: 'kWh',
          avgPower: validPowerCount > 0 ? +(sumPower / validPowerCount).toFixed(2) : 0,
          powerUnit: detectedPowerUnit,
          avgVoltage: validVoltCount > 0 ? +(sumVoltage / validVoltCount).toFixed(2) : 0,
          voltageUnit: detectedVoltageUnit,
          efficiency: +overallEfficiency.toFixed(4),
          efficiency_unit: 'GB/kWh',
          topConsumersData,
          efficiencyTrendData,
          stationEnergyData: validStations
        });

      } catch (error) {
        console.error("Eroare la încărcarea datelor Energy & Sustainability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();

  }, [selectedStation, chartBucketSize, startDate, endDate]);

  if (loading && !energyData) {
    return (
      <p className="status-loading">
        Se încarcă datele energetice...
      </p>
    );
  }

  return (
    <div className="energy-page-wrapper">

      <div className="filters-header">

        <div className="filter-group">
          <label htmlFor="energyStationSelect">
            Filtrează Stație:
          </label>

          <select
            id="energyStationSelect"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">
              Toate Stațiile (Overview General)
            </option>

            {availableNodes.map((node) => (
              <option key={node} value={node}>
                gNB_{node}
              </option>
            ))}
          </select>
        </div>

        <div className="date-picker-group">

          <div className="filter-group">
            <label>De la:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input-date"
            />
          </div>

          <div className="filter-group">
            <label>Până la:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input-date"
            />
          </div>

        </div>

      </div>

      {viewMode === 'grafic' ? (

        <div className="energy-container">

          <div className="energy-kpi-grid">
            <TotalEnergyCard
              value={energyData?.totalEnergy ?? 0}
              unit={energyData?.energyUnit}
            />

            <AveragePowerCard
              value={energyData?.avgPower ?? 0}
              unit={energyData?.powerUnit}
            />

            <AverageVoltageCard
              value={energyData?.avgVoltage ?? 0}
              unit={energyData?.voltageUnit}
            />

            <EnergyEfficiencyCard
              value={energyData?.efficiency ?? 0}
              unit={energyData?.efficiencyUnit}
            />
          </div>

          <TopConsumersChart
            data={energyData?.topConsumersData ?? []}
            powerUnit={energyData?.powerUnit}
          />

          <div className="filters-header" style={{ margin: '20px 0 12px 0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#c9d1d9', fontSize: '16px', margin: 0, fontWeight: '600' }}>
              Evoluție Metrică Energie & Eficiență
            </h3>
            
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <label style={{ fontSize: '13px', color: '#8b949e', margin: 0 }}>
                Alege metrica:
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="filter-select"
                style={{ minWidth: '220px' }}
              >
                <option value="efficiency_trend">Eficiență Energetică (GB/kWh)</option>
                <option value="power">Consum Putere ({energyData?.powerUnit || 'W'})</option>
                <option value="voltage">Tensiune Medie ({energyData?.voltageUnit || 'V'})</option>
                <option value="traffic">Trafic Total (GB)</option>
              </select>
            </div>
          </div>

          <EfficiencyTrendChart
            data={energyData?.efficiencyTrendData ?? []}
            bucketSize={chartBucketSize}
            onBucketChange={(val) => setChartBucketSize(val)}
            selectedStation={selectedStation}
            selectedMetric={selectedMetric}
            powerUnit={energyData?.powerUnit}
            voltageUnit={energyData?.voltageUnit}
          />

        </div>

      ) : (

        <EnergySustainabilityTable
          stationEnergyData={energyData?.stationEnergyData ?? []}
        />

      )}

    </div>
  );
}