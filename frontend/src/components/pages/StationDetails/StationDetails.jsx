import React, { useState, useEffect } from 'react';

import {
  getNodeNames,
  getTelemetryData
} from "../../../api";

import StationHeader from './components/StationHeader/StationHeader';
import StationPanelsGrid from './components/StationPanelsGrid/StationPanelsGrid';
import StationChartsGrid from './components/StationChartsGrid/StationChartsGrid';

import './StationDetails.css';

export default function StationDetails() {
  const [availableStations, setAvailableStations] = useState([]);
  const [stationsData, setStationsData] = useState({});
  const [stationHistoryData, setStationHistoryData] = useState([]);

  const [selectedGnb, setSelectedGnb] = useState('');
  const [compareGnb, setCompareGnb] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [loading, setLoading] = useState(true);

  const startTime = "2026-08-02T00:00:00+03:00";
  const endTime = "2026-08-04T00:00:00+03:00";

  // 1. Am înlocuit cu numele REALE ale metricilor din baza de date SQL
  const metrics = [
    "VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE",     // Putere
    "VS.SBTS_RFM_Energy_Monitoring.MAX_INPUT_VOLTAGE_IN_RF", // Voltaj
    "VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN",             // Trafic DL
    "VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN"              // Trafic UL
  ];

  // Încarcă lista de stații
  useEffect(() => {
    const loadStations = async () => {
      try {
        const { data: nodes } = await getNodeNames();

        const stations = nodes.map(node => ({
          id: node,
          name: `gNB_${node}`
        }));

        setAvailableStations(stations);

        if (nodes.length > 0) {
          setSelectedGnb(nodes[0]);
          setCompareGnb(nodes[1] || nodes[0]);
        }

      } catch (error) {
        console.error("Eroare la încărcarea stațiilor:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  // Încarcă datele pentru stația selectată
  useEffect(() => {
    if (!selectedGnb) return;

    const loadStationData = async () => {
      try {
        const { data } = await getTelemetryData(
          selectedGnb,
          metrics,
          "1d",
          true,
          startTime,
          endTime
        );

        const getValue = metric =>
          Number(
            data[metric]?.value ??
            data[metric]
          ) || 0;

        // 2. Extragem datele folosind cheile noi
        const power = getValue("VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE");
        const voltage = getValue("VS.SBTS_RFM_Energy_Monitoring.MAX_INPUT_VOLTAGE_IN_RF");
        const dlBytes = getValue("VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN");
        const ulBytes = getValue("VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN");

        const dlGb = dlBytes / (1024 ** 3);
        const ulGb = ulBytes / (1024 ** 3);
        const kwh = power / 1000;
        const efficiency = kwh > 0 ? (dlGb + ulGb) / kwh : 0;

        const station = {
          id: selectedGnb,
          name: `gNB_${selectedGnb}`,
          power: +power.toFixed(2),
          voltage: +voltage.toFixed(2),
          kwh: +kwh.toFixed(4),
          eff: +efficiency.toFixed(4),
          dlGb: +dlGb.toFixed(4),
          ulGb: +ulGb.toFixed(4),
          dlMbps: 0,
          ulMbps: 0,
          prb: 0,
          peakPrb: 0
        };

        setStationsData(prev => ({
          ...prev,
          [selectedGnb]: station
        }));

      } catch (error) {
        console.error(`Eroare la încărcarea stației ${selectedGnb}:`, error);
      }
    };

    loadStationData();
  }, [selectedGnb]);

  // Încarcă stația de comparație
  useEffect(() => {
    if (!isComparing || !compareGnb) return;

    const loadCompareData = async () => {
      try {
        const { data } = await getTelemetryData(
          compareGnb,
          metrics,
          "1d",
          true,
          startTime,
          endTime
        );

        const getValue = metric =>
          Number(
            data[metric]?.value ??
            data[metric]
          ) || 0;

        const power = getValue("VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE");
        const voltage = getValue("VS.SBTS_RFM_Energy_Monitoring.MAX_INPUT_VOLTAGE_IN_RF");
        const dlBytes = getValue("VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN");
        const ulBytes = getValue("VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN");

        const dlGb = dlBytes / (1024 ** 3);
        const ulGb = ulBytes / (1024 ** 3);
        const kwh = power / 1000;
        const efficiency = kwh > 0 ? (dlGb + ulGb) / kwh : 0;

        setStationsData(prev => ({
          ...prev,
          [compareGnb]: {
            id: compareGnb,
            name: `gNB_${compareGnb}`,
            power: +power.toFixed(2),
            voltage: +voltage.toFixed(2),
            kwh: +kwh.toFixed(4),
            eff: +efficiency.toFixed(4),
            dlGb: +dlGb.toFixed(4),
            ulGb: +ulGb.toFixed(4),
            dlMbps: 0,
            ulMbps: 0,
            prb: 0,
            peakPrb: 0
          }
        }));

      } catch (error) {
        console.error(`Eroare la comparația cu ${compareGnb}:`, error);
      }
    };

    loadCompareData();
  }, [compareGnb, isComparing]);

  // Istoric pentru grafice
  useEffect(() => {
    if (!selectedGnb) return;

    const loadHistory = async () => {
      try {
        const { data } = await getTelemetryData(
          selectedGnb,
          ["VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE"], // Metrica corectă pentru grafic
          "1h",
          false, // False pentru a primi seria de timp
          startTime,
          endTime
        );

        const nodesData = Array.isArray(data) ? data : [data];
        const history = [];

        nodesData.forEach(node => {
          // Accesăm array-ul cu paranteze pătrate din cauza punctelor din string
          const powerData = node["VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE"] || [];

          powerData.forEach(item => {
            const rawTime = item.bucket_time;

            history.push({
              rawTime,
              time: rawTime?.split(" ")[1]?.substring(0, 5),
              power: Number(item["VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE"]) || 0,
              prb: 0,
              prbPeak: 0
            });
          });
        });

        history.sort(
          (a, b) =>
            new Date(a.rawTime.replace(" ", "T")) -
            new Date(b.rawTime.replace(" ", "T"))
        );

        setStationHistoryData(history);

      } catch (error) {
        console.error("Eroare la încărcarea istoricului:", error);
      }
    };

    loadHistory();
  }, [selectedGnb]);

  const currentSt = stationsData[selectedGnb] || {
    id: selectedGnb,
    name: `gNB_${selectedGnb}`,
    power: 0, voltage: 0, kwh: 0, eff: 0,
    dlGb: 0, ulGb: 0, dlMbps: 0, ulMbps: 0, prb: 0, peakPrb: 0
  };

  const compareSt = stationsData[compareGnb] || currentSt;

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return <p className="status-loading">Se încarcă stațiile...</p>;
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
        currentSt={currentSt}
        handleExportPDF={handleExportPDF}
      />

      <StationPanelsGrid
        currentSt={currentSt}
        compareSt={compareSt}
        isComparing={isComparing}
      />

      <StationChartsGrid
        data={stationHistoryData}
      />
    </div>
  );
}