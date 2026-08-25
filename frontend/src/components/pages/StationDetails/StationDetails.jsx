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

  

  const [startDate, setStartDate] = useState("2026-08-02");
  const [endDate, setEndDate] = useState("2026-08-04");

  // Granularitatea graficelor
  const [bucketSize, setBucketSize] = useState("1h");

 

  // Automat: începutul primei zile
  const startTime = `${startDate}T00:00:00+03:00`;

  // Automat: sfârșitul ultimei zile
  const endTime = `${endDate}T23:59:59+03:00`;

  

  const metrics = [
    "RFM_Energy_Consumption",
    "RFM_Energy_Monitoring",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume"
  ];

  

  useEffect(() => {

    const loadStations = async () => {

      try {

        const { data: nodes } =
          await getNodeNames();

        const stations = nodes.map(node => ({
          id: node,
          name: `gNB_${node}`
        }));

        setAvailableStations(stations);

        if (nodes.length > 0) {

          setSelectedGnb(nodes[0]);

          setCompareGnb(
            nodes[1] || nodes[0]
          );
        }

      } catch (error) {

        console.error(
          "Eroare la incarcarea statiilor:",
          error
        );

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

        const { data } =
          await getTelemetryData(
            selectedGnb,
            metrics,
            bucketSize,
            true,
            startTime,
            endTime
          );

        console.log(
          "STATION API:",
          data
        );

        const getValue = metric =>
          Number(
            data[metric]?.value ??
            data[metric]
          ) || 0;

        const power =
          getValue(
            "RFM_Energy_Consumption"
          );

        const voltage =
          getValue(
            "RFM_Energy_Monitoring"
          );

        const dlGb =
          getValue(
            "DL_Traffic_Volume"
          ) / (1024 ** 3);

        const ulGb =
          getValue(
            "UL_Traffic_Volume"
          ) / (1024 ** 3);

        const kwh =
          power / 1000;

        const efficiency =
          kwh > 0
            ? (dlGb + ulGb) / kwh
            : 0;

        const station = {

          id: selectedGnb,

          name:
            `gNB_${selectedGnb}`,

          power:
            +power.toFixed(2),

          voltage:
            +voltage.toFixed(2),

          kwh:
            +kwh.toFixed(4),

          eff:
            +efficiency.toFixed(4),

          dlGb:
            +dlGb.toFixed(4),

          ulGb:
            +ulGb.toFixed(4),

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

        console.error(
          `Eroare la incarcarea statiei ${selectedGnb}:`,
          error
        );

      }
    };

    loadStationData();

  }, [
    selectedGnb,
    startDate,
    endDate,
    bucketSize
  ]);

 

  useEffect(() => {

    if (
      !isComparing ||
      !compareGnb
    ) {
      return;
    }

    const loadCompareData = async () => {

      try {

        const { data } =
          await getTelemetryData(
            compareGnb,
            metrics,
            bucketSize,
            true,
            startTime,
            endTime
          );

        console.log(
          "COMPARE API:",
          data
        );

        const getValue = metric =>
          Number(
            data[metric]?.value ??
            data[metric]
          ) || 0;

        const power =
          getValue(
            "RFM_Energy_Consumption"
          );

        const voltage =
          getValue(
            "RFM_Energy_Monitoring"
          );

        const dlGb =
          getValue(
            "DL_Traffic_Volume"
          ) / (1024 ** 3);

        const ulGb =
          getValue(
            "UL_Traffic_Volume"
          ) / (1024 ** 3);

        const kwh =
          power / 1000;

        const efficiency =
          kwh > 0
            ? (dlGb + ulGb) / kwh
            : 0;

        setStationsData(prev => ({

          ...prev,

          [compareGnb]: {

            id: compareGnb,

            name:
              `gNB_${compareGnb}`,

            power:
              +power.toFixed(2),

            voltage:
              +voltage.toFixed(2),

            kwh:
              +kwh.toFixed(4),

            eff:
              +efficiency.toFixed(4),

            dlGb:
              +dlGb.toFixed(4),

            ulGb:
              +ulGb.toFixed(4),

            dlMbps: 0,
            ulMbps: 0,
            prb: 0,
            peakPrb: 0
          }

        }));

      } catch (error) {

        console.error(
          `Eroare la comparatia cu ${compareGnb}:`,
          error
        );

      }
    };

    loadCompareData();

  }, [
    compareGnb,
    isComparing,
    startDate,
    endDate,
    bucketSize
  ]);

 

  useEffect(() => {

    if (!selectedGnb) {
      return;
    }

    const loadHistory = async () => {

      try {

        const { data } =
          await getTelemetryData(
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

        console.log(
          "HISTORY API:",
          data
        );

        const nodesData =
          Array.isArray(data)
            ? data
            : [data];

        const history = [];

        nodesData.forEach(node => {

          const powerData =
            node[
              "RFM_Energy_Consumption"
            ] || [];

          const prbData =
            node["PRB_DL"] || [];

          const peakPrbData =
            node["Peak_PRB"] || [];

          const length =
            Math.max(
              powerData.length,
              prbData.length,
              peakPrbData.length
            );

          for (
            let i = 0;
            i < length;
            i++
          ) {

            const powerItem =
              powerData[i] || {};

            const prbItem =
              prbData[i] || {};

            const peakPrbItem =
              peakPrbData[i] || {};

            const rawTime =
              powerItem.bucket_time ||
              prbItem.bucket_time ||
              peakPrbItem.bucket_time ||
              "";

            const power =
              Number(
                powerItem[
                  "RFM_Energy_Consumption"
                ]
              ) || 0;

            const prb =
              Number(
                prbItem["PRB_DL"]
              ) || 0;

            const prbPeak =
              Number(
                peakPrbItem["Peak_PRB"]
              ) || 0;

           

            let formattedTime = '';

            if (rawTime) {

              const cleanTime =
                rawTime
                  .trim()
                  .replace(" ", "T");

              const datePart =
                cleanTime.substring(
                  0,
                  10
                );

              const timePart =
                cleanTime.substring(
                  11,
                  16
                );

              if (
                datePart.length === 10 &&
                timePart.length === 5
              ) {

                formattedTime =
                  `${datePart.substring(8, 10)}/` +
                  `${datePart.substring(5, 7)} ` +
                  `${timePart}`;
              }
            }

            history.push({

              rawTime,

              time:
                formattedTime,

              power:
                +power.toFixed(2),

              prb:
                +prb.toFixed(2),

              prbPeak:
                +prbPeak.toFixed(2)
            });
          }
        });

       

        history.sort(
          (a, b) =>
            String(a.rawTime)
              .localeCompare(
                String(b.rawTime)
              )
        );

        console.log(
          "HISTORY:",
          history
        );

        setStationHistoryData(
          history
        );

      } catch (error) {

        console.error(
          "Eroare la incarcarea istoricului:",
          error
        );

      }
    };

    loadHistory();

  }, [
    selectedGnb,
    startDate,
    endDate,
    bucketSize
  ]);

 

  const currentSt =
    stationsData[selectedGnb] || {

      id: selectedGnb,

      name:
        `gNB_${selectedGnb}`,

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

  

  const compareSt =
    stationsData[compareGnb] ||
    currentSt;

  

  const handleExportPDF = () => {
    window.print();
  };

 

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

        availableStations={
          availableStations
        }

        selectedGnb={
          selectedGnb
        }

        setSelectedGnb={
          setSelectedGnb
        }

        compareGnb={
          compareGnb
        }

        setCompareGnb={
          setCompareGnb
        }

        isComparing={
          isComparing
        }

        setIsComparing={
          setIsComparing
        }

        
        startTime={
          startDate
        }

        setStartTime={
          setStartDate
        }

        endTime={
          endDate
        }

        setEndTime={
          setEndDate
        }

        bucketSize={
          bucketSize
        }

        setBucketSize={
          setBucketSize
        }

        currentSt={
          currentSt
        }

        handleExportPDF={
          handleExportPDF
        }

      />

      <StationPanelsGrid

        currentSt={
          currentSt
        }

        compareSt={
          compareSt
        }

        isComparing={
          isComparing
        }

      />

      <StationChartsGrid
  data={stationHistoryData}
  bucketSize={bucketSize}
  onBucketChange={setBucketSize}
/>

    </div>
  );
}