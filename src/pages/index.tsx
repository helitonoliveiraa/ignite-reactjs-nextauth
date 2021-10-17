import { GetServerSideProps } from 'next';
import { FormEvent, useState } from 'react';
import { parseCookies } from 'nookies';

import { useAuth } from '../contexts/AuthContext';

import styles from '../styles/Home.module.css';

export default function Home() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <main className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.content}>
        <input 
          type="email" 
          value={email} 
          onChange={event => setEmail(event.target.value)}
          placeholder="E-mail"
        />

        <input 
          type="password" 
          value={password}
          onChange={event => setPassword(event.target.value)}  
          placeholder="Password"
        />

        <button type="submit">
          Sign in
        </button>
      </form>
    </main>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (cookies['@nextauth:token']) {
    return {
      redirect: {
        destination: 'dashboard',
        permanent: false,
      }
    }
  }

  return {
    props: {},
  };
}