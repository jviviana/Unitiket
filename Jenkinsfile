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
                    // Ejecutamos flake8. Si falla, el pipeline se detiene.
                    sh "docker run --rm ${IMAGE_NAME} flake8 ."
                }
            }
        }

        stage('Pruebas Unitarias') {
            steps {
                script {
                    // Ejecutamos pytest y generamos un reporte XML compatible con Jenkins
                    // Usamos un volumen temporal para sacar el reporte del contenedor
                    sh "docker run --rm -v ${WORKSPACE}/backend:/app ${IMAGE_NAME} pytest --junitxml=nosetests.xml pruebas/"
                }
            }
        }
    }

    post {
        always {
            // Publica los resultados de las pruebas en la interfaz de Jenkins
            junit 'backend/nosetests.xml'
        }
    }
}
