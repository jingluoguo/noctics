---
category: Flutter
updatedAt: 2026-04-20
tags: form, state-management, ux
summary: 拆分输入、校验、提交三层，提升复杂表单的稳定性与可维护性。
---
# Flutter 中复杂表单与状态管理实践

在复杂表单里，我更倾向于把**输入、校验、提交**拆成三个层次。

- 输入层只负责收集状态
- 校验层只负责规则
- 提交层只负责副作用

这样表单会更稳定，也更容易复用。
