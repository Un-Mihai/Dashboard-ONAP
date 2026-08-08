import re
import os
from lxml import etree
from datetime import datetime
from sqlalchemy.orm import Session
from collections.abc import Generator

from file_manager import get_unparsed_files, marked_parsed
from crud import get_followed_metrics, save_batch


def parse_file(followed_metrics: list[str], file_path: str) -> Generator[dict[str, str | int], None, None]:

    namespace = os.getenv('XML_NAMESPACE')

    granPeriod_tag = f"{{{namespace}}}granPeriod"
    measData_tag = f"{{{namespace}}}measData"
    measEntity_tag = f"{{{namespace}}}measEntity"
    measInfo_tag = f"{{{namespace}}}measInfo"
    measType_tag = f"{{{namespace}}}measType"
    measValue_tag = f"{{{namespace}}}measValue"
    r_tag = f"{{{namespace}}}r"

    file_data = etree.iterparse(file_path, events=('start', 'end'))

    for event, elem in file_data:
        if event == 'start' and elem.tag == measData_tag:
            begin_time = elem.get('beginTime')
            break

        if event == 'start' and elem.tag == measEntity_tag:
            break

    metrics = {}

    for event, elem in file_data:

        if event == 'start' and elem.tag == measEntity_tag:
            localDn_str = elem.get('localDn')
            node_name = localDn_str.split('=')[1]
            continue
        
        if event == 'start' and elem.tag == measInfo_tag:
            metrics.clear()
            continue

        if event == 'end' and elem.tag == granPeriod_tag:
            duration_str = elem.get('duration')
            granularity = re.search(r'\d+', duration_str).group()
            continue

        if event == 'end' and elem.tag == measType_tag and elem.text in followed_metrics:
            id = elem.get('p')
            metrics[id] = elem.text

            elem.clear()
            parent = elem.getparent()
            if parent is not None:
                parent.remove(elem)
            continue

        if event == 'end' and elem.tag == measValue_tag:
            measObjLdn_string = elem.get('measObjLdn')
            pairs = measObjLdn_string.split(',')
            measObjLdn_dict = dict(p.split('=', 1) for p in pairs if '=' in p)

            if "NRCELL" in measObjLdn_dict.keys():
                object_type = "Cell"
                cell_nr = measObjLdn_dict.get('NRCELL')

                for r in elem.findall(r_tag):
                    
                    id = r.get('p')
                    metric_name = metrics.get(id)

                    if metric_name is not None:
                        yield {
                            "node_name": node_name,
                            "object_type": object_type,
                            "object_id": int(cell_nr),
                            "measurement_type": metric_name,
                            "measurement_value": int(r.text),
                            "begin_time": datetime.fromisoformat(begin_time),
                            "granularity": int(granularity)
                        }

            elem.clear()
            parent = elem.getparent()

            if parent is not None:
                parent.remove(elem)


def parse_files(db: Session) -> dict[str, list[dict[str, str | int]]]:

    batch_size = int(os.getenv('BATCH_SIZE', '1000'))

    followed_metrics = get_followed_metrics(db)

    for file in get_unparsed_files():
        batch = []

        for telemetry_data in parse_file(followed_metrics, file):
            batch.append(telemetry_data)

            if len(batch) > batch_size:
                save_batch(db, batch)

        if batch:
            save_batch(db, batch)

        marked_parsed(file)