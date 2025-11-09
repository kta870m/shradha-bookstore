import { ConfigProvider } from 'antd';

export const antdTheme = {
  token: {
    // Primary colors
    colorPrimary: '#0EADD5',
    colorSuccess: '#52c41a',
    colorWarning: '#fa8c16',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Background colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
    
    // Text colors
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    
    // Border
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    
    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    
    // Font
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Component specific
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#001529',
      bodyBg: '#f5f5f5',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#0EADD5',
      itemSelectedColor: '#ffffff',
      itemHoverBg: 'rgba(14, 173, 213, 0.1)',
      itemHoverColor: '#0EADD5',
    },
    Button: {
      primaryShadow: '0 4px 12px rgba(14, 173, 213, 0.3)',
      defaultShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    Card: {
      boxShadowTertiary: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
  },
};

export default antdTheme;