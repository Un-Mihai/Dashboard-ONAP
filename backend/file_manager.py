from pathlib import Path

script_path = Path(__file__).parent

folder_path = script_path / "../files"

def get_unparsed_files():
    unparsed_files = []

    for file in folder_path.glob("*.xml"):

        if file.name.endswith("_parsed.xml"):
            continue

        unparsed_files.append(file.name)

    return unparsed_files



