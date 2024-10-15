import cookie from 'cookie';

export default async function handler(req: { method: string; body: { email: any; password: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message: any; }): void; new(): any; }; }; setHeader: (arg0: string, arg1: string) => void; }) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Метод не поддерживается' });
    return;
  }

  const { email, password } = req.body;

  try {
    const response = await fetch('https://your-backend-api.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ message: errorData.message });
    }

    const data = await response.json();

    // Устанавливаем HttpOnly cookie с токеном
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 день
        path: '/',
      })
    );

    res.status(200).json({ message: 'Вход выполнен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка подключения к серверу' });
  }
}