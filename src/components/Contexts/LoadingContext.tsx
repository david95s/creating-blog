import { ReactElement, ReactNode, useState, createContext } from 'react';
import { Loading } from '../Loading';

interface LoadingContextData {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface ProviderLoadingProps {
  children: ReactNode;
}

export const LoadingContext = createContext<LoadingContextData>(
  {} as LoadingContextData
);

export const LoadingProvider = ({
  children,
}: ProviderLoadingProps): ReactElement => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {loading && <Loading />}
    </LoadingContext.Provider>
  );
};
