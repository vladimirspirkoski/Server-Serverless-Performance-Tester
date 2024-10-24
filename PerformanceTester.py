import io
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import StorageTest as st
import MemoryTest as mt
import ProcessorTest as pt
import CombinedMemoryProcessorTest as cmpt
from waitress import serve

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        try:
            data = request.get_json()

            test_type = data.get('test_type')

            # za sekoj slucaj, se validira i na front end
            if test_type is None:
                return jsonify({'error': 'Test type is required'}), 400

            if test_type == 'cpu':
                arraySize = data.get('arraySize')
                threshold = data.get('threshold')
                if arraySize is None:
                    # za sekoj slucaj, se validira i na front end
                    return jsonify({'error': 'Missing parameter n for CPU test'}), 400
                result = pt.cpu_test(int(arraySize), int(threshold))

            elif test_type == 'memory':
                memory_kb = data.get('memory_kb')
                test_sub_type = data.get('test_sub_type', 'read')
                threshold = data.get('threshold')
                if memory_kb is None:
                    # za sekoj slucaj, se validira i na front end
                    return jsonify({'error': 'Missing memory size parameter for Memory test'}), 400
                result = mt.memory_test(
                    int(memory_kb), test_sub_type, int(threshold))

            elif test_type == 'storage':
                file_size_mb = data.get('file_size_mb')
                test_sub_type = data.get('test_sub_type', 'sequential_read')
                threshold = data.get('threshold')
                if file_size_mb is None:
                    # za sekoj slucaj, se validira i na front end
                    return jsonify({'error': 'Missing file size parameter for Storage test'}), 400
                result = st.storage_test(
                    int(file_size_mb), test_sub_type, int(threshold))

            elif test_type == 'combined':
                arraySize = data.get('arraySize')
                threshold = data.get('threshold')
                if arraySize is None:
                    # za sekoj slucaj, se validira i na front end
                    return jsonify({'error': 'Missing parameter n for Combined test'}), 400
                result = cmpt.combined_test(int(arraySize), int(threshold))

            else:
                # nevozmozno, za sekoj slucaj, se validira i na front end
                return jsonify({'error': 'Unknown test type'}), 400

            # vrati go rezultatot so status 200
            return jsonify({'result': result}), 200

        except Exception as e:
            # vrati error 500 ako nekade se frli exception
            return jsonify({'error': str(e)}), 500

    return render_template('PerformanceTester_Interface.html'), 200


@app.route('/serverless', methods=["GET"])
def serverless():
    return render_template('Serverless_SortingAPI_Interface.html'), 200


if __name__ == '__main__':
    app.debug = True
    serve(app, host='0.0.0.0', port=80)
