export default {
  extends: ['@commitlint/config-conventional'],
  // subject-empty: 提交信息主题不能为空。
  // type-empty: 提交信息类型不能为空。
  // type-enum: 提交信息类型必须在预定义的类型列表中。
  // subject-case: 提交信息主题的大小写
  rules: {
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'subject-case': [0],
  },
};
