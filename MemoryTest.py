import time
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed


def memory_test_task(num_elements, test_type, memory_array=None):
    
    if test_type == 'write':
        # Napolni ja memorijata so random elementi
        memory_array = np.random.randint(
            0, 256, size=num_elements, dtype=np.uint8)
        del memory_array  # Oslobodi memorija

    elif test_type == 'read':
        # Citaj so copy funkcija
        read_copy = memory_array.copy()
        del memory_array
        del read_copy

    return

def memory_test(n_kb, test_type, threshold):

    n_bytes = n_kb * 1024
    num_elements = n_bytes // np.dtype(np.uint8).itemsize

    output = ""

    if (test_type == 'write'):
        for i in range(1, threshold + 1):
            start_time = time.time()

            # modificiran kod od superfastpython.com
            with ThreadPoolExecutor(max_workers=i) as executor:
                futures = [executor.submit(
                    memory_test_task, num_elements, test_type) for _ in range(i)]
                for future in as_completed(futures):
                    future.result()
        # presmetaj go vremeto i vrati go vo output
            total_time = time.time() - start_time
            output += f"Total time for {i} concurrent memory test(s): {
                total_time:.2f} seconds<br>"
        
    elif (test_type == 'read'):
        # Kreiraj array
        memory_array = np.random.randint(
            0, 256, size=num_elements, dtype=np.uint8)
        for i in range(1, threshold + 1):
            start_time = time.time()

            # modificiran kod od superfastpython.com
            with ThreadPoolExecutor(max_workers=i) as executor:
                futures = [executor.submit(
                    memory_test_task, num_elements, test_type, memory_array) for _ in range(i)]
                for future in as_completed(futures):
                    future.result()
        # presmetaj go vremeto i vrati go vo output
            total_time = time.time() - start_time
            output += f"Total time for {i} concurrent memory test(s): {
                total_time:.2f} seconds<br>"

    return output
