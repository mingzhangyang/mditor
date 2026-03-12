import React from 'react'
import { App as AntApp, ConfigProvider, theme } from 'antd'
import { useTableStore } from './store'

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useTableStore()

  const antdTheme = {
    algorithm: settings.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      fontSize: settings.fontSize || 14,
    },
    components: {
      Table: {
        headerBg: settings.theme === 'dark' ? '#1f1f1f' : '#fafafa',
        headerColor: settings.theme === 'dark' ? '#ffffff' : '#262626',
        rowHoverBg: settings.theme === 'dark' ? '#262626' : '#f5f5f5',
      },
      Button: {
        borderRadius: 6,
      },
      Input: {
        borderRadius: 6,
      },
      Card: {
        headerBg: settings.theme === 'dark' ? '#1f1f1f' : '#ffffff',
      },
      Modal: {
        headerBg: settings.theme === 'dark' ? '#1f1f1f' : '#ffffff',
        contentBg: settings.theme === 'dark' ? '#141414' : '#ffffff',
      },
    },
  }

  React.useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.style.setProperty('--bg-color', '#141414')
      root.style.setProperty('--surface-color', '#1f1f1f')
      root.style.setProperty('--text-color', '#ffffff')
      root.style.setProperty('--text-secondary', '#a6a6a6')
      root.style.setProperty('--border-color', '#303030')
      root.style.setProperty('--hover-bg', '#262626')
      root.style.setProperty('--sidebar-bg', '#1f1f1f')
      root.style.setProperty('--header-bg', '#1f1f1f')
    } else {
      root.setAttribute('data-theme', 'light')
      root.style.setProperty('--bg-color', '#ffffff')
      root.style.setProperty('--surface-color', '#fafafa')
      root.style.setProperty('--text-color', '#000000')
      root.style.setProperty('--text-secondary', '#666666')
      root.style.setProperty('--border-color', '#e8e8e8')
      root.style.setProperty('--hover-bg', '#f5f5f5')
      root.style.setProperty('--sidebar-bg', '#fafafa')
      root.style.setProperty('--header-bg', '#ffffff')
    }
  }, [settings.theme])

  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  )
}

export default ThemeProvider
