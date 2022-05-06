# Picnic Groups project setup guide :

### 1. Before proceeding download required files and extract them.

 > 
 > envs.zip
 > google-services.json.zip
 > GoogleService-Info.plist.zip
 >

### 2. Place ENVs in root folder of the project

>
> **dev.yaml**
> **beta.yaml**
> **production.yaml**
>

### 3. Place google-services.json in android

>
> {project-root}/android/app/google-services/**dev**/google-services.json
> {project-root}/android/app/google-services/**beta**/google-services.json
> {project-root}/android/app/google-services/**production**/google-services.json
>

### 4. Place GoogleService-Info.plist in ios

>
> {project-root}/ios/GoogleServices/**dev**/GoogleService-Info.plist
> {project-root}/ios/GoogleServices/**beta**/GoogleService-Info.plist
> {project-root}/ios/GoogleServices/**production**/GoogleService-Info.plist
>

### 5. Update ENV according to build type :

>
>  run `yarn env-s` for enabling **dev** environment.
>  run `yarn env-b` for enabling **beta** environment.
>  run `yarn env-p` for enabling **production** environment.
>

### 6. Generate apk according to build type :

>
>  run `yarn apk-s` for **dev** environment's APK generation
>  run `yarn apk-b` for **beta** environment's APK generation
>  run `yarn apk-p` for **production** environment's APK generation
>

### 7. Install Pods with this command

>
> `yarn pod`
>

### 8. APK will be generated in this directory

>
> {project-root}/android/output/
>