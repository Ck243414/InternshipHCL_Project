from flask import Flask, request, jsonify
import requests
import time

app = Flask(__name__)

AIRFLOW_URL = 'https://airflow.apache.org/docs/apache-airflow/stable/stable-rest-api-ref.html'  
USERNAME = 'chaitanya-composer@decent-habitat-424514-s9.iam.gserviceaccount.com'               
PASSWORD = 'chaitanyasdagpassword1234$'               

@app.route('/execute_dag', methods=['POST'])
def execute_dag():
    data = request.json
    dag_url = data.get('dag_url')
    dag_id = data.get('dag_id')

    response = requests.post(
        f'{AIRFLOW_URL}/api/v1/dags/{dag_id}/dagRuns',
        auth=(USERNAME, PASSWORD),
        json={}
    )

    if response.status_code != 200:
        return jsonify({'error': 'Error executing DAG'}), 500

    dag_run = response.json()
    return jsonify(dag_run), 200

@app.route('/dag_status', methods=['GET'])
def dag_status():
    dag_url = request.args.get('dag_url')
    dag_id = request.args.get('dag_id')
    dag_run_id = request.args.get('dag_run_id')

    response = requests.get(
        f'{AIRFLOW_URL}/api/v1/dags/{dag_id}/dagRuns/{dag_run_id}',
        auth=(USERNAME, PASSWORD)
    )

    if response.status_code != 200:
        return jsonify({'error': 'Error fetching DAG status'}), 500

    dag_status = response.json()
    return jsonify(dag_status), 200

if __name__ == '__main__':
    app.run(debug=True)
