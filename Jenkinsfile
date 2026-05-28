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
                    // El Dockerfile está dentro de la carpeta 'backend', por lo que indicamos esa ruta
                    sh "docker build -t ${IMAGE_NAME}:latest ./backend"
                }
            }
        }
    }
}
