import { Nav } from 'react-bootstrap';
import { createProfileNavItems } from '@/pages/profile/layout/createNavItems.jsx';
import SidebarNavLink from '../SidebarNavLink';
import {
  formatProfileBalance,
  pickProfileRankMeta,
  pickProfileVerificationMeta,
} from '@/pages/profile/layout/meta';

export function ProfileSidebarBlock({ user, verificationSummary, rankSummary }) {
  const currency = user?.currency || 'USD';
  const balance = user?.balance ?? 0;

  const rankMeta = pickProfileRankMeta(rankSummary);
  const verificationMeta = pickProfileVerificationMeta(verificationSummary);
  const balanceLabel = formatProfileBalance(balance, currency);

  const navItems = createProfileNavItems({
    balanceLabel,
    verificationMeta,
    rankMeta,
  });

  return (
    <div className="sticky-top pt-3">
      <Nav variant="pills" className="flex-column gap-1">
        {navItems.map((item) => {
          if (item.type === 'divider') {
            return (
              <div
                key={item.key}
                className="border-top border-secondary opacity-50 my-2"
              />
            );
          }

          return <SidebarNavLink key={item.key} item={item} />;
        })}
      </Nav>
    </div>
  );
}

export default ProfileSidebarBlock;
