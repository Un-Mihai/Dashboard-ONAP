import os
from pathlib import Path

script_path = Path(__file__).parent

folder_path = Path(os.getenv('FILES_DIRECTORY'))

def get_files(file_type: str = 'ALL') -> list[Path]:

    if file_type == 'PARSED':
        return [file.resolve for file in folder_path.glob('*_PARSED.xml')]

    all_xml_files = folder_path.glob('*.xml')

    if file_type == 'UNPARSED':
        return [file.resolve() for file in all_xml_files if not file.name.endswith('_PARSED.xml')]

    return [file.resolve() for file in all_xml_files] 

def mark_file(file_path: Path, file_type: str) -> None:

    if file_type == 'PARSED':
        new_name = f"{file_path.stem}_PARSED{file_path.suffix}"
    else:
        new_name = f"{file_path.stem.replace('_PARSED', '')}{file_path.suffix}"

    new_path = file_path.with_name(new_name)
    file_path.rename(new_path)




