module.exports = {
    'extends': ['@commitlint/config-conventional'],
    'defaultIgnores': false,
    'rules': {
        'type-enum': [2, 'always', [
            'fix',
            'feat',
            'test',
            'deprecate',
            'build',
            'chore',
            'doc',
            'lint',
            'refactor',
        ]],
        'scope-enum': [2, 'always', [
            'pkg:array',
            'pkg:async',
            'pkg:concurrent',
            'pkg:flow-control',
            'pkg:network',
            'pkg:number',
            'pkg:object',
            'pkg:string',
            'pkg:test',
            'pkg:ts-types',
        ]],
        'scope-case': [2, 'always', {
            'cases': ['lower-case'],
            'delimiters': [':'],
        }],
        'scope-empty': [0, 'never'],
        'subject-min-length': [2, 'always', 5],
        'subject-max-length': [2, 'always', 50],
    }
};
