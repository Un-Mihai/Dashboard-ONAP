import React, { useState, useEffect } from 'react';
import {
  getNodeNames,
  getTelemetryData
} from "../../../api";

import {
  toGB,
  extractMetric,
  extractItemData,
  clampPercent
} from "../../../formatters";

import StationHeader from './components/StationHeader/StationHeader';
import StationPanelsGrid from './components/StationPanelsGrid/StationPanelsGrid';
import StationChartsGrid from './components/StationChartsGrid/StationChartsGrid';

import './StationDetails.css';

export default function StationDetails({ handleMultiPageExport }) {
  const [availableStations, setAvailableStations] = useState([]);
  const [stationsData, setStationsData] = useState({});
  const [stationHistoryData, setStationHistoryData] = useState([]);

  const [selectedGnb, setSelectedGnb] = useState('');
  const [compareGnb, setCompareGnb] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [bucketSize, setBucketSize] = useState("1h");

  const startTime = `${startDate}T00:00:00+03:00`;
  const endTime = `${endDate}T23:59:59+03:00`;

  const metrics = [
    "RFM_Energy_Consumption",
    "RFM_Energy_Monitoring",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume",
    "DL_Throughput",
    "UL_Throughput",
    "PRB_DL",
    "Peak_PRB"
  ];

  const formatDisplayTime = (timeStr, currentBucket) => {
    if (!timeStr) return "";
    
    const cleanTime = String(timeStr).trim();

    if (currentBucket === '1d') {
      const datePart = cleanTime.split(' ')[0] || cleanTime.split('T')[0];
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

  const parseStationTelemetry = (gnbId, rawData) => {
    const data = rawData || {};

    const powerM = extractMetric(data, "RFM_Energy_Consumption");
    const voltM = extractMetric(data, "RFM_Energy_Monitoring");
    const dlM = extractMetric(data, "DL_Traffic_Volume");
    const ulM = extractMetric(data, "UL_Traffic_Volume");
    const dlTpM = extractMetric(data, "DL_Throughput");
    const ulTpM = extractMetric(data, "UL_Throughput");
    const prbM = extractMetric(data, "PRB_DL");
    const peakPrbM = extractMetric(data, "Peak_PRB");

    const power = powerM.value;
    const voltage = voltM.value;
    const dlGb = toGB(dlM.value, dlM.units);
    const ulGb = toGB(ulM.value, ulM.units);
    const dlMbps = dlTpM.value;
    const ulMbps = ulTpM.value;
    const prb = clampPercent(prbM.value);
    const peakPrb = clampPercent(peakPrbM.value);

    const kwh = power > 0 ? (power / 1000) * 24 : 0;
    const efficiency = kwh > 0 ? (dlGb + ulGb) / kwh : 0;

    return {
      id: gnbId,
      name: `gNB_${gnbId}`,
      power: +power.toFixed(2),
      voltage: +voltage.toFixed(2),
      kwh: +kwh.toFixed(4),
      eff: +efficiency.toFixed(4),
      dlGb: +dlGb.toFixed(4),
      ulGb: +ulGb.toFixed(4),
      dlMbps: +dlMbps.toFixed(2),
      ulMbps: +ulMbps.toFixed(2),
      prb: +prb.toFixed(2),
      peakPrb: +peakPrb.toFixed(2)
    };
  };

  useEffect(() => {
    const loadStations = async () => {
      try {
        const { data: nodes } = await getNodeNames();

        const stations = (Array.isArray(nodes) ? nodes : (nodes?.nodes || [])).map(node => ({
          id: node,
          name: `gNB_${node}`
        }));

        setAvailableStations(stations);

        if (stations.length > 0) {
          setSelectedGnb(stations[0].id);
          setCompareGnb(stations[1]?.id || stations[0].id);
        }
      } catch (error) {
        console.error("Eroare la incarcarea statiilor:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    if (!selectedGnb) {
      return;
    }

    const loadStationData = async () => {
      try {
        const { data } = await getTelemetryData(
          selectedGnb,
          metrics,
          bucketSize,
          true,
          startTime,
          endTime
        );

        const station = parseStationTelemetry(selectedGnb, data);

        setStationsData(prev => ({
          ...prev,
          [selectedGnb]: station
        }));
      } catch (error) {
        console.error(`Eroare la incarcarea statiei ${selectedGnb}:`, error);
      }
    };

    loadStationData();
  }, [selectedGnb, startDate, endDate, bucketSize]);

  useEffect(() => {
    if (!isComparing || !compareGnb) {
      return;
    }

    const loadCompareData = async () => {
      try {
        const { data } = await getTelemetryData(
          compareGnb,
          metrics,
          bucketSize,
          true,
          startTime,
          endTime
        );

        const station = parseStationTelemetry(compareGnb, data);

        setStationsData(prev => ({
          ...prev,
          [compareGnb]: station
        }));
      } catch (error) {
        console.error(`Eroare la comparatia cu ${compareGnb}:`, error);
      }
    };

    loadCompareData();
  }, [compareGnb, isComparing, startDate, endDate, bucketSize]);

  useEffect(() => {
    if (!selectedGnb) {
      return;
    }

    const loadHistory = async () => {
      try {
        const { data } = await getTelemetryData(
          selectedGnb,
          [
            "RFM_Energy_Consumption",
            "PRB_DL",
            "Peak_PRB"
          ],
          bucketSize,
          false,
          startTime,
          endTime
        );

        const nodesData = Array.isArray(data) ? data : [data];
        const history = [];

        nodesData.forEach(node => {
          const powerData = Array.isArray(node?.RFM_Energy_Consumption) ? node.RFM_Energy_Consumption : [];
          const prbData = Array.isArray(node?.PRB_DL) ? node.PRB_DL : [];
          const peakPrbData = Array.isArray(node?.Peak_PRB) ? node.Peak_PRB : [];
          const length = Math.max(powerData.length, prbData.length, peakPrbData.length);

          for (let i = 0; i < length; i++) {
            const powerItem = powerData[i] || {};
            const prbItem = prbData[i] || {};
            const peakPrbItem = peakPrbData[i] || {};

            const rawTime =
              powerItem.bucket_time ||
              prbItem.bucket_time ||
              peakPrbItem.bucket_time ||
              "";

            const { value: power } = extractItemData(powerItem, "RFM_Energy_Consumption");
            const { value: rawPrb } = extractItemData(prbItem, "PRB_DL");
            const { value: rawPeak } = extractItemData(peakPrbItem, "Peak_PRB");

            const prb = clampPercent(rawPrb);
            const prbPeak = clampPercent(rawPeak);

            const formattedTime = formatDisplayTime(rawTime, bucketSize);

            history.push({
              rawTime,
              time: formattedTime,
              power: +power.toFixed(2),
              prb: +prb.toFixed(2),
              prbPeak: +prbPeak.toFixed(2)
            });
          }
        });

        history.sort((a, b) => String(a.rawTime).localeCompare(String(b.rawTime)));

        setStationHistoryData(history);
      } catch (error) {
        console.error("Eroare la incarcarea istoricului:", error);
      }
    };

    loadHistory();
  }, [selectedGnb, startDate, endDate, bucketSize]);

  const currentSt = stationsData[selectedGnb] || {
    id: selectedGnb,
    name: `gNB_${selectedGnb}`,
    power: 0,
    voltage: 0,
    kwh: 0,
    eff: 0,
    dlGb: 0,
    ulGb: 0,
    dlMbps: 0,
    ulMbps: 0,
    prb: 0,
    peakPrb: 0
  };

  const compareSt = stationsData[compareGnb] || currentSt;

  if (loading) {
    return (
      <p className="status-loading">
        Se incarca statiile...
      </p>
    );
  }

  return (
    <div className="station-details-container">
      <StationHeader
        availableStations={availableStations}
        selectedGnb={selectedGnb}
        setSelectedGnb={setSelectedGnb}
        compareGnb={compareGnb}
        setCompareGnb={setCompareGnb}
        isComparing={isComparing}
        setIsComparing={setIsComparing}
        startTime={startDate}
        setStartTime={setStartDate}
        endTime={endDate}
        setEndTime={setEndDate}
        bucketSize={bucketSize}
        setBucketSize={setBucketSize}
        currentSt={currentSt}
        handleMultiPageExport={handleMultiPageExport} 
      />

      <StationPanelsGrid
        currentSt={currentSt}
        compareSt={compareSt}
        isComparing={isComparing}
      />

      <StationChartsGrid
        data={stationHistoryData}
        bucketSize={bucketSize}
        onBucketChange={setBucketSize}
      />
    </div>
  );
}