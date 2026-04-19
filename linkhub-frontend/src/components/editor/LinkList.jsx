import { useState } from 'react';
import { Card, SectionTitle, Toggle, DragIcon, TrashIcon, inlineInput, bluePillBtn } from './ui';

export default function LinkList({
  links,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  onToggle,
  onBatchToggle,
  onBatchDelete,
  newLinkId,
  onNewLinkFocused,
}) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(links.map(l => l.id)));
  }

  async function handleBatchToggle() {
    if (selectedIds.size === 0) return;
    await onBatchToggle?.([...selectedIds]);
    exitSelectMode();
  }

  async function handleBatchDelete() {
    if (selectedIds.size === 0) return;
    await onBatchDelete?.([...selectedIds]);
    exitSelectMode();
  }

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <SectionTitle style={{ marginBottom: 0 }}>Links</SectionTitle>
        <div style={{ display: 'flex', gap: 8 }}>
          {links.length > 0 && (
            <button
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              style={{
                ...bluePillBtn,
                background: selectMode ? '#f3f4f6' : undefined,
                color: selectMode ? '#374151' : undefined,
              }}
            >
              {selectMode ? '取消' : '批量'}
            </button>
          )}
          <button onClick={onAdd} style={bluePillBtn}>
            + Add New Link
          </button>
        </div>
      </div>

      {/* batch action bar */}
      {selectMode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            padding: '8px 12px',
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: 13, color: '#6b7280', flex: 1 }}>
            已选 {selectedIds.size} 个
          </span>
          <button onClick={selectAll} style={batchBtn}>
            全选
          </button>
          <button
            onClick={handleBatchToggle}
            disabled={selectedIds.size === 0}
            style={{ ...batchBtn, color: 'var(--c-accent)' }}
          >
            切换激活
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0}
            style={{ ...batchBtn, color: '#dc2626' }}
          >
            删除
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
            还没有链接，点击「Add New Link」开始添加
          </div>
        )}
        {links.map(link => (
          <div
            key={link.id}
            className={selectMode ? '' : 'link-card'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: link.active ? 'var(--c-surface)' : 'var(--c-surface-2)',
              border: `1px solid ${selectMode && selectedIds.has(link.id) ? 'var(--c-accent)' : 'var(--c-border-light)'}`,
              borderRadius: 12,
              padding: '12px 14px',
              opacity: link.active ? 1 : 0.55,
              cursor: selectMode ? 'pointer' : 'default',
            }}
            onClick={selectMode ? () => toggleSelect(link.id) : undefined}
          >
            {selectMode ? (
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: '2px solid',
                  borderColor: selectedIds.has(link.id) ? 'var(--c-accent)' : '#d1d5db',
                  background: selectedIds.has(link.id) ? 'var(--c-accent)' : '#fff',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedIds.has(link.id) && (
                  <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>
                )}
              </div>
            ) : (
              <div style={{ color: '#d1d5db', flexShrink: 0 }}>
                <DragIcon />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                value={link.label}
                autoFocus={link.id === newLinkId}
                onFocus={() => link.id === newLinkId && onNewLinkFocused?.()}
                onChange={e => onUpdate(link.id, 'label', e.target.value)}
                onBlur={() => onSave(link.id)}
                style={{
                  ...inlineInput,
                  fontWeight: 600,
                  fontSize: 14,
                  color: link.active ? '#111' : '#9ca3af',
                }}
                placeholder="输入标题..."
                onClick={e => selectMode && e.stopPropagation()}
              />
              <input
                value={link.url}
                onChange={e => onUpdate(link.id, 'url', e.target.value)}
                onBlur={() => onSave(link.id)}
                style={{
                  ...inlineInput,
                  fontSize: 12,
                  color: link.active ? 'var(--c-accent)' : '#9ca3af',
                  marginTop: 2,
                }}
                placeholder="https://your-link.com"
                onClick={e => selectMode && e.stopPropagation()}
              />
              {link.click_count > 0 && (
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  {link.click_count} 次点击
                </div>
              )}
            </div>

            {!selectMode && (
              <>
                <Toggle on={link.active} onClick={() => onToggle(link.id)} />
                <button
                  onClick={() => onRemove(link.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#d1d5db',
                    padding: 4,
                    display: 'flex',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                >
                  <TrashIcon />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

const batchBtn = {
  background: 'none',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 12,
  color: '#374151',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};
