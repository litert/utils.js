module.exports = {
    'extends': ['@commitlint/config-conventional'],
    'defaultIgnores': false,
    'rules': {
        'type-enum': [2, 'always', [
            'fix',
            'feat',
            'test',
            'deprecate',
            'build'
        ]],
        'scope-enum': [2, 'always', [
            'pkg:array',
            'pkg:object',
            'pkg:string',
            'pkg:network',
            'pkg:ts-types',
            'deps',
            'doc',
            'lint',
            'project'
        ]],
        'scope-empty': [2, 'never'],
        'subject-min-length': [2, 'always', 5],
        'subject-max-length': [2, 'always', 50],
    }
};
