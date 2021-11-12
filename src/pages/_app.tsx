import { useContext, useEffect } from 'react';
import { AppProps } from 'next/app';
import { LoadingProvider } from '../components/Contexts/LoadingContext';

import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <LoadingProvider>
        <Component {...pageProps} />
      </LoadingProvider>
    </>
  );
}

export default MyApp;
