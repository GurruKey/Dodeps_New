import { Nav } from 'react-bootstrap';
import { createNavItems } from './createNavItems.jsx';
import { SidebarNavLink } from './SidebarNavLink.jsx';
import { formatBalance, pickRankBadgeMeta, pickVerificationMeta } from './meta.js';

export function ProfileSidebarBlock({ user, verificationSummary, rankSummary }) {
  const currency = user?.currency || 'USD';
  const balance = user?.balance ?? 0;

  const rankMeta = pickRankBadgeMeta(rankSummary);
  const verificationMeta = pickVerificationMeta(verificationSummary);
  const balanceLabel = formatBalance(balance, currency);

  const navItems = createNavItems({
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
