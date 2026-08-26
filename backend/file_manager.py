import os
from pathlib import Path

script_path = Path(__file__).parent

folder_path = Path(os.getenv('FILES_DIRECTORY'))

def get_all_files() -> list[Path]:
    all_xml_files = folder_path.glob('*.xml')
    return [file.resolve() for file in all_xml_files] 

def mark_file(file_path: Path, file_type: str) -> None:

    if file_type == 'PARSED':
        new_name = f"{file_path.stem}_PARSED{file_path.suffix}"
    else:
        new_name = f"{file_path.stem.replace('_PARSED', '')}{file_path.suffix}"

    new_path = file_path.with_name(new_name)
    file_path.rename(new_path)




