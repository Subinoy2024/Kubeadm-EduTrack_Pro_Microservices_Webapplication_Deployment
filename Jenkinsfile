pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    choice(name: 'DEPLOY_TARGET', choices: ['kubeadm', 'kubeadm-with-frontend'], description: 'Choose kubeadm deployment scope')
    string(name: 'IMAGE_TAG', defaultValue: '', description: 'Leave empty to use build-BUILD_NUMBER')
    string(name: 'IMAGE_REGISTRY', defaultValue: 'YOUR_DOCKERHUB_USER', description: 'Container registry namespace')
    string(name: 'KUBE_NAMESPACE', defaultValue: 'edutrack', description: 'Target kubeadm namespace')
    string(name: 'KUBEADM_API_BASE_URL', defaultValue: 'http://192.168.68.112:30080', description: 'Base URL for kubeadm smoke test')
    string(name: 'VITE_API_BASE_URL', defaultValue: '/api/v1', description: 'Frontend API base url at build time')
    booleanParam(name: 'SKIP_IMAGE_PUSH', defaultValue: false, description: 'Skip pushing images to the registry')
  }

  environment {
    EFFECTIVE_IMAGE_TAG = "${params.IMAGE_TAG ?: "build-${env.BUILD_NUMBER}"}"
    CONTAINER_TOOL = 'docker'
    INCLUDE_FRONTEND = "${params.DEPLOY_TARGET.endsWith('with-frontend')}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Verify tools') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          python3 --version
          ${CONTAINER_TOOL} --version
          kubectl version --client
          kubectl get nodes
        '''
      }
    }

    stage('Build images') {
      steps {
        withEnv([
          "IMAGE_REGISTRY=${params.IMAGE_REGISTRY}",
          "IMAGE_TAG=${env.EFFECTIVE_IMAGE_TAG}",
          "VITE_API_BASE_URL=${params.VITE_API_BASE_URL}",
          "CONTAINER_TOOL=${env.CONTAINER_TOOL}"
        ]) {
          sh 'chmod +x deploy/scripts/build-images.sh && ./deploy/scripts/build-images.sh'
        }
      }
    }

    stage('Push images') {
      when {
        expression { return !params.SKIP_IMAGE_PUSH }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | ${CONTAINER_TOOL} login -u "$DOCKER_USER" --password-stdin'
          withEnv([
            "IMAGE_REGISTRY=${params.IMAGE_REGISTRY}",
            "IMAGE_TAG=${env.EFFECTIVE_IMAGE_TAG}",
            "CONTAINER_TOOL=${env.CONTAINER_TOOL}"
          ]) {
            sh 'chmod +x deploy/scripts/push-images.sh && ./deploy/scripts/push-images.sh'
          }
        }
      }
    }

    stage('Prepare manifests') {
      steps {
        withEnv([
          "IMAGE_REGISTRY=${params.IMAGE_REGISTRY}",
          "IMAGE_TAG=${env.EFFECTIVE_IMAGE_TAG}"
        ]) {
          sh 'git checkout -- deploy/kubeadm || true'
          sh 'chmod +x deploy/scripts/replace-dockerhub-user.sh && ./deploy/scripts/replace-dockerhub-user.sh'
        }
      }
    }

    stage('Deploy to kubeadm') {
      steps {
        withEnv([
          "DEPLOY_NAMESPACE=${params.KUBE_NAMESPACE}",
          "DEPLOY_FRONTEND=${env.INCLUDE_FRONTEND}",
          'ROLLOUT_TIMEOUT=240s',
          'WAIT_TIMEOUT_SECONDS=300'
        ]) {
          sh 'chmod +x deploy/scripts/deploy-kubeadm.sh && ./deploy/scripts/deploy-kubeadm.sh'
        }
      }
    }

    stage('Smoke test') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          curl -sf "${KUBEADM_API_BASE_URL}/health"
          curl -sf "${KUBEADM_API_BASE_URL}/api/v1/health"
        '''
      }
    }
  }

  post {
    always {
      sh '${CONTAINER_TOOL} logout || true'
      echo "Deployment target: ${params.DEPLOY_TARGET}"
      echo "Image tag used: ${env.EFFECTIVE_IMAGE_TAG}"
    }
  }
}
