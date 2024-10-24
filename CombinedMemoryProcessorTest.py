import time
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed

# merge sort algoritam, modificiran kod prevzemen od www.scaler.com


def merge_sort(array):
    if len(array) > 1:
        mid = len(array) // 2
        left_half = array[:mid]
        right_half = array[mid:]

        merge_sort(left_half)
        merge_sort(right_half)

        i = j = k = 0

        while i < len(left_half) and j < len(right_half):
            if left_half[i] < right_half[j]:
                array[k] = left_half[i]
                i += 1
            else:
                array[k] = right_half[j]
                j += 1
            k += 1

        while i < len(left_half):
            array[k] = left_half[i]
            i += 1
            k += 1

        while j < len(right_half):
            array[k] = right_half[j]
            j += 1
            k += 1

    return array


def combined_test_task(n):
    array = np.random.randint(0, 100000, size=n)
    start_time = time.time()
    merge_sort(array)
    sort_duration = time.time() - start_time

    return sort_duration


def combined_test(n, threshold):
    output = ""

    for i in range(1, threshold + 1):
        start_time = time.time()

        with ThreadPoolExecutor(max_workers=i) as executor:
            futures = [executor.submit(combined_test_task, n)
                       for _ in range(i)]
            for future in as_completed(futures):
                future.result()

        # dodaj go vremeto na izvrsuvanje za ovoj batch vo output i vrati go output kako string
        total_time = time.time() - start_time
        output += f"Total time for {i} concurrent combined test(s): {
            total_time:.2f} seconds<br>"

    return output
