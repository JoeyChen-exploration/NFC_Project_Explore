import { useState, useCallback } from 'react';

/**
 * EditorPage状态管理Hook
 * 管理编辑器的标签状态、保存状态和响应式布局
 */
export function useEditorState() {
  // 当前激活的标签
  const [activeTab, setActiveTab] = useState('links');

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 错误状态
  const [error, setError] = useState('');

  // 标签定义
  const tabs = [
    { id: 'links', label: '链接', icon: '🔗' },
    { id: 'theme', label: '主题', icon: '🎨' },
    { id: 'social', label: '社交', icon: '👥' },
    { id: 'profile', label: '资料', icon: '👤' },
    { id: 'settings', label: '设置', icon: '⚙️' },
    { id: 'nfc', label: 'NFC卡片', icon: '📱' },
  ];

  /**
   * 切换标签
   */
  const switchTab = useCallback(tabId => {
    setActiveTab(tabId);
    setError(''); // 切换标签时清除错误
  }, []);

  /**
   * 显示保存成功消息
   */
  const showSaveSuccess = useCallback((message = '已保存') => {
    setSaveMessage(message);
    setIsSaving(false);

    // 2秒后自动清除消息
    setTimeout(() => {
      setSaveMessage('');
    }, 2000);
  }, []);

  /**
   * 显示保存错误
   */
  const showSaveError = useCallback(errorMessage => {
    setError(errorMessage);
    setIsSaving(false);

    // 5秒后自动清除错误
    setTimeout(() => {
      setError('');
    }, 5000);
  }, []);

  /**
   * 开始保存操作
   */
  const startSaving = useCallback(() => {
    setIsSaving(true);
    setError('');
  }, []);

  /**
   * 导航到NFC页面
   */
  const navigateToNfc = useCallback(navigate => {
    navigate('/nfc');
  }, []);

  return {
    // 状态
    activeTab,
    isSaving,
    saveMessage,
    error,
    tabs,

    // 操作方法
    switchTab,
    showSaveSuccess,
    showSaveError,
    startSaving,
    navigateToNfc,

    // 设置方法
    setActiveTab,
    setIsSaving,
    setSaveMessage,
    setError,
  };
}

/**
 * 编辑器数据状态Hook
 * 管理用户资料、社交链接、主题等数据
 */
export function useEditorData(initialData = {}) {
  const [data, setData] = useState({
    profile: {
      name: '',
      bio: '',
      avatar_seed: 1,
      theme_id: 'midnight',
      embed_url: '',
      show_embed: false,
      ...initialData.profile,
    },
    socials: {
      instagram: '',
      twitter: '',
      github: '',
      youtube: '',
      tiktok: '',
      website: '',
      ...initialData.socials,
    },
    links: initialData.links || [],
    theme: initialData.theme || 'midnight',
  });

  /**
   * 更新资料数据
   */
  const updateProfile = useCallback(updates => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  }, []);

  /**
   * 更新社交链接
   */
  const updateSocials = useCallback(updates => {
    setData(prev => ({
      ...prev,
      socials: { ...prev.socials, ...updates },
    }));
  }, []);

  /**
   * 更新链接列表
   */
  const updateLinks = useCallback(links => {
    setData(prev => ({
      ...prev,
      links,
    }));
  }, []);

  /**
   * 更新主题
   */
  const updateTheme = useCallback(themeId => {
    setData(prev => ({
      ...prev,
      theme: themeId,
      profile: { ...prev.profile, theme_id: themeId },
    }));
  }, []);

  /**
   * 重置数据
   */
  const resetData = useCallback(
    newData => {
      setData({
        profile: { ...data.profile, ...newData.profile },
        socials: { ...data.socials, ...newData.socials },
        links: newData.links || [],
        theme: newData.profile?.theme_id || 'midnight',
      });
    },
    [data.profile, data.socials],
  );

  return {
    // 数据
    profile: data.profile,
    socials: data.socials,
    links: data.links,
    theme: data.theme,

    // 更新方法
    updateProfile,
    updateSocials,
    updateLinks,
    updateTheme,
    resetData,

    // 完整数据（用于保存）
    getFullData: () => data,
  };
}
