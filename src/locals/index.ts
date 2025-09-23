// i18n configuration placeholder
// TODO: 實作完整的 i18n 系統

export const MESSAGES = {
  zh: {
    title: '轉盤抽選系統',
    subtitle: 'Siamese Cat Wheel Selector',
    minParticipantsWarning: '至少需要 2 名參與者才能開始抽選',
    spinning: '轉盤旋轉中...',
    congratulations: '恭喜！',
  },
  en: {
    title: 'Wheel Selector System',
    subtitle: 'Siamese Cat Wheel Selector',
    minParticipantsWarning:
      'At least 2 participants required to start selection',
    spinning: 'Wheel is spinning...',
    congratulations: 'Congratulations!',
  },
} as const

export type Language = keyof typeof MESSAGES
export type MessageKey = keyof typeof MESSAGES.zh
