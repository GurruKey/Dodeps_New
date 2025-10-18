import RoleGroupSection from './RoleGroupSection.jsx';

const metadata = {
  key: 'staff',
  label: 'Админ стаф',
};

function StaffRoleGroup(props) {
  return <RoleGroupSection {...props} />;
}

StaffRoleGroup.metadata = metadata;

export default StaffRoleGroup;
