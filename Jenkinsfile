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
        stage('Test Backend (con cobertura)') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:test ./backend"
                sh "docker run --name cov_runner -e DEBUG=True ${IMAGE_NAME}:test sh -c 'coverage run manage.py test tickets --verbosity=2 && coverage report && coverage xml -o coverage.xml'"
                sh "docker cp cov_runner:/app/coverage.xml ./backend/coverage.xml"
                sh "docker rm cov_runner"
            }
        }
        stage('Test Frontend') {
            steps {
                sh 'docker build -t frontend-test -f frontend/Dockerfile.test ./frontend'
                sh 'docker run --rm frontend-test'
            }
        }
        stage('Build Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ./backend"
                }
            }
        }
        stage('Analisis Estatico (Linting)') {
            steps {
                script {
                    sh "docker run --rm ${IMAGE_NAME} flake8 ."
                }
            }
        }
        stage('SAST (Bandit)') {
            steps {
                script {
                    sh "docker run --rm ${IMAGE_NAME} bandit -r . -c bandit.yaml -x '*/tests.py,*/test_*.py'"
                }
            }
        }
        stage('SCA (pip-audit)') {
            steps {
                script {
                    sh "docker run --rm ${IMAGE_NAME} pip-audit -r requirements.txt"
                }
            }
        }
        stage('Security Check (Django deploy)') {
            steps {
                script {
                    sh "docker run --rm -e DEBUG=False -e SECRET_KEY=ci-temporal-no-usar-en-produccion-0123456789abcdef ${IMAGE_NAME} python manage.py check --deploy || true"
                }
            }
        }
        stage('Pruebas Unitarias') {
            steps {
                script {
                    sh "docker run --name test_runner -e DEBUG=True ${IMAGE_NAME} pytest --junitxml=nosetests.xml pruebas/"
                    sh "docker cp test_runner:/app/nosetests.xml ./backend/nosetests.xml"
                    sh "docker rm test_runner"
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sh "docker compose -f ./backend/docker-compose.yml --project-directory ./backend -p uniticket-grupo-3 down || true"
                    sh "docker compose -f ./backend/docker-compose.yml --project-directory ./backend -p uniticket-grupo-3 up -d --build"
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'backend/nosetests.xml', allowEmptyResults: true
        }
    }
}
