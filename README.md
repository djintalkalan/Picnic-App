# PICNIC APP

Place google-services.json in 

android/app/src/staging/google-services.json
android/app/src/production/google-services.json

place staging.env and production.env in root folders

according to build type

Run yarn env-s for staging environment variable generation
Run yarn env-p for production environment variable generation

Run yarn apk-s for staging environment variable's APK generation
Run yarn apk-p for production environment variable's APK generation

yarn pod for installing pod