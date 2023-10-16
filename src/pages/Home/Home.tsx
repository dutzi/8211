import { useMemo, useState } from 'react';
import cx from 'classnames';
import Highlighter from 'react-highlight-words';
import styles from './Home.module.scss';
import { Soldier } from '../utils/data-utils';
import { ReactComponent as WhatsAppIcon } from '../../svgs/whatsapp.svg';
import { ReactComponent as StarEmptyIcon } from '../../svgs/star-empty.svg';
import { ReactComponent as StarFullIcon } from '../../svgs/star-full.svg';
import { ReactComponent as PhoneIcon } from '../../svgs/phone.svg';
import { jsonTryParse } from '../utils/utils';
import { getIsBioSignedUp, bioSignUp, dismissBioSignUp, getIsBioDismissed } from '../utils/biometric-utils';

interface Favorite {
  key: string;
  label?: string;
}

function useFavorites() {
  const [items, setItems] = useState((jsonTryParse(localStorage.getItem('favorites-v2')) ?? []) as Favorite[]);

  function toggle(key: string) {
    const newItems = [...items];

    const index = newItems.findIndex((item) => item.key === key);
    if (index !== -1) {
      newItems.splice(index, 1);
    } else {
      const label = prompt('הזן כינוי למועדף (לא חובה)');
      if (label === null) {
        return;
      }

      newItems.push({ key, label });
    }

    setItems(newItems);
    localStorage.setItem('favorites-v2', JSON.stringify(newItems));
  }

  const itemsMap = useMemo(() => {
    return items.reduce((prev, curr) => {
      prev[curr.key] = curr;
      return prev;
    }, {} as Record<string, Favorite>);
  }, [items]);

  return {
    items,
    itemsMap,
    toggle,
  };
}

export default function Home({
  soldiers: soldiersBase,
  filter,
  setFilter,
  password,
}: {
  soldiers: Soldier[];
  filter: string;
  setFilter: (value: string) => void;
  password: string;
}) {
  const favorites = useFavorites();
  const [isShowBioSignUpMessage, setIsShowBioSignUpMessage] = useState(!getIsBioSignedUp() && !getIsBioDismissed());

  const soldiersMap = useMemo(() => {
    return soldiersBase.reduce((prev, curr) => {
      prev[curr.key] = curr;
      return prev;
    }, {} as Record<string, Soldier | undefined>);
  }, [soldiersBase]);

  const soldiers = useMemo(() => {
    if (!filter) {
      return soldiersBase;
    }
    return soldiersBase.filter((soldier) => soldier.key.includes(filter));
  }, [filter, soldiersBase]);

  function handleFavClick(key: string) {
    const soldier = soldiersMap[key];

    if (!soldier) {
      return;
    }

    setFilter(soldier.name);
  }

  function handleFav(key: string) {
    favorites.toggle(key);
  }

  async function handleBioSignUp() {
    const isBioSignedUp = await bioSignUp(password);

    if (isBioSignedUp) {
      setIsShowBioSignUpMessage(false);
    }
  }

  function handleDismissBioSignUp() {
    dismissBioSignUp();
    setIsShowBioSignUpMessage(false);
  }

  return (
    <div className={styles.home}>
      {isShowBioSignUpMessage && (
        <div className={styles.bioSignUpMessage}>
          <h3>נמאס לכם להזין סיסמא בכל פעם?</h3>
          <div>לחצו כאן על מנת להזדהות בעזרת אמצעים ביומטריים (פנים/טביעת אצבע, תלוי בטלפון)</div>
          <button className={styles.bioSignUpButton} onClick={handleBioSignUp}>
            הזדהות ביומטרית
          </button>
          <button className={styles.bioSignUpDismissButton} onClick={handleDismissBioSignUp}>
            הסתר, ואל תציג שוב
          </button>
        </div>
      )}
      {!filter && favorites.items.length > 0 && (
        <>
          <div className={styles.groupHeader}>מועדפים</div>
          <div className={styles.favorites}>
            {favorites.items
              .map((fav) => soldiersMap[fav.key])
              .filter(Boolean)
              .map((soldier) => (
                <div key={soldier!.key} className={styles.favorite}>
                  <button className={styles.name} onClick={handleFavClick.bind(null, soldier!.key)}>
                    {soldier!.name}
                    {favorites.itemsMap[soldier!.key]!.label ? ` (${favorites.itemsMap[soldier!.key]!.label})` : ''}
                  </button>
                  <div className={styles.actions}>
                    <a className={styles.action} href={`https://wa.me/972${soldier!.phone.slice(1).replace(/-/g, '')}`}>
                      <WhatsAppIcon style={{ width: '29px' }} />
                    </a>
                    <a className={cx(styles.action, styles.whatsapp)} href={`tel:${soldier!.phone}`}>
                      <PhoneIcon />
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
      <div className={styles.groupHeader}>חיילים</div>
      <div className={styles.soldiers}>
        {soldiers.map((soldier) => (
          <div key={soldier.index} className={styles.soldier}>
            <div className={styles.titleRow}>
              <Highlighter
                className={styles.name}
                highlightClassName={styles.highlight}
                searchWords={[filter]}
                autoEscape={true}
                textToHighlight={soldier.name}
              />
              <button className={styles.favButton} onClick={handleFav.bind(null, soldier.key)}>
                {favorites.itemsMap[soldier.key] !== undefined ? <StarFullIcon /> : <StarEmptyIcon />}
              </button>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>כוח:</div>
              <Highlighter
                className={styles.value}
                highlightClassName={styles.highlight}
                searchWords={[filter]}
                autoEscape={true}
                textToHighlight={soldier.division}
              />
            </div>
            <div className={styles.row}>
              <div className={styles.label}>טלפון:</div>
              <a href={`tel:${soldier.phone}`} className={styles.phone}>
                {soldier.phone}
              </a>
              <a className={styles.whatsappLink} href={`https://wa.me/972${soldier.phone.slice(1).replace(/-/g, '')}`}>
                <WhatsAppIcon />
              </a>
            </div>
            <div className={styles.separator} />
          </div>
        ))}
      </div>
    </div>
  );
}
