import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
  }
}
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Отправляем запрос на ваш бэкенд для проверки логина
          const res = await fetch('https://your-backend-api.com/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const user = await res.json();

          // Если данные пользователя получены, возвращаем объект пользователя
          if (res.ok && user) {
            return user;
          }

          // Если аутентификация не успешна, возвращаем null
          return null;
        } catch (error) {
          console.error("Ошибка авторизации", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/signin',  // Страница для входа
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,  // Секретный ключ для подписи токенов
  session: {
    strategy: 'jwt',
  },
});
