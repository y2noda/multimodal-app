
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// fetchベースのシンプルなクライアントを作成
export const apiClient = {
  chat: {
    send: async (message: string, images?: string[]) => {
      try {
        const response = await fetch(`${BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message, images }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'APIリクエストに失敗しました');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('レスポンスがJSONではありません');
        }

        const text = await response.text();
        console.log('Raw response:', text);  // デバッグ用

        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('JSON parse error:', e);
          throw new Error('レスポンスのJSONパースに失敗しました');
        }
      } catch (error) {
        console.error('API request error:', error);
        throw error;
      }
    },
    getHistory: async () => {
      const response = await fetch(`${BASE_URL}/api/chat`)
      return response.json()
    }
  },

  screenShare: {
    start: async () => {
      const response = await fetch(`${BASE_URL}/api/screen/start`, {
        method: 'POST'
      })
      return response.json()
    },
    stop: async () => {
      const response = await fetch(`${BASE_URL}/api/screen/stop`, {
        method: 'POST'
      })
      return response.json()
    }
  }
}
