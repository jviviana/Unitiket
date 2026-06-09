pipeline {
    agent any
    environment {
        IMAGE_NAME = "uniticket-grupo-3"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Test Backend') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:test ./backend"
                sh "docker run --rm ${IMAGE_NAME}:test python manage.py test tickets --verbosity=2"
            }
        }
        stage('Test Frontend') {
            steps {
                sh "docker run --rm -v \${WORKSPACE}/frontend:/app -w /app node:18-alpine sh -c 'npm install && npm test'"
            }
        }
        stage('Build Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ./backend"
                }
            }
        }
    }
}
