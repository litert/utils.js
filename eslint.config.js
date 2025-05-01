// eslint.config.js
const LitertEslintRules = require('@litert/eslint-plugin-rules');

module.exports = [
    {

        plugins: {
            '@litert/rules': LitertEslintRules,
        },
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.base.json',
                tsconfigRootDir: __dirname,
            },
        }
    },
    ...LitertEslintRules.configs.typescript,
    {
        files: [
            'packages/partials/*/src/**/*.ts',
            'packages/bundle/src/**/*.ts',
        ],
    }
];
