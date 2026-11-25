import type { ReactNode } from 'react';
import Icon from './Icon';
import type { IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export default function EmptyState({ icon = 'utensils', title, children, actions }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={28} />
      </span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  );
}
