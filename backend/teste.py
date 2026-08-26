from file_manager import mark_file, get_all_files

def mark_all_files(file_type: str = 'PARSED'):
    for file in get_all_files():
        mark_file(file, file_type)

