import time
import numpy as np
import gc
from concurrent.futures import ProcessPoolExecutor, as_completed


def memory_test_task(num_elements, test_type):

    if test_type == 'write':
        start_time = time.time()
        # Napolni ja memorijata so random elementi
        memory_array = np.full(num_elements, 42, dtype=np.uint8)
        end_time = time.time()
        del memory_array  # Oslobodi memorija
        gc.collect()

    elif test_type == 'read':
        memory_array = np.full(num_elements, 42, dtype=np.uint8)
        start_time = time.time()
        # Citaj so copy funkcija
        read_copy = memory_array.copy()
        end_time = time.time()
        del memory_array
        del read_copy
        gc.collect()

    return end_time - start_time


def memory_test(n_kb, test_type, threshold):

    n_bytes = n_kb * 1024
    num_elements = n_bytes // np.dtype(np.uint8).itemsize

    output = ""

    for i in range(1, threshold + 1):
        task_durations = []

        # modificiran kod od superfastpython.com
        with ProcessPoolExecutor(max_workers=i) as executor:
            futures = [executor.submit(
                memory_test_task, num_elements, test_type) for _ in range(i)]
            for future in as_completed(futures):
                task_durations.append(future.result())
        # presmetaj go vremeto i vrati go vo output
        total_time = max(task_durations)
        output += f"Total time for {i} concurrent memory test(s): {
            total_time:.3f} seconds<br>"

    return output
