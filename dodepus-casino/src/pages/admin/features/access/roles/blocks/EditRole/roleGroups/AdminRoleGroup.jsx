import RoleGroupSection from './RoleGroupSection.jsx';

const metadata = {
  key: 'admin',
  label: 'Админ',
};

function AdminRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}

AdminRoleGroup.metadata = metadata;

export default AdminRoleGroup;
