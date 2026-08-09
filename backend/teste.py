from file_manager import mark_file, get_files

def mark_all_files(file_type: str = 'PARSED'):
    for file in get_files():
        mark_file(file, file_type)

