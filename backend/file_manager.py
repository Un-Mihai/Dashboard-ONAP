import os
from pathlib import Path

script_path = Path(__file__).parent

folder_path = Path(os.getenv('FILES_DIRECTORY'))

def get_unparsed_files():
    unparsed_files = []

    for file in folder_path.glob('*.xml'):

        if file.name.endswith('_PARSED.xml'):
            continue

        unparsed_files.append(file.resolve())

    return unparsed_files

def marked_parsed(file_name: str):
    old_path = os.path.join(folder_path, file_name)

    name, extension = os.path.splitext(file_name)

    new_file_name = f"{name}_PARSED{extension}"
    new_path = os.path.join(folder_path, new_file_name)

    os.rename(old_path, new_path)



