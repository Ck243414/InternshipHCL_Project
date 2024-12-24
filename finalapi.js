const {v1} = require('@google-cloud/composer');
const {TasksClient} = require('@google-cloud/tasks');
const {Storage} = require('@google-cloud/storage');
const {GoogleAuth} = require('google-auth-library');

const projectId = 'testfinal';
const location = 'asia-south1'; 
const environmentName = '88248852929-compute@developer.gserviceaccount.com'; 
const apiEndpoint = `composer.googleapis.com`;


async function triggerDAG(dagName) {
    const client = new v1.EnvironmentsClient({
        apiEndpoint
    });

    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    const clientHeaders = {
        'Authorization': `Bearer ${await auth.getAccessToken()}`,
    };

    const request = {
        name: `projects/${projectId}/locations/${location}/environments/${environmentName}`,
        environment: {
            config: {
                dagGcsPrefix: `gs://your-bucket/dags/${dagName}`
            }
        }
    };

    try {
        await client.updateEnvironment(request, {headers: clientHeaders});
        console.log('DAG triggered successfully');
    } catch (err) {
        console.error('Error triggering DAG:', err);
    }
}

async function getDAGStatus(dagRunId) {
    const tasksClient = new TasksClient();

    const parent = `projects/${projectId}/locations/${location}/environments/${environmentName}`;

    const request = {
        parent,
        filter: `dag_id=${dagName} AND dag_run_id=${dagRunId}`
    };

    try {
        const [response] = await tasksClient.listTasks(request);

        response.tasks.forEach(task => {
            console.log(`Task ID: ${task.name}`);
            console.log(`Task Name: ${task.displayName}`);
            console.log(`Task Status: ${task.state}`);
            console.log('---');
        });
    } catch (err) {
        console.error('Error fetching DAG status:', err);
    }
}

async function listDAGs() {
    const storage = new Storage();
    const bucketName = 'your-bucket';

    try {
        const [files] = await storage.bucket(bucketName).getFiles({prefix: 'dags/'});
        files.forEach(file => {
            console.log(`DAG: ${file.name}`);
        });
    } catch (err) {
        console.error('Error listing DAGs:', err);
    }
}


async function listDAGRuns(dagName) {
    const client = new v1.EnvironmentsClient({
        apiEndpoint
    });

    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    const clientHeaders = {
        'Authorization': `Bearer ${await auth.getAccessToken()}`,
    };

    const parent = `projects/${projectId}/locations/${location}/environments/${environmentName}`;

    const request = {
        parent,
        filter: `dag_id=${dagName}`
    };

    try {
        const [response] = await client.listDAGRuns(request, {headers: clientHeaders});

        response.dagRuns.forEach(run => {
            console.log(`DAG Run ID: ${run.dagRunId}`);
            console.log(`State: ${run.state}`);
            console.log(`Execution Date: ${run.executionDate}`);
            console.log('---');
        });
    } catch (err) {
        console.error('Error listing DAG runs:', err);
    }
}

async function stopDAGRun(dagRunId) {
    const client = new v1.EnvironmentsClient({
        apiEndpoint
    });

    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
    });

    const clientHeaders = {
        'Authorization': `Bearer ${await auth.getAccessToken()}`,
    };

    const request = {
        name: `projects/${projectId}/locations/${location}/environments/${environmentName}/dagRuns/${dagRunId}`,
    };

    try {
        await client.stopDAGRun(request, {headers: clientHeaders});
        console.log('DAG run stopped successfully');
    } catch (err) {
        console.error('Error stopping DAG run:', err);
    }
}

(async () => {
    const dagName = 'test1'; 

    await triggerDAG(dagName);

    const dagRunId = 'testid1';

    setTimeout(async () => {
        await getDAGStatus(dagRunId);
    }, 3000); 

    await listDAGs();

    await listDAGRuns(dagName);

    await stopDAGRun(dagRunId);
})();
