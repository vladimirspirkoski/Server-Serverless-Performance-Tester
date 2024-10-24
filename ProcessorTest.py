import time
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed

# heap sort algoritam, modificiran kod prevzemen od www.geeksforgeeks.org


def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)


def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)

    for i in range(n-1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)

    return arr


def single_sort_task(n):
    array = np.random.randint(0, 100000, size=n)
    start_time = time.time()
    # ja cuvame sortirana niza vo variable za testiranje i printanje
    sorted_array = heap_sort(array)
    # print(sorted_array)
    sort_duration = time.time() - start_time
    return sort_duration


def cpu_test(n, threshold):
    output = ""

    for i in range(1, threshold + 1):
        start_time = time.time()

        # modificiran kod od superfastpython.com
        with ThreadPoolExecutor(max_workers=i) as executor:
            futures = [executor.submit(single_sort_task, n) for _ in range(i)]
            # Soberi gi site rezultati otkoga kje zavrsat site threads
            for future in as_completed(futures):
                future.result()  # Nema potreba da se cuvaat posebni rezultati, dovolno e samo vremeto koga site od toj batch zavrsile

        # presmetaj go vremeto i vrati go vo output
        total_time = time.time() - start_time
        output += f"Total time for {i} concurrent CPU test(s): {
            total_time:.2f} seconds<br>"

    return output
