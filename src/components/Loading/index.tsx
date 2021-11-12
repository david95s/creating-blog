import styles from './loading.module.scss';

export const Loading = (): JSX.Element => {
  return (
    <div className={styles.containerLoading}>
      <div className={styles.wrapperLoading}>
        <div className={styles.divLoading} />
      </div>
    </div>
  );
};
