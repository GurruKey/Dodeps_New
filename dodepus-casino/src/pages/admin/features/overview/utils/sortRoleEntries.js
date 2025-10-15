import compareRoleEntries from './compareRoleEntries.js';

export default function sortRoleEntries(groups, columns) {
  return columns.reduce((accumulator, column) => {
    const entries = Array.isArray(groups[column.key]) ? [...groups[column.key]] : [];
    entries.sort(compareRoleEntries);
    accumulator[column.key] = entries;
    return accumulator;
  }, {});
}
