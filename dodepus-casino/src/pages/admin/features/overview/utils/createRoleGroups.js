export default function createRoleGroups(columns) {
  return columns.reduce((accumulator, column) => {
    accumulator[column.key] = [];
    return accumulator;
  }, {});
}
