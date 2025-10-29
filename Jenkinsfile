pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Python Dependencies') {
            steps {
                sh 'pip install -r regai/regai_service/requirements.txt'
                sh 'pip install pytest'
            }
        }

        stage('Run Python Tests') {
            steps {
                sh 'PYTHONPATH=. pytest -q regai/tests'
            }
        }

        stage('Run OPA Tests') {
            steps {
                sh 'sudo docker run --rm -v $(pwd)/regai/policies:/policies openpolicyagent/opa:0.62.1 test -v /policies'
            }
        }
    }
}
