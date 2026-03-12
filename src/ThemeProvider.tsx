import React from 'react'
import { App as AntApp, ConfigProvider, theme } from 'antd'
import { useTableStore } from './store'

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useTableStore()

  const antdTheme = {
    algorithm: settings.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#3b82f6',
      colorInfo: '#3b82f6',
      colorSuccess: '#16a34a',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorBgBase: settings.theme === 'dark' ? '#08111f' : '#f4f7fb',
      colorTextBase: settings.theme === 'dark' ? '#e2e8f0' : '#162033',
      fontFamily: '"Fira Sans", "Segoe UI", sans-serif',
      borderRadius: 14,
      borderRadiusLG: 20,
      borderRadiusSM: 10,
      fontSize: settings.fontSize || 14,
      boxShadow:
        settings.theme === 'dark'
          ? '0 18px 50px rgba(2, 6, 23, 0.42)'
          : '0 18px 50px rgba(15, 23, 42, 0.10)',
    },
    components: {
      Table: {
        headerBg: settings.theme === 'dark' ? '#0f1b31' : '#edf4ff',
        headerColor: settings.theme === 'dark' ? '#f8fafc' : '#162033',
        rowHoverBg: settings.theme === 'dark' ? '#12213d' : '#f7fbff',
      },
      Button: {
        borderRadius: 12,
        controlHeight: 40,
      },
      Input: {
        borderRadius: 12,
      },
      Card: {
        headerBg: settings.theme === 'dark' ? '#0d1729' : 'rgba(255,255,255,0.85)',
      },
      Modal: {
        headerBg: settings.theme === 'dark' ? '#0d1729' : '#ffffff',
        contentBg: settings.theme === 'dark' ? '#08111f' : '#ffffff',
      },
      Tabs: {
        itemActiveColor: '#3b82f6',
        itemHoverColor: '#2563eb',
        inkBarColor: '#f97316',
      },
    },
  }

  React.useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.style.setProperty('--bg-color', '#08111f')
      root.style.setProperty('--surface-color', 'rgba(13, 23, 41, 0.9)')
      root.style.setProperty('--surface-elevated', 'rgba(15, 27, 49, 0.94)')
      root.style.setProperty('--text-color', '#e2e8f0')
      root.style.setProperty('--text-secondary', '#94a3b8')
      root.style.setProperty('--border-color', 'rgba(96, 165, 250, 0.16)')
      root.style.setProperty('--hover-bg', 'rgba(59, 130, 246, 0.14)')
      root.style.setProperty('--sidebar-bg', 'rgba(9, 17, 31, 0.88)')
      root.style.setProperty('--header-bg', 'rgba(9, 17, 31, 0.78)')
      root.style.setProperty('--panel-glow', '0 22px 60px rgba(2, 6, 23, 0.48)')
      root.style.setProperty('--accent-soft', 'rgba(59, 130, 246, 0.18)')
      root.style.setProperty('--accent-strong', '#60a5fa')
      root.style.setProperty('--cta-color', '#fb923c')
    } else {
      root.setAttribute('data-theme', 'light')
      root.style.setProperty('--bg-color', '#f4f7fb')
      root.style.setProperty('--surface-color', 'rgba(255, 255, 255, 0.84)')
      root.style.setProperty('--surface-elevated', '#ffffff')
      root.style.setProperty('--text-color', '#162033')
      root.style.setProperty('--text-secondary', '#5b6b84')
      root.style.setProperty('--border-color', 'rgba(148, 163, 184, 0.24)')
      root.style.setProperty('--hover-bg', 'rgba(59, 130, 246, 0.08)')
      root.style.setProperty('--sidebar-bg', 'rgba(255, 255, 255, 0.7)')
      root.style.setProperty('--header-bg', 'rgba(255, 255, 255, 0.74)')
      root.style.setProperty('--panel-glow', '0 22px 60px rgba(15, 23, 42, 0.10)')
      root.style.setProperty('--accent-soft', 'rgba(59, 130, 246, 0.10)')
      root.style.setProperty('--accent-strong', '#2563eb')
      root.style.setProperty('--cta-color', '#f97316')
    }
  }, [settings.theme])

  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  )
}

export default ThemeProvider
