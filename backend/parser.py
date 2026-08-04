from lxml import etree

lista_indicatori = ["VS.NCAV.DENOM_CELL_AVAIL",
                    "VS.NCAV.SAMPLES_CELL_AVAIL",
                    "VS.NCUPNRG.DL_PRB_USED_DATA_NRG",
                    "VS.NCUPNRG.DL_PRB_UTIL_RATIO_DNOM",
                    "VS.NCUPNRG.DL_PRB_UTIL_SLOT_MAX_NRG",
                    "VS.NCUPNRG.UL_PRB_UTIL_RATIO_DNOM",
                    "VS.NRASU.PDCP_SDU_USDAT_VOL_DL_SA_PLMN",
                    "VS.NRASU.PDCP_SDU_USDAT_VOL_UL_SA_PLMN",
                    "VS.SBTS_RFM_Energy_Monitoring.MAX_INPUT_VOLTAGE_IN_RF",
                    "VS.SBTS_RFM_Energy_Monitoring.MIN_INPUT_VOLTAGE_IN_RF",
                    "VS.SBTS_RFM_Energy_Monitoring.RU_AVG_PWR_USAGE"]

def parse_file():

    file_path = "../files/A20260803.1315+0200-20260803.1330+0200_ManagedElement=MRBTS-43620.xml"

    namespace = "http://www.3gpp.org/ftp/specs/archive/28_series/28.532#measData"

    measInfo_tag = f"{{{namespace}}}measInfo"
    measType_tag = f"{{{namespace}}}measType"
    measValue_tag = f"{{{namespace}}}measValue"
    r_tag = f"{{{namespace}}}r"

    context = etree.iterparse(file_path, events=('start', 'end'))

    metrics = {}

    for event, elem in context:
        
        if event == 'start' and elem.tag == measInfo_tag:
            metrics.clear()

        elif event == 'end' and elem.tag == measType_tag and elem.text in lista_indicatori:
            id = elem.get('p')
            metrics[id] = elem.text

            elem.clear()
            parent = elem.getparent()
            if parent is not None:
                parent.remove(elem)

        elif event == 'end' and elem.tag == measValue_tag:
            cell_id = elem.get('measObjLdn')

            for r in elem.findall(r_tag):
                
                id = r.get('p')
                metric_name = metrics.get(id)

                if metric_name is not None:
                    yield {
                        "cell": cell_id,
                        "metric_name": metric_name,
                        "value": r.text 
                    }

            elem.clear()
            parent = elem.getparent()

            if parent is not None:
                parent.remove(elem)