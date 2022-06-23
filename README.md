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

### 5. Install npm modules

>
> Install node_modules by running command `yarn install`
>

### 6. Update ENV according to build type :

>
>  run `yarn env-d` for enabling **dev** environment
>  run `yarn env-b` for enabling **beta** environment
>  run `yarn env-p` for enabling **production** environment
>

### 7. Generate apk according to build type :

>
>  run `yarn apk-d` for **dev** environment's APK generation
>  run `yarn apk-b` for **beta** environment's APK generation
>  run `yarn apk-p` for **production** environment's APK generation
>

### 8. APK will be generated in this directory

>
> {project-root}/android/output/
>

### 9. Install Pods with this command

>
> Install cocoa-pods by running command `yarn pod`
>

### 10. Generate IPA according to build type :

>
>  run `yarn ipa-d` for **dev** environment's IPA generation
>  run `yarn ipa-b` for **beta** environment's IPA generation
>  run `yarn ipa-p` for **production** environment's IPA generation
>

### 11. IPA will be generated in this directory

>
> {project-root}/ios/output/
>