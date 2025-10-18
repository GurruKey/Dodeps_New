import RoleGroupSection from './RoleGroupSection.jsx';

const metadata = {
  key: 'moderator',
  label: 'Модератор',
};

function ModeratorRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}

ModeratorRoleGroup.metadata = metadata;

export default ModeratorRoleGroup;
