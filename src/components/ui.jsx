import { FiInbox, FiX } from "react-icons/fi";
import { formatDate } from "../utils/helpers";

export const Spinner = ({ label = "Loading" }) => (
  <div className="spinner-wrap" role="status" aria-live="polite">
    <span className="spinner" />
    <span>{label}...</span>
  </div>
);

export const PageHeader = ({ icon: Icon, title, subtitle, actions }) => (
  <div className="page-header">
    <div className="page-header-text">
      {Icon && (
        <span className="page-header-icon">
          <Icon />
        </span>
      )}
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>
);

export const EmptyState = ({ icon: Icon = FiInbox, title, hint, action }) => (
  <div className="empty">
    <Icon />
    <h3>{title}</h3>
    {hint && <p>{hint}</p>}
    {action}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, tone = "teal" }) => (
  <div className={`stat stat-${tone}`}>
    <span className="stat-icon">
      <Icon />
    </span>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export const Badge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status}</span>
);

export const Modal = ({ title, onClose, children, footer }) => (
  <div className="modal-backdrop" onMouseDown={onClose}>
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <FiX />
        </button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-foot">{footer}</div>}
    </div>
  </div>
);

export const Field = ({ label, hint, children }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);

/** Queue-ticket style appointment card. Token number is the star. */
export const Ticket = ({ appt, primary, secondary, children }) => (
  <article className={`ticket ticket-${appt.status}`}>
    <div className="ticket-token">
      <span>Token</span>
      <strong>{appt.tokenNumber ?? "-"}</strong>
    </div>
    <div className="ticket-main">
      <div className="ticket-top">
        <h3>{primary}</h3>
        <Badge status={appt.status} />
      </div>
      {secondary && <p className="ticket-sub">{secondary}</p>}
      <p className="ticket-when">
        {formatDate(appt.date)} at {appt.time}
      </p>
      {children}
    </div>
  </article>
);
