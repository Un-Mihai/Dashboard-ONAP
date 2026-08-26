from fastapi import FastAPI
from pathlib import Path
from contextlib import asynccontextmanager
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
import time
import os

from database import SessionLocal
from parser import parse_file, parse_missed_files

def wait_file_fully_created(file_path, timeout=10):
    old_size = -1
    start_time = time.time()

    while time.time() - start_time < timeout:
        current_size = os.path.getsize(file_path)
        if current_size == old_size and current_size > 0:
            return True

        old_size = current_size
        time.sleep(0.5)

    return False


class XMLHandler(PatternMatchingEventHandler):
    def __init__(self):
        super().__init__(patterns=["*.xml"], ignore_directories=True)

    def on_created(self, event):

        file_path = event.src_path
        file_name = os.path.basename(file_path)

        print(f"New file detected: {file_name}")
        wait_file_fully_created(file_path, 10)
        db = SessionLocal()

        try:
            parse_file(db, file_path)

        except Exception as e:
            print(f"ERROR WHILE PARSING FILE {file_name}: {e}")

        finally:
            db.close()
            

@asynccontextmanager
async def lifespan(app: FastAPI):

    db = SessionLocal()
    try:
        parse_missed_files(db)

    except Exception as e:
        print(f"ERROR WHILE PARSING MISSED FILES: {e}")

    finally:
        db.close()

    folder_path = Path(os.getenv('FILES_DIRECTORY'))

    os.makedirs(folder_path, exist_ok=True)

    event_handler = XMLHandler()
    observer = Observer()
    observer.schedule(event_handler, folder_path, recursive=False)
    observer.start()

    print("Start Monitoring....")

    yield

    print("Stop Monitoring....")
    observer.stop()
    observer.join()