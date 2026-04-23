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
        <div>
          <div className="mono-kicker">Distribution</div>
          <SectionTitle style={{ marginTop: 8, marginBottom: 0 }}>链接矩阵</SectionTitle>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {links.length > 0 && (
            <button
              onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
              style={{
                ...bluePillBtn,
                background: selectMode ? 'rgba(255,255,255,0.84)' : undefined,
                color: selectMode ? 'var(--mono-text)' : undefined,
                borderColor: selectMode ? 'rgba(15, 15, 15, 0.14)' : undefined,
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
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.75)',
            borderRadius: 18,
            border: '1px solid rgba(15, 15, 15, 0.08)',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--mono-text-muted)', flex: 1 }}>
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
          <div
            style={{
              textAlign: 'center',
              padding: '36px 18px',
              color: 'var(--mono-text-muted)',
              fontSize: 14,
              border: '1px dashed rgba(15, 15, 15, 0.12)',
              borderRadius: 24,
              background: 'rgba(255,255,255,0.56)',
            }}
          >
            还没有链接。先放上最重要的一到三个入口，比堆很多按钮更高级。
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
              background: link.active ? 'rgba(255,255,255,0.82)' : 'rgba(15,15,15,0.035)',
              border: `1px solid ${selectMode && selectedIds.has(link.id) ? 'rgba(15,15,15,0.84)' : 'rgba(15,15,15,0.08)'}`,
              borderRadius: 22,
              padding: '14px 15px',
              opacity: link.active ? 1 : 0.58,
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
                  borderColor: selectedIds.has(link.id)
                    ? 'var(--mono-text)'
                    : 'rgba(15,15,15,0.18)',
                  background: selectedIds.has(link.id) ? 'var(--mono-text)' : '#fff',
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
              <div style={{ color: 'rgba(15,15,15,0.24)', flexShrink: 0 }}>
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
                  color: link.active ? 'var(--mono-text)' : 'var(--mono-text-muted)',
                }}
                placeholder="链接标题"
                onClick={e => selectMode && e.stopPropagation()}
              />
              <input
                value={link.url}
                onChange={e => onUpdate(link.id, 'url', e.target.value)}
                onBlur={() => onSave(link.id)}
                style={{
                  ...inlineInput,
                  fontSize: 12,
                  color: link.active ? 'var(--mono-text-soft)' : 'var(--mono-text-muted)',
                  marginTop: 2,
                }}
                placeholder="https://your-link.com"
                onClick={e => selectMode && e.stopPropagation()}
              />
              {link.click_count > 0 && (
                <div style={{ fontSize: 11, color: 'var(--mono-text-muted)', marginTop: 4 }}>
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
                    color: 'rgba(15,15,15,0.24)',
                    padding: 4,
                    display: 'flex',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--mono-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(15,15,15,0.24)')}
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
  background: 'rgba(255,255,255,0.84)',
  border: '1px solid rgba(15, 15, 15, 0.12)',
  borderRadius: 999,
  padding: '7px 12px',
  fontSize: 12,
  color: 'var(--mono-text)',
  cursor: 'pointer',
  fontFamily: 'var(--font-ui)',
  fontWeight: 600,
};
