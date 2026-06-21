// Ledger-page header: eyebrow label, serif title, optional description and
// action slot, closed off with a double rule (thick + thin) echoing a ledger
// statement's ruled header. `accent` tints the thick rule to differentiate
// portal rhythms: coral for ops (admin/agent/funder), pink for community.

export default function PageHeader({ eyebrow, title, description, action, accent = "coral" }) {
  return (
    <div className={`page-header accent-${accent}`}>
      <div className="page-header-row">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="page-header-rule">
        <div className="rule-thick" />
        <div className="rule-thin" />
      </div>
    </div>
  );
}
