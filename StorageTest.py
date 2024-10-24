import os
import platform
import time
import shutil
import random
from concurrent.futures import ThreadPoolExecutor, as_completed


def calculate_system_free_space(path='/tmp'):
    total, used, free = shutil.disk_usage(path)
    return free


def write_test_file(file_path, size_in_mb, mode="sequential"):
    size_in_bytes = size_in_mb * 1024 * 1024  # konvertiraj od MB vo bajti
    with open(file_path, 'wb') as f:
        if mode == "sequential":
            # pisuvaj random podatoci sekvencijalno
            f.write(os.urandom(size_in_bytes))
        elif mode == "random":
            for _ in range(size_in_bytes // 1024):
                f.seek(random.randint(0, size_in_bytes - 1024))
                # pisuvaj data na razlicni mesta vo fajlot
                f.write(os.urandom(1024))


def read_test_file(file_path, size_in_mb, mode="sequential"):

    size_in_bytes = size_in_mb * 1024 * 1024
    start_time = time.time()

    with open(file_path, 'rb') as f:
        if mode == "sequential":
            f.read(size_in_bytes)  # citaj sekvencijalno od pocetok do kraj
        elif mode == "random":
            for _ in range(size_in_bytes // 1024):
                f.seek(random.randint(0, size_in_bytes - 1024))  # random seek
                f.read(1024)  # citaj na random mesto vo fajlot

    return time.time() - start_time


def storage_test_task(file_path, file_size_mb, test_type):
    if test_type == "sequential_write":
        write_mode = "sequential"
        start_time = time.time()
        write_test_file(file_path, file_size_mb, mode=write_mode)
        duration = time.time() - start_time
        os.remove(file_path)  # izbrisi go fajlot koga kje zavrsis
    elif test_type == "random_write":
        write_mode = "random"
        start_time = time.time()
        write_test_file(file_path, file_size_mb, mode=write_mode)
        duration = time.time() - start_time
        os.remove(file_path)  # izbrisi go fajlot koga kje zavrsis
    elif test_type == "sequential_read":
        # prvo kreiraj fajl pa citaj
        write_test_file(file_path, file_size_mb, mode="sequential")
        duration = read_test_file(file_path, file_size_mb, mode="sequential")
        os.remove(file_path)
    elif test_type == "random_read":
        # prvo kreiraj fajl pa citaj
        write_test_file(file_path, file_size_mb, mode="sequential")
        duration = read_test_file(file_path, file_size_mb, mode="random")
        os.remove(file_path)

    return duration


def storage_test(file_size_mb, test_type, threshold):
    output = ""
    # 500 MB vo bajti, ostaveni kako bafer sekogas da bidat slobodni za serverot/fajl sistemot
    min_free_space = 500 * 1024 * 1024

    base_path = '/tmp'
    if platform.system() == 'Windows':  # ako se testira na windows, koristi ja TEMP varijablata od PATH
        base_path = os.getenv('TEMP')

    # Proveri dali kje ima dovolno prostor za da se kreiraat dovolno fajlovi za site threads istovremeno
    required_space = file_size_mb * threshold * 1024 * 1024
    available_space = calculate_system_free_space(base_path)

    if available_space - required_space < min_free_space:
        return (f"Insufficient storage for this threshold. Please choose a lower threshold or a smaller file size."
                f"Required: {required_space / (1024 * 1024):.2f} MB, "
                f"Available: {available_space / (1024 * 1024):.2f} MB. "
                f"At least 500 MB of free space must be left.\n")

    for i in range(1, threshold + 1):
        start_time = time.time()

        # modificiran kod od superfastpython.com
        with ThreadPoolExecutor(max_workers=i) as executor:
            futures = [
                executor.submit(storage_test_task, f"{
                                base_path}/test_file_{i}_{j}.dat", file_size_mb, test_type)
                for j in range(i)
            ]
            for future in as_completed(futures):
                future.result()

        # dodaj go vremeto na izvrsuvanje za ovoj batch vo output i vrati go output kako string
        total_time = time.time() - start_time
        output += f"Total time for {i} concurrent storage test(s): {
            total_time:.2f} seconds<br>"

    return output
