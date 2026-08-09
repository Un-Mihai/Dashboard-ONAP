

metrics = {
    "DL_Traffic_Volume": {
        "Type": 'RAW',
        "Components": ['VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN'],
        "Formula": 'VS_NRASU_PDCP_SDU_USDAT_VOL_DL_SA_PLMN',
        "Aggregation": 'SUM',
        "Units": 'Kb'
    },
    "UL_Traffic_Volume": {
        "Type": 'RAW',
        "Components": ['VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN'],
        "Formula": 'VS_NRASU_PDCP_SDU_USDAT_VOL_UL_SA_PLMN',
        "Aggregation": 'SUM',
        "Units": 'Kb'
    },
    "DL_Throughput": {
        "Type": 'COMPOSITE',
        "Components": ['GRANULARITY', 'VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN'],
        "Formula": 'VS_NRASU_PDCP_SDU_USDAT_VOL_DL_SA_PLMN * 8 / GRANULARITY',
        "Aggregation": 'SUM',
        "Units": 'KB/s'
    },
    "UL_Throughput": {
        "Type": 'COMPOSITE',
        "Components": ['GRANULARITY', 'VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN'],
        "Formula": 'VS_NRASU_PDCP_SDU_USDAT_VOL_UL_SA_PLMN * 8 / GRANULARITY',
        "Aggregation": 'SUM',
        "Units": 'KB/s'
    },
    "PRB_DL": {
        "Type": 'COMPOSITE',
        "Components": ['VS.NCUPNRG.DL_PRB_USED_DATA_NRG', 'VS.NCUPNRG.DL_PRB_UTIL_RATIO_DNOM'],
        "Formula": 'VS_NCUPNRG_DL_PRB_USED_DATA_NRG / VS_NCUPNRG_DL_PRB_UTIL_RATIO_DNOM * 100',
        "Aggregation": 'AVG',
        "Units": '%'
    },
    "PRB_UL": {
        "Type": 'COMPOSITE',
        "Components": ['VS.NCUPNRG.UL_PRB_USED_DATA_NRG', 'VS.NCUPNRG.UL_PRB_UTIL_RATIO_DNOM'],
        "Formula": 'VS_NCUPNRG_UL_PRB_USED_DATA_NRG / VS_NCUPNRG_UL_PRB_UTIL_RATIO_DNOM * 100',
        "Aggregation": 'AVG',
        "Units": '%'
    },
    "Peak_PRB": {
        "Type": 'RAW',
        "Components": ['VS.NCUPNRG.DL_PRB_UTIL_SLOT_MAX_NRG'],
        "Formula": 'VS_NCUPNRG_DL_PRB_UTIL_SLOT_MAX_NRG',
        "Aggregation": 'MAX',
        "Units": '%'
    },
    "Cell_Availability": {
        "Type": 'COMPOSITE',
        "Components": ['VS.NCAV.SAMPLES_CELL_AVAIL', 'VS.NCAV.DENOM_CELL_AVAIL'],
        "Formula": 'VS_NCAV_SAMPLES_CELL_AVAIL / VS_NCAV_DENOM_CELL_AVAIL * 100',
        "Aggregation": 'SUM',
        "Units": '%'
    },
    "RFM_Energy_Monitoring": {
        "Type": 'COMPOSITE',
        "Components": ['VS.SBTS_RFM_Energy_Monitoring.MIN_INPUT_VOLTAGE_IN_RF', 'VS.SBTS_RFM_Energy_Monitoring.MAX_INPUT_VOLTAGE_IN_RF'],
        "Formula": '(VS_SBTS_RFM_Energy_Monitoring_MIN_INPUT_VOLTAGE_IN_RF + VS_SBTS_RFM_Energy_Monitoring_MAX_INPUT_VOLTAGE_IN_RF) / 2000',
        "Aggregation": 'AVG',
        "Units": 'V'
    },
    "RFM_Energy_Consumption": {
        "Type": 'RAW',
        "Components": ['VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE'],
        "Formula": 'VS_SBTS_RFM_Energy_Monitoring_RU_AVG_PWR_USAGE / 1000',
        "Aggregation": 'SUM',
        "Units": 'W'
    }
}