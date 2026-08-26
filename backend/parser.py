import re
import os
from lxml import etree
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from collections.abc import Generator

from file_manager import get_all_files, mark_file
from crud import get_followed_indicators, save_batch, check_file_is_parsed, save_file_name

def clear_memory(elem):
    elem.clear()
    parent = elem.getparent()
    if parent is not None:
        parent.remove(elem)


def extract_data(followed_metrics: list[str], file_path: str) -> Generator[dict[str, str | int], None, None]:

    namespace = os.getenv('XML_NAMESPACE')
    fileHeader_tag = f"{{{namespace}}}fileHeader"
    fileSender_tag = f"{{{namespace}}}fileSender"
    granPeriod_tag = f"{{{namespace}}}granPeriod"
    measData_tag = f"{{{namespace}}}measData"
    #measEntity_tag = f"{{{namespace}}}measEntity"
    measInfo_tag = f"{{{namespace}}}measInfo"
    measType_tag = f"{{{namespace}}}measType"
    measValue_tag = f"{{{namespace}}}measValue"
    r_tag = f"{{{namespace}}}r"

    file_data = etree.iterparse(file_path, events=('start', 'end'))

    for event, elem in file_data:
        if event != 'start':
            continue

        if elem.tag == fileHeader_tag:
            vendor_name = elem.get('vendorName')
            continue
        
        if elem.tag == fileSender_tag:
            node_name = elem.get('senderName').split('-')[1]
            continue

        if elem.tag == measData_tag:
            begin_time = datetime.fromisoformat(elem.get('beginTime'))
            break

    metrics = {}
    accumulator = {}

    for event, elem in file_data:
        if event == 'start':
            if elem.tag == measInfo_tag:
                metrics.clear()
                accumulator.clear()

            continue

        if elem.tag == granPeriod_tag:
            granularity = int(re.search(r'\d+', elem.get('duration')).group())
            continue

        if elem.tag == measType_tag:
            if elem.text.strip() in followed_metrics:
                id = elem.get('p')
                metrics[id] = elem.text

            clear_memory(elem)
            continue

        if elem.tag == measValue_tag:
            measObjLdn_string = elem.get('measObjLdn')
            pairs = measObjLdn_string.split(',')
            measObjLdn_dict = dict(p.split('=', 1) for p in pairs if '=' in p)

            object_type = None
            followed_objects = ["NRCELL", "LNCEL", "EQM", "LNBTS", "NRBTS"]
            object_type = [elem for elem in followed_objects if elem in measObjLdn_dict.keys()]
            object_type = object_type[0] if object_type else None
            object_id = measObjLdn_dict.get(object_type) if object_type is not None else None


            if object_type is not None:
                for r in elem.findall(r_tag):
                    
                    id = r.get('p')
                    metric_name = metrics.get(id)

                    if metric_name is not None:
                        unique_key = (object_type, int(object_id), metric_name)
                        accumulator[unique_key] = int(r.text)

            clear_memory(elem)

        if elem.tag == measInfo_tag:
            for (obj_type, obj_id, m_name), value in accumulator.items():
                    yield {
                        "vendor_name": vendor_name,
                        "node_name": node_name,
                        "object_type": obj_type,
                        "object_id": obj_id,
                        "measurement_type": m_name,
                        "measurement_value": value,
                        "begin_time": begin_time,
                        "end_time": begin_time + timedelta(seconds=granularity),
                        "granularity": granularity
                    }
                    
            clear_memory(elem)


def parse_file(db: Session, file_path: str) -> dict[str, list[dict[str, str | int]]]:

    file_name = os.path.basename(file_path)
    if check_file_is_parsed(db, file_name):
        print("File {file_name} has already been parsed")
        return

    batch_size = int(os.getenv('BATCH_SIZE', '1000'))

    followed_metrics = get_followed_indicators(db)

    batch = []

    for telemetry_data in extract_data(followed_metrics, file_path):
        batch.append(telemetry_data)

        if len(batch) > batch_size:
            save_batch(db, batch)

    if batch:
        save_batch(db, batch)

    save_file_name(db, file_name)

def parse_missed_files(db: Session):
    for file in get_all_files():
        file_name = os.path.basename(file)

        if check_file_is_parsed(db, file_name):
            continue

        print(f"MISSED FIle {file_name}")
        parse_file(db, file)