import type { AppProps } from 'next/dist/next-server/lib/router/router';
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no'
        />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap'
          rel='stylesheet'
        />
        <link rel='stylesheet' href='https://unpkg.com/mvp.css' />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
