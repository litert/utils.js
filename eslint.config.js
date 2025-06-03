// eslint.config.js
const LitertEslintRules = require('@litert/eslint-plugin-rules');

module.exports = [
    ...LitertEslintRules.configs.typescript,
    {
        files: [
            'packages/partials/*/src/**/*.ts',
            'packages/bundle/src/**/*.ts',
        ],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.base.json',
                tsconfigRootDir: __dirname,
            },
        }
    },
];
