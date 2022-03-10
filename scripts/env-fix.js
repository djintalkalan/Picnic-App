const fs = require('fs');

const data = [
    {
        file: 'node_modules/react-native-ultimate-config/android/build.gradle',
        replacements: [
            {
                remove: `apply plugin: 'maven'`,
                add: `apply plugin: 'maven-publish'`
            },
            {
                remove: `apply plugin: 'maven'`,
                add: `apply plugin: 'maven-publish'`
            },
            {
                remove: `classpath += files(project.getConfigurations().getByName('compile').asList())`,
                add: `project.getConfigurations().implementation.setCanBeResolved(true)
                classpath += files(project.getConfigurations().getByName('implementation').asList())`
            },
            {
                remove: `repositories.mavenDeployer {`,
                add: `publishing {`
            },
            {
                remove: `// Deploy to react-native-event-bridge/maven, ready to publish to npm`,
                add: `repositories {`
            },
            {
                remove: `repository url: "file://\${projectDir}/../android/maven"`,
                add: `maven { url "file://\${projectDir}/../android/maven"  }`
            },
            {
                remove: `configureReactNativePom pom`,
                add: `}`
            }
        ]
    }
]

data.forEach(({ file, replacements }) => {
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            return console.log(err);
        }
        replacements.some(({ remove, add }, i) => {
            data = data.replace(remove, add);
        });
        fs.writeFile(file, data, 'utf8', (err) => {
            if (err) return console.log(err);
        });
    })
})

