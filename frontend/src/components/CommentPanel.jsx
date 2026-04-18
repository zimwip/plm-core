import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { useWebSocket } from '../hooks/useWebSocket';

// ── Tree builder ──────────────────────────────────────────────────────────────

function buildTree(allComments) {
  const byId = {};
  allComments.forEach(c => { byId[c.id] = { ...c, children: [] }; });
  const roots = [];
  allComments.forEach(c => {
    if (c.parentCommentId && byId[c.parentCommentId]) {
      byId[c.parentCommentId].children.push(byId[c.id]);
    } else {
      roots.push(byId[c.id]);
    }
  });
  function sortLevel(nodes) {
    nodes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    nodes.forEach(n => sortLevel(n.children));
  }
  sortLevel(roots);
  return roots;
}

// Extract first #attrId from text for attributeName field
function extractAttrName(text) {
  const m = text.match(/#(\S+)/);
  return m ? m[1] : null;
}

// Detect active autocomplete trigger: returns { type, query, start } or null
function detectTrigger(text, cursorPos) {
  const before = text.slice(0, cursorPos);
  // Walk back from cursor looking for # or @ not preceded by a word char
  for (let i = before.length - 1; i >= 0; i--) {
    const ch = before[i];
    if (ch === '#' || ch === '@') {
      // Only trigger if preceded by space/newline or is at start
      if (i === 0 || /\s/.test(before[i - 1])) {
        const query = before.slice(i + 1);
        // No spaces inside the query
        if (!/\s/.test(query)) return { type: ch, query, start: i };
      }
      return null;
    }
    if (/\s/.test(ch)) return null;
  }
  return null;
}

// ── Rich text renderer ────────────────────────────────────────────────────────

function RichText({ text, attrMap, userMap }) {
  const parts = [];
  const re = /(#\S+|@\S+)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: 'text', value: text.slice(last, m.index) });
    const raw = m[0];
    if (raw.startsWith('#')) {
      const id = raw.slice(1);
      const label = attrMap[id];
      parts.push({ kind: 'attr', id, label });
    } else {
      const id = raw.slice(1);
      const name = userMap[id];
      parts.push({ kind: 'user', id, name });
    }
    last = m.index + raw.length;
  }
  if (last < text.length) parts.push({ kind: 'text', value: text.slice(last) });

  return (
    <span>
      {parts.map((p, i) => {
        if (p.kind === 'text') return <span key={i}>{p.value}</span>;
        if (p.kind === 'attr') return (
          <span key={i} className="mention-chip mention-attr" title={`Attribute: ${p.id}`}>
            #{p.label || p.id}
          </span>
        );
        return (
          <span key={i} className="mention-chip mention-user" title={`User: ${p.id}`}>
            @{p.name || p.id}
          </span>
        );
      })}
    </span>
  );
}

// ── Autocomplete dropdown ─────────────────────────────────────────────────────

function AutocompleteDropdown({ items, activeIdx, onSelect, onHover }) {
  return (
    <ul className="autocomplete-dropdown">
      {items.map((item, i) => (
        <li
          key={item.id}
          className={`autocomplete-item${i === activeIdx ? ' active' : ''}`}
          onMouseEnter={() => onHover(i)}
          onMouseDown={e => { e.preventDefault(); onSelect(item); }}
        >
          <span className="autocomplete-item-id">{item.prefix}{item.id}</span>
          {item.label && <span className="autocomplete-item-label">{item.label}</span>}
        </li>
      ))}
    </ul>
  );
}

// ── Top-level panel ───────────────────────────────────────────────────────────

export default function CommentPanel({
  nodeId,
  userId,
  width,
  onClose,
  filterVersionId,
  onClearFilter,
  users,
  triggerText,
  onClearTrigger,
}) {
  const [comments,  setComments]  = useState([]);
  const [text,      setText]      = useState('');
  const [replyTo,   setReplyTo]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [acState,   setAcState]   = useState(null); // { type, query, start } | null
  const [acIdx,     setAcIdx]     = useState(0);
  const textareaRef = useRef(null);

  const desc      = usePlmStore(s => s.activeNodeDescs[nodeId]);
  const versionId = desc?.currentVersionId;

  // Maps for rendering mentions
  const attrMap = useMemo(() => {
    const m = {};
    (desc?.attributes || []).forEach(a => { m[a.id] = a.label; });
    return m;
  }, [desc?.attributes]);

  const userMap = useMemo(() => {
    const m = {};
    (users || []).forEach(u => { m[u.id] = u.displayName || u.username; });
    return m;
  }, [users]);

  // Autocomplete candidates
  const acItems = useMemo(() => {
    if (!acState) return [];
    const q = acState.query.toLowerCase();
    if (acState.type === '#') {
      return (desc?.attributes || [])
        .filter(a => a.id.toLowerCase().includes(q) || a.label.toLowerCase().includes(q))
        .slice(0, 8)
        .map(a => ({ id: a.id, label: a.label, prefix: '#' }));
    }
    // '@' → users
    return (users || [])
      .filter(u => u.id.toLowerCase().includes(q) || (u.displayName || u.username || '').toLowerCase().includes(q))
      .slice(0, 8)
      .map(u => ({ id: u.id, label: u.displayName || u.username, prefix: '@' }));
  }, [acState, desc?.attributes, users]);

  const load = useCallback(async () => {
    if (!nodeId) return;
    try {
      const c = await api.getComments(userId, nodeId);
      setComments(Array.isArray(c) ? c : []);
    } catch {}
  }, [nodeId, userId]);

  useEffect(() => { load(); }, [load]);

  useWebSocket(
    nodeId ? `/topic/nodes/${nodeId}` : null,
    (evt) => { if (evt.event === 'COMMENT_ADDED') load(); },
    userId,
  );

  // Consume triggerText from parent (right-click on attribute)
  useEffect(() => {
    if (!triggerText) return;
    setText(triggerText);
    onClearTrigger?.();
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) { ta.focus(); ta.setSelectionRange(triggerText.length, triggerText.length); }
    }, 50);
  }, [triggerText]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setReplyTo(null);
    setText('');
    setAcState(null);
  }, [nodeId]);

  const tree = useMemo(() => buildTree(comments), [comments]);

  const visibleRoots = useMemo(() => {
    if (!filterVersionId) return tree;
    return tree.filter(root => root.versionId === filterVersionId);
  }, [tree, filterVersionId]);

  const totalVisible = useMemo(() => {
    function count(nodes) {
      return nodes.reduce((acc, n) => acc + 1 + count(n.children), 0);
    }
    return count(visibleRoots);
  }, [visibleRoots]);

  function handleTextChange(e) {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setText(val);
    const trigger = detectTrigger(val, pos);
    setAcState(trigger);
    setAcIdx(0);
  }

  function insertCompletion(item) {
    if (!acState) return;
    const before = text.slice(0, acState.start); // up to trigger char (exclusive)
    const after  = text.slice(acState.start + 1 + acState.query.length); // after query
    const inserted = item.prefix + item.id + ' ';
    const newText = before + inserted + after;
    setText(newText);
    setAcState(null);
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) {
        const cur = before.length + inserted.length;
        ta.focus();
        ta.setSelectionRange(cur, cur);
      }
    }, 0);
  }

  function handleKeyDown(e) {
    if (acState && acItems.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setAcIdx(i => Math.min(i + 1, acItems.length - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setAcIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertCompletion(acItems[acIdx]);
        return;
      }
      if (e.key === 'Escape') { setAcState(null); return; }
    }
    if (e.key === 'Enter' && e.ctrlKey && text.trim()) handlePost();
  }

  async function handlePost() {
    if (!text.trim() || !versionId) return;
    setLoading(true);
    try {
      const attrName = extractAttrName(text.trim());
      await api.addComment(userId, nodeId, versionId, text.trim(),
        replyTo?.id || null, attrName || null);
      setText('');
      setReplyTo(null);
      setAcState(null);
      await load();
    } catch {}
    finally { setLoading(false); }
  }

  const versionLabel = desc
    ? `${desc.revision ?? ''}${desc.iteration != null ? '.' + desc.iteration : ''}`
    : '';

  return (
    <div className="comment-panel" style={{ width }} onClick={() => acState && setAcState(null)}>

      {/* ── Header ── */}
      <div className="comment-panel-header">
        <span>
          Comments
          {comments.length > 0 && (
            <span className="comment-count-badge">{comments.length}</span>
          )}
        </span>
        <button className="comment-close-btn" onClick={onClose} title="Close">✕</button>
      </div>

      {/* ── Version filter banner ── */}
      {filterVersionId && (
        <div className="comment-filter-banner">
          <span>Filtered: rev {(() => {
            const sample = comments.find(c => c.versionId === filterVersionId);
            return sample ? `${sample.revision}.${sample.iteration}` : filterVersionId.slice(0, 8) + '…';
          })()} · {totalVisible} comment{totalVisible !== 1 ? 's' : ''}</span>
          <button className="comment-filter-clear" onClick={onClearFilter}>Show all</button>
        </div>
      )}

      {/* ── Thread list ── */}
      <div className="comment-panel-list">
        {visibleRoots.length === 0 ? (
          <div className="comment-empty">
            {filterVersionId ? 'No comments on this version' : 'No comments yet'}
          </div>
        ) : visibleRoots.map(root => (
          <CommentNode
            key={root.id}
            node={root}
            depth={0}
            onReply={setReplyTo}
            activeReplyId={replyTo?.id}
            userId={userId}
            attrMap={attrMap}
            userMap={userMap}
          />
        ))}
      </div>

      {/* ── Input ── */}
      <div className="comment-panel-input" onClick={e => e.stopPropagation()}>
        {versionId && versionLabel && (
          <div className="comment-version-context">
            Commenting on rev <strong>{versionLabel}</strong>
          </div>
        )}
        {replyTo && (
          <div className="comment-reply-context">
            <span>↩ Replying to <strong>{replyTo.author}</strong></span>
            <button className="comment-cancel-reply" onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}
        <div className="comment-input-wrap">
          <textarea
            ref={textareaRef}
            className="field-input comment-textarea"
            rows={3}
            placeholder={versionId ? 'Write a comment… (# attr, @ user, Ctrl+Enter to post)' : 'No version available'}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={!versionId || loading}
          />
          {acState && acItems.length > 0 && (
            <AutocompleteDropdown
              items={acItems}
              activeIdx={acIdx}
              onSelect={insertCompletion}
              onHover={setAcIdx}
            />
          )}
        </div>
        <button
          className="btn btn-sm btn-success comment-post-btn"
          disabled={!text.trim() || !versionId || loading}
          onClick={handlePost}
        >
          {replyTo ? '↩ Post reply' : 'Post comment'}
        </button>
      </div>
    </div>
  );
}

// ── Recursive comment node ────────────────────────────────────────────────────

const MAX_INDENT_PX = 72;
const INDENT_PER_LEVEL_PX = 16;

function CommentNode({ node, depth, onReply, activeReplyId, userId, attrMap, userMap }) {
  const indentPx = Math.min(depth * INDENT_PER_LEVEL_PX, MAX_INDENT_PX);
  const isHighlighted = activeReplyId === node.id;

  return (
    <div style={{ marginLeft: depth > 0 ? indentPx : 0 }}>
      <CommentItem
        comment={node}
        onReply={onReply}
        isReply={depth > 0}
        isHighlighted={isHighlighted}
        isOwn={node.author === userId}
        attrMap={attrMap}
        userMap={userMap}
      />
      {node.children.length > 0 && (
        <div
          className="comment-children"
          style={{ borderLeft: `2px solid var(--border2)`, marginLeft: 10 }}
        >
          {node.children.map(child => (
            <CommentNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onReply={onReply}
              activeReplyId={activeReplyId}
              userId={userId}
              attrMap={attrMap}
              userMap={userMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single comment item ───────────────────────────────────────────────────────

function CommentItem({ comment: c, onReply, isReply, isHighlighted, isOwn, attrMap, userMap }) {
  const dateStr = c.createdAt
    ? new Date(c.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : '';

  const cls = [
    'comment-item',
    isReply       ? 'comment-reply'       : '',
    isHighlighted ? 'comment-highlighted' : '',
    isOwn         ? 'comment-own'         : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <div className="comment-meta">
        <span className={isOwn ? 'comment-author comment-author-own' : 'comment-author'}>
          {c.author}
          {isOwn && <span className="comment-you-badge">you</span>}
        </span>
        {c.attributeName && (
          <span className="comment-attr-badge" title={`Attribute: ${c.attributeName}`}>
            #{attrMap[c.attributeName] || c.attributeName}
          </span>
        )}
        <span className="comment-version" title={`Version ID: ${c.versionId}`}>
          {c.revision}.{c.iteration}
        </span>
        <span className="comment-time">{dateStr}</span>
      </div>
      <div className="comment-text">
        <RichText text={c.text} attrMap={attrMap} userMap={userMap} />
      </div>
      <button
        className="comment-reply-btn"
        onClick={() => onReply({ id: c.id, author: c.author })}
      >
        ↩ Reply
      </button>
    </div>
  );
}
