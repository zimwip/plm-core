import React, { useState, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   UserManual — inline help reference for every settings section.
   Rendered as a two-panel layout: sticky mini-nav on the left, scrollable
   content on the right. No external dependencies.
───────────────────────────────────────────────────────────────────────────── */

/* ── Shared prose primitives ─────────────────────────────────────────────── */
function H2({ id, children }) {
  return (
    <h2 id={id} style={{
      fontSize: 16, fontWeight: 700, color: 'var(--text)',
      margin: '0 0 10px', paddingTop: 4,
      borderBottom: '1px solid var(--border)', paddingBottom: 8,
    }}>
      {children}
    </h2>
  );
}
function H3({ children }) {
  return (
    <h3 style={{
      fontSize: 13, fontWeight: 600, color: 'var(--accent)',
      margin: '20px 0 6px', textTransform: 'uppercase', letterSpacing: '.06em',
    }}>
      {children}
    </h3>
  );
}
function P({ children }) {
  return <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.65, color: 'var(--text)' }}>{children}</p>;
}
function Code({ children }) {
  return (
    <code style={{
      fontFamily: 'var(--mono)', fontSize: 11, background: 'rgba(100,116,139,.15)',
      border: '1px solid rgba(100,116,139,.2)', borderRadius: 3, padding: '1px 5px',
      color: 'var(--accent)',
    }}>
      {children}
    </code>
  );
}
function Note({ children }) {
  return (
    <div style={{
      background: 'rgba(232,169,71,.08)', border: '1px solid rgba(232,169,71,.25)',
      borderRadius: 6, padding: '8px 12px', fontSize: 12, lineHeight: 1.6,
      color: 'var(--text)', margin: '10px 0',
    }}>
      <strong style={{ color: '#e8a947' }}>Note: </strong>{children}
    </div>
  );
}
function Tip({ children }) {
  return (
    <div style={{
      background: 'rgba(91,156,246,.08)', border: '1px solid rgba(91,156,246,.25)',
      borderRadius: 6, padding: '8px 12px', fontSize: 12, lineHeight: 1.6,
      color: 'var(--text)', margin: '10px 0',
    }}>
      <strong style={{ color: 'var(--accent)' }}>Tip: </strong>{children}
    </div>
  );
}
function Field({ name, type, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{name}</span>
        {type && (
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>
            {type}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--muted)', paddingLeft: 10, borderLeft: '2px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}
function OptionTable({ rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 10 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <th style={{ textAlign: 'left', padding: '4px 8px 4px 0', color: 'var(--muted)', fontWeight: 600, width: '30%' }}>Value</th>
          <th style={{ textAlign: 'left', padding: '4px 0', color: 'var(--muted)', fontWeight: 600 }}>Meaning</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([val, desc]) => (
          <tr key={val} style={{ borderBottom: '1px solid rgba(100,116,139,.08)' }}>
            <td style={{ padding: '5px 8px 5px 0', verticalAlign: 'top' }}>
              <Code>{val}</Code>
            </td>
            <td style={{ padding: '5px 0', verticalAlign: 'top', color: 'var(--text)', lineHeight: 1.55 }}>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function Section({ children }) {
  return <div style={{ marginBottom: 32 }}>{children}</div>;
}
function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '28px 0' }} />;
}

/* ── TOC entries ─────────────────────────────────────────────────────────── */
const TOC = [
  { id: 'node-types',    label: 'Node Types'     },
  { id: 'lifecycles',    label: 'Lifecycles'     },
  { id: 'proj-spaces',   label: 'Project Spaces' },
  { id: 'users-roles',   label: 'Users & Roles'  },
  { id: 'access-rights', label: 'Access Rights'  },
];

/* ── Main component ──────────────────────────────────────────────────────── */
export default function UserManual() {
  const [active, setActive] = useState('node-types');
  const contentRef = useRef(null);

  function scrollTo(id) {
    setActive(id);
    const el = document.getElementById('manual-' + id);
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Mini TOC */}
      <div style={{
        width: 160, flexShrink: 0, borderRight: '1px solid var(--border)',
        padding: '16px 0', overflowY: 'auto',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase',
          letterSpacing: '.08em', padding: '0 14px 10px' }}>
          Contents
        </div>
        {TOC.map(({ id, label }) => (
          <div
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              padding: '6px 14px', fontSize: 12, cursor: 'pointer',
              color: active === id ? 'var(--accent)' : 'var(--muted)',
              background: active === id ? 'rgba(91,156,246,.08)' : 'transparent',
              borderLeft: active === id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all .15s',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 40px' }}>

        {/* ── NODE TYPES ──────────────────────────────────────────────── */}
        <div id="manual-node-types">
          <H2 id="node-types">Node Types</H2>
          <P>
            A <strong>Node Type</strong> is the blueprint for any object you create in the product structure — a component, an assembly, a document, a requirement, etc. Every node belongs to exactly one type and inherits that type's attributes, lifecycle, versioning rules, and link constraints.
          </P>

          <H3>Identity</H3>
          <P>
            Each node can carry a human-readable <em>logical identifier</em> (separate from its internal UUID). The identity settings control how that identifier is displayed and validated.
          </P>
          <Field name="Label" type="text">
            The display label used in the UI for the identifier field (e.g. "Part Number", "Doc ID"). Defaults to "Identifier".
          </Field>
          <Field name="Validation Pattern" type="regex">
            An optional regular expression that the logical ID must match. If blank, any value is accepted.
            Example: <Code>{"^[A-Z]{2}-\\d{4}$"}</Code> enforces two uppercase letters, a dash, and four digits.
          </Field>

          <H3>Lifecycle</H3>
          <P>
            Assign a lifecycle to the node type to enable state-based workflows (Draft → Review → Frozen → Released). Nodes without a lifecycle remain in their initial state and cannot be transitioned.
          </P>
          <Field name="Lifecycle" type="select">
            The lifecycle that governs nodes of this type. Setting it to "None" disables lifecycle management for this node type.
          </Field>

          <H3>Versioning</H3>
          <P>
            Versioning settings control how the visible version identifier (<Code>revision.iteration</Code>, e.g. <Code>A.3</Code>) advances when a node is checked out or released.
          </P>
          <Field name="Numbering Scheme" type="select">
            Determines the alphabet used for revision letters.
            <OptionTable rows={[
              ['ALPHA_NUMERIC', 'Revisions advance A → B → … → Z → AA → AB … Standard PLM convention.'],
            ]} />
          </Field>
          <Field name="Version Policy" type="select">
            Controls what happens to the version number when a user checks out a node.
            <OptionTable rows={[
              ['NONE',    'Checkout creates a new technical version for traceability but does not advance the visible revision.iteration. Use for types where every save is tracked internally but the displayed identifier must stay stable.'],
              ['ITERATE', 'Checkout increments the iteration: A.1 → A.2. Use for normal work-in-progress types where each save is a new draft of the same revision.'],
              ['RELEASE', 'Checkout starts a new revision and resets iteration to 1: A.3 → B.1. Use for types that follow a formal release cycle where a new revision means a significant change.'],
            ]} />
          </Field>
          <Field name="Collapse history on release" type="checkbox">
            When enabled, the intermediate working iterations are purged from history each time a node enters a <strong>Released</strong> state.
            <br /><br />
            <strong>What happens:</strong>
            <ul style={{ margin: '6px 0 0 16px', paddingLeft: 0, listStyleType: 'disc', fontSize: 12, lineHeight: 1.7 }}>
              <li>All working iterations of the previous revision are deleted (<Code>A.1</Code>, <Code>A.2</Code>, <Code>A.3</Code> — all gone).</li>
              <li>The new Released version has its iteration stripped and displays as the bare revision letter (e.g. <Code>B.1</Code> → <Code>B</Code>).</li>
              <li>Versions that are pinned in a baseline or referenced by a VERSION_TO_VERSION link are never deleted.</li>
            </ul>
            <br />
            <strong>Result:</strong> version history reads <Code>B</Code>, <Code>C</Code>, <Code>D</Code> (one entry per release) instead of <Code>A.1</Code>, <Code>A.2</Code>, <Code>A.3</Code>, <Code>B.1</Code>, …
            <Note>Only applies to node types whose lifecycle has a Released state (<Code>isReleased = true</Code>).</Note>
          </Field>

          <H3>Attributes</H3>
          <P>
            Attributes are the structured data fields attached to every version of a node of this type (title, description, material, weight, etc.). Each attribute is independently configurable.
          </P>
          <Field name="Name (internal key)" type="text">
            The machine-readable key stored in the database. Must be unique within the node type. Cannot be changed after creation. Use camelCase or snake_case (e.g. <Code>reviewNote</Code>, <Code>material_grade</Code>).
          </Field>
          <Field name="Label (display)" type="text">
            The human-readable label shown in forms and tables (e.g. "Review Note", "Material Grade").
          </Field>
          <Field name="Data Type" type="select">
            The underlying data type for validation and storage.
            <OptionTable rows={[
              ['STRING',  'Free text.'],
              ['NUMBER',  'Numeric value (integer or decimal).'],
              ['DATE',    'ISO date value.'],
              ['BOOLEAN', 'True / False toggle.'],
              ['ENUM',    'One value from a predefined list (configure the list separately).'],
            ]} />
          </Field>
          <Field name="Widget" type="select">
            The UI control rendered in the editor for this attribute.
            <OptionTable rows={[
              ['TEXT',        'Single-line text input.'],
              ['TEXTAREA',    'Multi-line text area.'],
              ['DROPDOWN',    'Dropdown selector (required for ENUM type).'],
              ['DATE_PICKER', 'Calendar date picker (recommended for DATE type).'],
              ['CHECKBOX',    'Toggle checkbox (recommended for BOOLEAN type).'],
            ]} />
          </Field>
          <Field name="Section" type="text">
            Groups this attribute under a named panel in the editor (e.g. "Mechanical", "Review"). Attributes with no section appear in the default group.
          </Field>
          <Field name="Order" type="number">
            Display order within the section. Lower numbers appear first.
          </Field>
          <Field name="Required field" type="checkbox">
            When checked, this attribute must be filled before a node can advance past states configured as requiring it (via Attribute State Rules). Does not block saving; only blocks lifecycle transitions where the rule is active.
          </Field>
          <Field name="Use as display name ★" type="checkbox">
            Marks this attribute as the human-readable title of the node. Its value appears in node lists, search results, and link pickers. Only one attribute per node type can be the display name.
          </Field>

          <H3>Link Types (Outgoing)</H3>
          <P>
            A link type defines an allowed relationship from this node type to another. Links are version-aware and carry a versioning policy.
          </P>
          <Field name="Link Name" type="text">
            Internal name for the relationship (e.g. <Code>composed_of</Code>, <Code>references</Code>).
          </Field>
          <Field name="Target Node Type" type="select">
            The node type that can appear on the other end of this link.
          </Field>
          <Field name="Link Policy" type="select">
            Controls how the link resolves over time.
            <OptionTable rows={[
              ['VERSION_TO_MASTER',  'The link always points to the latest committed version of the target. When the target is updated and committed, all parents automatically see the new version. Use for live BOM structures. Requires the parent to be locked (checked out) when the target is modified.'],
              ['VERSION_TO_VERSION', 'The link is frozen to the exact target version at the time the link was created. The parent always sees the same snapshot of the child regardless of future changes. Use for reference documentation or frozen configurations.'],
            ]} />
          </Field>
          <Field name="Min Cardinality" type="number">
            Minimum number of links of this type required per node version. <Code>0</Code> means the link is optional.
          </Field>
          <Field name="Max (blank = unlimited)" type="number">
            Maximum number of links allowed. Leave blank for no upper limit.
          </Field>
          <Field name="Color" type="color">
            Visual color used to draw this link in the graph view.
          </Field>

          <Tip>After creating a link type you can add attributes to it (e.g. "quantity", "reference designator") via the Edit link type panel. You can also define cascade rules that automatically propagate lifecycle transitions through the link.</Tip>
        </div>

        <Divider />

        {/* ── LIFECYCLES ──────────────────────────────────────────────── */}
        <div id="manual-lifecycles">
          <H2 id="lifecycles">Lifecycles</H2>
          <P>
            A <strong>Lifecycle</strong> defines the states an object can be in and the valid transitions between them. It encodes the approval and release workflow for a node type.
          </P>

          <H3>Lifecycle Properties</H3>
          <Field name="Name" type="text">Name displayed in the UI and referenced by node types.</Field>
          <Field name="Description" type="text">Optional free-text explanation of the lifecycle's purpose.</Field>

          <H3>States</H3>
          <P>
            States represent stages in the lifecycle (e.g. Draft, In Review, Frozen, Released). Every node version has exactly one current state.
          </P>
          <Field name="State Name" type="text">
            Display label for the state. Short, descriptive names work best (e.g. "Draft", "Frozen").
          </Field>
          <Field name="Display Order" type="number">
            Order in which states appear in dropdowns and diagrams. Lower = earlier in the flow.
          </Field>
          <Field name="Color" type="color">
            Color used to represent this state in the UI (state pills, timeline dots). Pick a color that intuitively maps to the state's meaning — green for released, yellow for in-review, grey for draft.
          </Field>
          <Field name="isInitial" type="tag">
            Marks this as the entry state. Every newly created node starts here. Only one state per lifecycle can be initial.
          </Field>
          <Field name="isFrozen" type="tag">
            A frozen state locks the node's content. When a node enters a frozen state, the lock cascades to all children connected via VERSION_TO_MASTER links — they cannot be independently modified until the parent is unfrozen. Required before a baseline can be taken.
          </Field>
          <Field name="isReleased" type="tag">
            Marks the state as a release milestone. Reaching this state is what triggers the <em>Collapse history</em> feature (if enabled on the node type). Typically only one state per lifecycle is released.
          </Field>

          <H3>Transitions</H3>
          <P>
            Transitions define which state changes are allowed and under what conditions. A transition always goes from one specific state to another.
          </P>
          <Field name="Transition Name" type="text">
            Label shown on the action button that triggers this transition (e.g. "Freeze", "Release", "Reject"). Keep it short and verb-form.
          </Field>
          <Field name="From State / To State" type="select">
            The source and target states for this transition. A node must be in the From State for the transition to appear.
          </Field>
          <Field name="Guard Expression" type="text">
            An optional server-side condition that must be satisfied before the transition is allowed. If the guard fails, the transition button is blocked and an error is shown.
            <OptionTable rows={[
              ['all_required_filled', 'All attributes marked Required must have a non-empty value in the current version.'],
              ['all_signatures_done', 'All signature requirements for this transition must have been fulfilled.'],
              ['(blank)',             'No guard — the transition is always allowed when the node is in the From State.'],
            ]} />
          </Field>
          <Field name="Action Type" type="select">
            A server-side action executed as part of this transition.
            <OptionTable rows={[
              ['NONE',              'No action — the transition simply changes the state.'],
              ['REQUIRE_SIGNATURE', 'Collects an electronic signature from the current user as part of the transition. The signature is stored permanently against the version.'],
            ]} />
          </Field>
          <Field name="Version Strategy" type="select">
            Controls how the version number changes when this transition is triggered.
            <OptionTable rows={[
              ['NONE',    'Creates a new technical version (for audit trail) but keeps the same revision.iteration visible to users. Used for state changes that are purely administrative.'],
              ['ITERATE', 'Increments the iteration (A.2 → A.3). Unusual for a lifecycle transition; more common for checkouts.'],
              ['REVISE',  'Starts a new revision and resets iteration to 1 (A.3 → B.1). Typically used on the Release transition to mark a new formal revision of the product.'],
            ]} />
          </Field>

          <H3>Cascade Rules</H3>
          <P>
            Cascade rules automate lifecycle propagation through links. When a parent node undergoes a transition, eligible child nodes are automatically transitioned as well — without manual action.
          </P>
          <P>
            Rules are configured inside the link type: you specify which parent transition triggers which child transition, and from which child state. Children not in the expected state are silently skipped (they are already beyond or not yet at that stage).
          </P>
          <Note>Cascade is only applied through VERSION_TO_MASTER links. VERSION_TO_VERSION links point to frozen snapshots and are never cascaded.</Note>
        </div>

        <Divider />

        {/* ── PROJECT SPACES ──────────────────────────────────────────── */}
        <div id="manual-proj-spaces">
          <H2 id="proj-spaces">Project Spaces</H2>
          <P>
            A <strong>Project Space</strong> is an organisational container that groups nodes and controls access. Every node creation request must specify a project space. Access rights (which roles can do what) are configured per project space.
          </P>
          <P>
            Think of a project space as a "workspace" or "programme" — you might have one per product line, customer project, or development phase.
          </P>
          <Field name="Name" type="text">
            Short, unique name for the space (e.g. "Prototype-2026", "Certification-A320"). Shown in the project space selector at the top of the application.
          </Field>
          <Field name="Description" type="text">
            Optional free-text explaining the purpose or scope of this project space.
          </Field>
          <Note>Deleting a project space does not delete the nodes inside it — it removes only the space record. Nodes retain their project_space_id as a plain reference.</Note>
        </div>

        <Divider />

        {/* ── USERS & ROLES ───────────────────────────────────────────── */}
        <div id="manual-users-roles">
          <H2 id="users-roles">Users &amp; Roles</H2>

          <H3>Roles</H3>
          <P>
            A <strong>Role</strong> is a named group of permissions (e.g. DESIGNER, REVIEWER, READER). Users are assigned roles within a project space. The role determines what actions the user can perform on which node types.
          </P>
          <Field name="Name" type="text">
            Internal name for the role. By convention use UPPER_CASE (e.g. <Code>DESIGNER</Code>). This name is referenced in permission rules and signature requirements.
          </Field>
          <Field name="Description" type="textarea">
            Human-readable explanation of who should hold this role (e.g. "Engineers who create and modify parts").
          </Field>
          <Tip>Create roles that map to real job functions, not individual people. A user can hold multiple roles — combine them to grant additive permissions.</Tip>

          <H3>Users</H3>
          <P>
            Users are the people who log in to the system. Each user is identified by a username (sent in the <Code>X-PLM-User</Code> HTTP header). Users are created here and then assigned roles in specific project spaces.
          </P>
          <Field name="Username" type="text">
            Unique login identifier (e.g. <Code>john.doe</Code>). This is the value placed in the <Code>X-PLM-User</Code> header. Cannot be changed after creation.
          </Field>
          <Field name="Display Name" type="text">
            Full human-readable name shown in the UI (e.g. "John Doe").
          </Field>
          <Field name="Email" type="email">
            Contact email address. Stored for reference; not used for authentication in the current setup.
          </Field>
          <Field name="Admin status" type="select">
            <OptionTable rows={[
              ['User',  'Standard user — access governed entirely by role assignments.'],
              ['Admin', 'System administrator — bypasses all permission checks and can perform any action in any project space. Use sparingly.'],
            ]} />
          </Field>

          <H3>Role Assignments</H3>
          <P>
            A role assignment connects a <strong>user</strong>, a <strong>role</strong>, and a <strong>project space</strong>. The user gains all permissions granted to that role within that specific project space.
          </P>
          <P>
            A user can hold multiple role assignments — for example, DESIGNER in Project-A and READER in Project-B, or DESIGNER + REVIEWER in the same project space (permissions are additive).
          </P>
        </div>

        <Divider />

        {/* ── ACCESS RIGHTS ───────────────────────────────────────────── */}
        <div id="manual-access-rights">
          <H2 id="access-rights">Access Rights</H2>
          <P>
            Access Rights define what each role is allowed to do. The system uses two levels of permissions: <strong>global actions</strong> and <strong>node-type/project-space actions</strong>.
          </P>

          <H3>Global Permissions</H3>
          <P>
            Global permissions control system-wide administrative capabilities, independent of any project space or node type.
          </P>
          <Note>
            "Zero grants = action open to all roles." — If no role has been granted a global permission, the action is unrestricted. As soon as any role is granted a permission, only that role (and admins) can perform it.
          </Note>
          <OptionTable rows={[
            ['MANAGE_METAMODEL', 'Create and edit node types, lifecycles, attributes, link types, and cascade rules.'],
            ['MANAGE_ROLES',     'Create and edit roles, users, project spaces, and role assignments.'],
            ['CREATE_NODE',      'Create new nodes (top-level action, independently of node type).'],
          ]} />

          <H3>Node Type × Project Space Permission Matrix</H3>
          <P>
            The matrix table shows all combinations of node types (rows) and actions (columns) for a given project space. Toggle the circle icon in any cell to grant or revoke that permission for the current role.
          </P>
          <P>
            <strong>Action column types:</strong>
          </P>
          <Field name="NODE scope actions" type="column">
            Standard CRUD and workflow actions that apply to nodes of that type (e.g. checkout, checkin, create link, delete).
          </Field>
          <Field name="LIFECYCLE scope actions" type="column">
            Columns labelled "<em>From State → Transition Name</em>" represent individual lifecycle transitions. Granting this permission allows the role to fire that specific transition on nodes of that type within this project space.
          </Field>

          <H3>How Permissions Stack</H3>
          <P>
            Permissions are evaluated in this order. Each layer can only restrict, never expand, what the higher layer allowed:
          </P>
          <ol style={{ margin: '0 0 12px 18px', paddingLeft: 0, fontSize: 13, lineHeight: 2, color: 'var(--text)' }}>
            <li><strong>Attribute State Rules</strong> — declares which attributes are editable, visible, or required based on the lifecycle state.</li>
            <li><strong>Attribute Views</strong> — can further restrict (never widen) attribute visibility/editability for a specific role × state combination.</li>
            <li><strong>Node Type Permission <Code>can_write</Code></strong> — if false for the role, the entire node type becomes read-only regardless of other rules.</li>
            <li><strong>Transition Permission</strong> — filters the list of lifecycle transitions available to the role.</li>
          </ol>
          <Tip>Start with broad node-type permissions and use attribute views to fine-tune field-level access by role. Only add transition restrictions when you need formal approval gates.</Tip>
        </div>

      </div>
    </div>
  );
}
