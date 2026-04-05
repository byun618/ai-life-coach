declare const process: { env: { EXPO_PUBLIC_API_URL?: string } }

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.35.7:3000'

// MVP: 본인 전용 고정 user
export const USER_ID = '00000000-0000-0000-0000-000000000001'
