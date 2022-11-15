const fs = require('fs');

const files = [{
    file: `node_modules/react-native-mmkv-storage/dist/src/hooks/useMMKV.js`,
    replacements: [
        {
            replaced: 'return function (key, defaultValue) {',
            replacement: 'return function (key, defaultValue, equalityFn) {'
        },
        {
            replaced: 'return useMMKVStorage(key, storage, defaultValue);',
            replacement: 'return useMMKVStorage(key, storage, defaultValue, equalityFn);'
        },
        {
            replaced: 'export var useMMKVStorage = function (key, storage, defaultValue) {',
            replacement: 'export var useMMKVStorage = function (key, storage, defaultValue, equalityFn) {'
        },
        {
            replaced: `var _value = event.value ? methods[type]['copy'](event.value) : event.value;`,
            replacement: `var _value = event.value ? methods[type]['copy'](event.value) : event.value;\rif (prevValue.current === _value || (equalityFn === null || equalityFn === void 0 ? void 0 : equalityFn(prevValue.current, _value)))
            return;`
        },
        {
            replaced: `setValue(_value);
            setValueType(_valueType);`,
            replacement: `if (prevValue.current === _value || (equalityFn === null || equalityFn === void 0 ? void 0 : equalityFn(prevValue.current, _value)))
            return [2 /*return*/];
        //@ts-ignore
        setValue(_value);
        setValueType(_valueType);`
        }
    ]
},
{
    file: `node_modules/react-native-mmkv-storage/dist/src/hooks/useMMKV.d.ts`,
    replacements: [
        {
            replaced: `<T>(key: string, defaultValue: T): [
        value: T,
        setValue: (value: T | ((prevValue: T) => T)) => void
    ];`,
            replacement: `<T>(key: string, defaultValue: T): [
                value: T,
                setValue: (value: T | ((prevValue: T) => T)) => void
            ];
            <T>(key: string, defaultValue: T, equalityFn?: (prev: T | undefined, next: T | undefined) => boolean): [value: T, setValue: (value: T | ((prevValue: T) => T)) => void];`
        },
        {
            replaced: `* @param defaultValue Default value if any`,
            replacement: `* @param defaultValue Default value if any
            * @param equalityFn Provide a custom function to handle state update if value has changed.`
        },
        {
            replaced: `};
export {};`,
            replacement: `<T>(key: string, storage: MMKVInstance, defaultValue: T | undefined, equalityFn?: (prev: T | undefined, next: T | undefined) => boolean): [value: T, setValue: (value: T | ((prevValue: T) => T)) => void];
        };
        export { };`
        }
    ]
}
];

files.forEach(({ file, replacements }) => {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        // console.log("data", data);
        let result = data
        for (const { replaced, replacement } of replacements) {
            if (!result?.includes(replacement))
                result = result.replace(replaced, replacement);
        }
        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
});
