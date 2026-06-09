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
                sh 'docker run --rm -v $WORKSPACE/frontend:/app -w /app node:18-alpine sh -c "npm install && npm test"'
            }
        }
        stage('Build Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ./backend"
                }
            }
        }

        stage('Análisis Estático') {
            steps {
                script {
                    // Ejecutamos flake8 directamente sobre la imagen
                    sh "docker run --rm ${IMAGE_NAME} flake8 ."
                }
            }
        }

        stage('Pruebas Unitarias') {
            steps {
                script {
                    // 1. Corremos las pruebas dándole un nombre al contenedor para poder extraer el archivo después
                    sh "docker run --name test_runner ${IMAGE_NAME} pytest --junitxml=nosetests.xml pruebas/"
                    
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
            // Publica los resultados si el archivo se generó
            junit testResults: 'backend/nosetests.xml', allowEmptyResults: true
        }
    }
}
