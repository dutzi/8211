import { useRef, useState } from 'react';
import { ReactComponent as FingerprintIcon } from './svgs/fingerprint.svg';
import cx from 'classnames';
import Home from './pages/Home/Home';
import styles from './App.module.scss';
import userData from './data/user';
import decryptData, { Soldier } from './pages/utils/data-utils';
import { getIsBioSignedUp, bigSignIn } from './pages/utils/biometric-utils';

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [soldiers, setSoldiers] = useState<Soldier[] | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  function handlePasswordSet(password: string) {
    const data = decryptData(userData, password);

    if (!data) {
      return;
    }

    setSoldiers(data);
    setPassword(password);
    setInputValue('');
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);

    if (soldiers) {
      return;
    }

    handlePasswordSet(value);
  }

  function handleClear() {
    setInputValue('');
    inputRef.current?.focus();
  }

  async function handleBioSignIn() {
    const password = await bigSignIn();

    if (!password) {
      return;
    }

    handlePasswordSet(password);
  }

  return (
    <div className={cx(styles.app, !soldiers && styles.loggedOut)}>
      <div className={styles.header}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type={soldiers ? 'text' : 'password'}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={soldiers ? 'הזן שם חייל/תפקיד' : 'הזן סיסמא'}
            autoFocus
          />
          <button className={styles.clearButton} onClick={handleClear}>
            ×
          </button>
        </div>
      </div>

      {soldiers ? (
        <Home soldiers={soldiers} filter={inputValue} setFilter={setInputValue} password={password!} />
      ) : (
        <div className={styles.main}>
          {getIsBioSignedUp() && (
            <button className={styles.bioSignInButton} onClick={handleBioSignIn}>
              <FingerprintIcon /> הזדהות ביומטרית
            </button>
          )}
          <div className={styles.unitSymbolWrapper}>
            <img src="/efraim.png" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
