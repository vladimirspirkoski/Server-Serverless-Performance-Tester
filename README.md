<h2>Тестер за перформанси на Windows и Linux сервери и Serverless функции</h2>
<h4>Апликацијата прави benchmark на перформансите на виртуелните машини и „serverless functions“ сервисите на платформите „GCloud“, „AWS“ и „Azure </h4>
<br>
Виртуелните машини се тестираат со помош на фласк веб сервер и различни алгоритми за тестирање на компонентите на серверот и го мери времето на извршување.<br>
Serverless тестирањето испраќа барања со параметри до URL-то на функцијата и го мери времето додека да се добие одговор.<br>
<br><br>

<h2>Windows верзија:</h2><br>
За стартување на Windows само стартувај го .exe фајлот и отвори localhost во прелистувач. Веб серверот слуша на 0.0.0.0 па може да се пристапи и од надвор со соодветната конфигурација на firewall. 
<br>
<br>
<h2>Linux верзија:</h2>
<br>
За Linux верзијата прво треба да се даде execute привилегија со: <code>chmod +x PerformanceTester</code> и потоа се стартува со команда: <code>sudo ./PerformanceTester</code>.
<br>
Кодови за serverless функциите:
<br> AWS: <br>

<pre>import random
import json

# Merge Sort algoritam
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])

    return result

def lambda_handler(event, context):
    print('Event: ', event)  # Debugging

    body = event.get('body')
    if body:
        try:
            body = json.loads(body)  #Citaj JSON
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'message': 'Invalid JSON in request body.'
                })
            }

    #Zemi go arraySize
    array_size = body.get('arraySize') if body else None
    print('Array size is:', array_size)  # Debugging

    if not array_size:
        # Vrati error ako ne e praten arraySize kako sto treba
        print('Error: arraySize parameter is required.')
        return {
            'statusCode': 400,
            'body': json.dumps({
                'message': 'Error: arraySize parameter is required.'
            })
        }

    try:
        # Konvertiraj vo integer za sekoj slucaj
        array_size = int(array_size)

        # Generiraj random array
        random_array = [random.randint(0, 10000) for _ in range(array_size)]

        # Sortiraj
        sorted_array = merge_sort(random_array)
        #print(sorted_array)
        print('Array Sorted.')  # Debugging

        # Return 200 so poraka za debugging
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Array sorted.',
            })
        }

    except Exception as e:
        # Print bilo kakvi drugi exception od try blokot
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'An error occurred while processing the request.',
                'error': str(e)
            })
        }
    </pre>
<br> Azure: <br>
<pre>
import azure.functions as func
import logging
import random
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)


def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])

    return result


@app.route(route="sort_array")
def sort_array(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Citaj JSON
        body = req.get_json()
        logging.info('Body: ' + str(body))

        # Zemi go arraySize
        array_size = body.get('arraySize')
        if not array_size:
            return func.HttpResponse(
                json.dumps(
                    {'message': 'Error: arraySize parameter is required.'}),
                status_code=400,
                mimetype="application/json"
            )

        # Generiraj i sortiraj niza
        array_size = int(array_size)
        random_array = [random.randint(0, 10000) for _ in range(array_size)]
        sorted_array = merge_sort(random_array)
        logging.info("Array sorted.")
        logging.info(sorted_array)

        return func.HttpResponse(
            json.dumps({
                'message': 'Array sorted.',
                'sortedArray': sorted_array
            }),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({
                'message': 'An error occurred while processing the request.',
                'error': str(e)
            }),
            status_code=500,
            mimetype="application/json"
        )
</pre>

<br> GCloud: <br>
<pre>
import random
import json
from flask import Flask, request, jsonify, make_response

def sort_array(request):
    try:
        # Za CORS
        if request.method == 'OPTIONS':
            response = make_response('')
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Max-Age'] = '3600'
            return response

        # Citaj JSON
        body = request.get_json()
        if not body:
            return jsonify({'message': 'Invalid JSON in request body.'}), 400

        array_size = body.get('arraySize')
        if not array_size:
            return jsonify({'message': 'Error: arraySize parameter is required.'}), 400

        # Generiraj i sortiraj niza
        array_size = int(array_size)
        random_array = [random.randint(0, 10000) for _ in range(array_size)]
        sorted_array = merge_sort(random_array)

        response = jsonify({
            'message': 'Array sorted.',
        })
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    except Exception as e:
        response = jsonify({
            'message': 'An error occurred while processing the request.',
            'error': str(e)
        })
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500


# Merge Sort Algoritam
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)


def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])

    return result
</pre>

<br><br>

<h4>Дипломска работа - ФИНКИ</h4>
<h4>Владимир Спиркоски</h4>
