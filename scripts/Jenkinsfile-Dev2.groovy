BRANCH = "develop"

// turn on environments
node('master') {
    sh 'pwd'
    stage "starting environments for deployment"
    sh "../instance_controller.sh dev start"
    sleep 15 //60
}

/*
*
*  Pierpaolo 07/02/2017
*  at the moment the stage "build SEE dev" builds and deploys the FE
*  I try to split the build and run the deploy in a different stage but this a FE without css
*
* */

node('dev2') {
    stage ("build SEE dev") {
        try {
            checkout([$class      : 'GitSCM', branches: [[name: BRANCH]], doGenerateSubmoduleConfigurations: false, extensions: [],
                      submoduleCfg: [], userRemoteConfigs: [[credentialsId: '882aa4e6-d79e-4157-8e88-cb07ec56aeac', url: 'https://github.com/Amalytics/see-ui.git']]])
            removeContainer()
            sh "npm install"
            sh "NODE_ENV=dev2 gulp build"
            sh "bash ./scripts/build.sh dev"
        } catch (Exception e) {
            echo e.message
            throw e
        } finally {
            step([$class: 'WsCleanup'])
        }
    }
}

//// deploy
//node('dev') {
//    stage "deploying SEE to dev"
//    try {
////        dir ('scripts') {
////            sh 'pwd'
////            sh 'ls -la'
////            sh "bash ./build.sh dev"
////        }
//        checkout([$class      : 'GitSCM', branches: [[name: BRANCH]], doGenerateSubmoduleConfigurations: false, extensions: [],
//                  submoduleCfg: [], userRemoteConfigs: [[credentialsId: '882aa4e6-d79e-4157-8e88-cb07ec56aeac', url: 'https://github.com/Amalytics/see-ui.git']]])
////        sh 'pwd'
////        sh 'ls -la'
//        sh "bash ./scripts/build.sh dev"
//
//        // screenshot no css
////        sh 'docker stop see-ui'
////        sh 'docker rm see-ui'
////        sh 'docker rmi -f see-ui-image'
////        sh 'docker build --build-arg NODE_ENV=dev -t see-ui-image -f scripts/Dockerfile .'
////        sh 'docker run -e "NODE_ENV=dev" -d -p 8101:8080 --name see-ui see-ui-image'
//
//    } catch (Exception e) {
//        echo e.message
//        throw e
//    } finally {
//        step([$class: 'WsCleanup'])
//    }
//}

// disable test pipeline stage
//node('master') {
//
//    stage ("executing acceptance tests") {
//        try {
//            checkout([$class      : 'GitSCM', branches: [[name: "develop"]], doGenerateSubmoduleConfigurations: false, extensions: [],
//                      submoduleCfg: [], userRemoteConfigs: [[credentialsId: '882aa4e6-d79e-4157-8e88-cb07ec56aeac', url: 'https://github.com/Amalytics/acceptance_tests.git']]])
//
//            // dev or test BASE_URL
//            sh 'bundle install'
//            sh 'cucumber BASE_URL="https://10.0.25.12" --format json -o /var/lib/jenkins/reports/seeui/dev/report.json --tags @sprint --tags ~@manual'
//
//        } catch (Exception e) {
//            echo e.message
//            throw e
//        } finally {
//            cucumber jsonReportDirectory: "/var/lib/jenkins/reports/seeui/dev"
//            sh 'rm /var/lib/jenkins/reports/seeui/dev/report.json'
//            step([$class: 'WsCleanup'])
//        }
//    }
//}


void removeContainer() {

    if (isRunning("see")){
        stopContainer("see")
        removeContainer("see")
        removeImage("see-image")
    }

}
/*
    Checks if a container is running
 */
boolean isRunning(String containerName){
    def processCountString = "docker ps -a | awk '{ print \$NF; }' | grep -e '^${containerName}\$' | wc -l"
    CONTAINER_PROCESS_COUNT = sh (
            script: processCountString,
            returnStdout: true
    ).trim()
    boolean isProcessUp = CONTAINER_PROCESS_COUNT.toInteger() == 1
    return isProcessUp
}
/**
 *  Stops, removes containers and images
 */
def stopContainer(String containerName){
    echo "Stopping ${containerName}"
    sh "docker stop ${containerName}"
}
def removeContainer(String containerName){
    echo "Removing ${containerName}"
    sh "docker rm ${containerName}"
}
def removeImage(String imageName){
    echo "Removing ${imageName}"
    sh "docker rmi ${imageName}"
}
