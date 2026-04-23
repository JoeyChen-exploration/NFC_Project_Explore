import { useState } from 'react';
import { Card, SectionTitle, Toggle, DragIcon, TrashIcon, inlineInput, bluePillBtn } from './ui';
import { useI18n } from '../../hooks/useI18n';

export default function LinkList({
  links,
  onAdd,
  onQuickAdd,
  quickAddPresets = [],
  socials = {},
  onRemove,
  onUpdate,
  onSave,
  onToggle,
  onBatchToggle,
  onBatchDelete,
  newLinkId,
  onNewLinkFocused,
}) {
  const { tc } = useI18n();
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
          <SectionTitle style={{ marginTop: 8, marginBottom: 0 }}>
            {tc('链接矩阵', 'Link Matrix')}
          </SectionTitle>
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
              {selectMode ? tc('取消', 'Cancel') : tc('批量', 'Batch')}
            </button>
          )}
          <button onClick={onAdd} style={bluePillBtn}>
            {tc('+ 添加链接', '+ Add Link')}
          </button>
        </div>
      </div>

      {quickAddPresets.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--mono-text-muted)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {tc('快速添加', 'Quick Add')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {quickAddPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => onQuickAdd?.(preset)}
                style={quickAddBtn}
                title={preset.url}
              >
                + {preset.label}
                {preset.socialKey && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 10,
                      opacity: 0.65,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {socials[preset.socialKey]
                      ? tc('icon已设', 'icon set')
                      : tc('可做icon', 'icon')}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
            {tc(`已选 ${selectedIds.size} 个`, `${selectedIds.size} selected`)}
          </span>
          <button onClick={selectAll} style={batchBtn}>
            {tc('全选', 'Select all')}
          </button>
          <button
            onClick={handleBatchToggle}
            disabled={selectedIds.size === 0}
            style={{ ...batchBtn, color: 'var(--c-accent)' }}
          >
            {tc('切换激活', 'Toggle active')}
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0}
            style={{ ...batchBtn, color: '#dc2626' }}
          >
            {tc('删除', 'Delete')}
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
            {tc(
              '还没有链接。先放上最重要的一到三个入口，比堆很多按钮更高级。',
              'No links yet. Start with one to three key destinations.',
            )}
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
                placeholder={tc('链接标题', 'Link title')}
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
                  {tc(`${link.click_count} 次点击`, `${link.click_count} clicks`)}
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

const quickAddBtn = {
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
