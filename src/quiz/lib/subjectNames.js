// 科目名称映射

export const SUBJECT_NAMES = {
  'computer-organization': '计算机组成原理',
  'data-structure': '数据结构',
  'operating-system': '操作系统',
  'computer-network': '计算机网络',
}

export function getSubjectDisplayName(subjectId) {
  return SUBJECT_NAMES[subjectId] || subjectId
}