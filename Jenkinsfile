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
                    // flake8: calidad y estilo del codigo
                    sh "docker run --rm ${IMAGE_NAME} flake8 ."
                }
            }
        }

        stage('SAST (Bandit)') {
            steps {
                script {
                    // Analisis estatico de seguridad del codigo. Se excluyen los tests
                    // (codigo no desplegado; sus contrasenas son fixtures, no secretos).
                    sh "docker run --rm ${IMAGE_NAME} bandit -r . -c bandit.yaml -x '*/tests.py,*/test_*.py'"
                }
            }
        }

        stage('SCA (pip-audit)') {
            steps {
                script {
                    // Escaneo de vulnerabilidades conocidas (CVE) en las dependencias.
                    sh "docker run --rm ${IMAGE_NAME} pip-audit -r requirements.txt"
                }
            }
        }

        stage('Security Check (Django deploy)') {
            steps {
                script {
                    // Chequeo de configuracion de seguridad para despliegue (informativo: no rompe el build).
                    sh "docker run --rm -e DEBUG=False -e SECRET_KEY=ci-temporal-no-usar-en-produccion-0123456789abcdef ${IMAGE_NAME} python manage.py check --deploy || true"
                }
            }
        }

        stage('Pruebas Unitarias') {
            steps {
                script {
                    // 1. Corremos las pruebas con nombre para extraer el reporte despues
                    sh "docker run --name test_runner -e DEBUG=True ${IMAGE_NAME} pytest --junitxml=nosetests.xml pruebas/"
                    // 2. Copiamos el archivo de resultados desde el contenedor a Jenkins
                    sh "docker cp test_runner:/app/nosetests.xml ./backend/nosetests.xml"
                    // 3. Borramos el contenedor temporal
                    sh "docker rm test_runner"
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
