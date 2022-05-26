const BIO_SIGNUP_LS_KEY = 'bioSignupUserHandle';
const CHALLENGE_STRING = '8211-challenge';

const adminEncryptedData = window.adminEncryptedData;
const userEncryptedData = window.userEncryptedData;

let password = '';
let isApproved = false;
let userGroupType = null;

if (window.location.search.indexOf('bio=1') !== -1) {
  alert('המידע נמחק');
  localStorage.removeItem('isBioDismissed');
  localStorage.removeItem(BIO_SIGNUP_LS_KEY);
  location.href = '/';
}

let decryptedData;
let decryptedDataMap;
let isBioSignedUp = !!localStorage.getItem(BIO_SIGNUP_LS_KEY);
let isBioSignedIn = false;
let isBioDismissed = localStorage.getItem('isBioDismissed') === 'true';

function stringToArrayBuffer(str) {
  let buf = new ArrayBuffer(str.length); // 2 bytes for each char
  let bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

// Here Uint8 can be different like Uinit8/Uint32 depending upon your
// buffer value type.
//
function arrayBufferToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

document.querySelector('#bioSignup').addEventListener('click', async (e) => {
  const publicKeyCredential = await window.navigator.credentials.create({
    publicKey: {
      rp: { name: '8211.info' },
      user: {
        name: `${userGroupType}@example.com`,
        id: stringToArrayBuffer(password),
        displayName: `8211 ${userGroupType}`,
      },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      challenge: stringToArrayBuffer(CHALLENGE_STRING),
      authenticatorSelection: { authenticatorAttachment: 'platform' },
    },
  });
  const userHandle = arrayBufferToString(publicKeyCredential.rawId);
  localStorage.setItem(BIO_SIGNUP_LS_KEY, userHandle);
  isBioSignedUp = true;
  isBioSignedIn = true;
  render();
});

document.querySelector('#bioSignin').addEventListener('click', async (e) => {
  const publicKeyCredential = await navigator.credentials.get({
    publicKey: {
      challenge: stringToArrayBuffer(CHALLENGE_STRING),
      allowCredentials: [
        {
          type: 'public-key',
          id: stringToArrayBuffer(localStorage.getItem(BIO_SIGNUP_LS_KEY)),
          transports: ['internal'],
        },
        // ... more Credential IDs can be supplied.
      ],
    },
  });

  password = arrayBufferToString(publicKeyCredential.response.userHandle);
  isBioSignedIn = true;
  searchInput.value = password;
  handleQueryChange();
  render();
});

document.querySelector('#btnDismiss').addEventListener('click', async (e) => {
  localStorage.setItem('isBioDismissed', true);
  isBioDismissed = true;
  render();
});

function getFenceOwner(fencePoint) {
  const result = decryptedData.fenceOwners.find(
    (fenceRegion) =>
      fenceRegion.from <= fencePoint && fenceRegion.to >= fencePoint
  );
  if (result) {
    return result.owner;
  } else {
    return 'מחוץ לגבולות';
  }
}

window.handleClearQuery = function () {
  searchInput.value = '';
  handleQueryChange();
};

window.handleInputClick = function (event) {
  if (event.offsetX < 40) {
    handleClearQuery();
  }
};

function getRegionDetails(fencePoint) {
  const result = decryptedData.fenceRegions.find(
    (fenceRegion) =>
      fenceRegion.from <= fencePoint && fenceRegion.to >= fencePoint
  );

  if (result) {
    return result.type;
  } else {
    return 'שטח חי';
  }
}

function getTroubledRegion(fencePoint) {
  const result = decryptedData.troubledRegions.find(
    (fenceRegion) =>
      fenceRegion.from <= fencePoint && fenceRegion.to >= fencePoint
  );

  if (result) {
    return result.type;
  } else {
    return 'שטח תקין';
  }
}

let indexedSoldiers;
function getIndexedSoldiers() {
  if (indexedSoldiers) {
    return indexedSoldiers;
  }

  indexedSoldiers = decryptedData.map((soldier) => {
    return {
      ...soldier,
      mainPhone:
        soldier.mainPhone && soldier.mainPhone.startsWith('00')
          ? soldier.mainPhone.slice(1)
          : soldier.mainPhone,
    };
  });

  return indexedSoldiers;
}

function getForces(str) {
  const regEx = new RegExp(str.replace(/ /g, '.*').replace(/\+/g, ' '));
  return decryptedData.forces.filter((force) => force.match(regEx));
}

let state = 'login';

const searchInput = document.querySelector('#searchInput');
const soldiersEl = document.querySelector('#soldiers');
const favoritesEl = document.querySelector('#favorites');
const version = document.querySelector('.version');

function copy(e) {
  e.preventDefault();
  const phoneEl = e.currentTarget.parentElement.children[0];

  const textArea = document.createElement('textarea');
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  textArea.style.fontSize = '16px';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';

  textArea.value = phoneEl.innerText;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}

function prettyPrintLabel(label) {
  if (label === 'נתיב מסגרת מלא') return 'נתיב';
  if (label === 'שם תפקיד בעץ מבנה') return 'תפקיד';
  if (label === 'מספר ילדים') return 'מס׳ ילדים';
  if (label === 'מספר אישי') return 'מ. אישי';
  if (label === 'מספר זהות') return 'מ. זהות';
  if (label === 'תאריך לידה') return 'ת. לידה';
  if (label === 'טלפון נייד') return "טל' נייד";
  if (label === 'טלפון עיקרי') return "טל' עיקרי";

  return label;
}

const renderLine = (column, index, content) => {
  if (!content) {
    return '';
  }

  if (index === 1 || index === 2) {
    return '';
  } else if (['mobile', 'mainPhone'].includes(column[1])) {
    return (
      `<div class="label">${prettyPrintLabel(column[0])}</div>` +
      `<div class="value"><a href="tel:${content}"><b>${content}</b></a> <a class="copy" href="#" onclick="copy(event)"><img src="/copy.svg"/></a></div>`
    );
  } else if (column[1] === 'email') {
    return (
      `<div class="label">דוא"ל</div>` +
      `<div class="value"><a href="mailto:${content}"><b>${content}</b></a> <a class="copy" href="#" onclick="copy(event)"><img src="/copy.svg"/></a></div>`
    );
  } else {
    return (
      `<div class="label">${prettyPrintLabel(column[0])}</div>` +
      `<div class="value">${content}</div>`
    );
  }
};

const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function isInFavorites(key) {
  const hashedKey = md5(key);

  return favorites.indexOf(hashedKey) !== -1;
}

window.handleToggleFavorite = function (key) {
  const hashedKey = md5(key);

  if (isInFavorites(key)) {
    const index = favorites.indexOf(hashedKey);
    favorites.splice(index, 1);
  } else {
    favorites.push(md5(key));
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));

  render();
  handleQueryChange();
};

const renderSoldier = (item, columns) => {
  const favButtonLabel = isInFavorites(item.key)
    ? '<img class="star" src="/star.svg"/>'
    : '<img class="star" src="/star-empty.svg"/>';
  return `<div class="soldier">
    <div class="topRow">
      <div class="name">
        ${item.firstName + ' ' + item.lastName}
      </div>
      <div class="actions">
        <button class="favoriteBtn" onClick="handleToggleFavorite('${
          item.key
        }')">${favButtonLabel}</button>
      </div>
    </div>
    <div class="rows">
      ${columns
        .map((column, index) => renderLine(column, index, item[column[1]]))
        .join('')}
    </div>
  </div>`;
};

const renderForceLine = (forceLine) => {
  if (!isNaN(forceLine)) {
    return `<div class="force-line"><a href="tel:${forceLine}"><b>${forceLine}</b></a></div>`;
  } else {
    return `<div class="force-line">${forceLine}</div>`;
  }
};

const renderForce = (force) => {
  force = force.split(',');
  return `<div class="force">
    ${force.map(renderForceLine).join('')}
  </div>`;
};

function handleQueryChange() {
  const value = searchInput.value;

  if (!value) {
    document.querySelector('.container').classList.add('emptyInput');
  } else {
    document.querySelector('.container').classList.remove('emptyInput');
  }

  if (state === 'login') {
    password = value;
    for (const group of [
      { type: 'admin', data: adminEncryptedData },
      { type: 'user', data: userEncryptedData },
    ]) {
      const data = CryptoJS.AES.decrypt(group.data, password);
      try {
        decryptedData = JSON.parse(data.toString(CryptoJS.enc.Utf8));
        decryptedData = decryptedData.map((soldier) => ({
          ...soldier,
          key: `${soldier.firstName} ${soldier.lastName}|${soldier.mobile}|${soldier.id}|${soldier.idfId}`,
        }));
        decryptedDataMap = decryptedData.reduce(
          (p, c) => ({
            ...p,
            [md5(c.key)]: c,
          }),
          {}
        );

        state = 'search';
        searchInput.value = '';
        userGroupType = group.type;
        render();
        handleQueryChange();
        break;
      } catch (err) {
        // console.log(err);
      }
    }
  } else {
    const soldiers =
      value === ''
        ? getIndexedSoldiers()
        : getIndexedSoldiers().filter(
            (soldier) => soldier.key.indexOf(value) !== -1
          );

    soldiers.sort((a, b) =>
      (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName)
    );

    const forces = [];

    if (soldiers.length === 0) {
      if (value === '') {
        soldiersEl.innerHTML = '';
      } else {
        soldiersEl.innerHTML = `
        <h1>חיילים</h1>
        <div class="error"><strong>לא נמצאו חיילים</strong></div>
        `;
      }
    } else {
      soldiersEl.innerHTML = `<h1>חיילים</h1>
        ${soldiers
          .map((soldier, index) => renderSoldier(soldier, window.keyMapping))
          .join(`<div class="separator"></div>`)}
        `;
    }
  }
}

searchInput.addEventListener('keyup', handleQueryChange);

function handleFavoriteClick(key) {
  const soldier = decryptedDataMap[key];
  searchInput.value = soldier.firstName + ' ' + soldier.lastName;
  handleQueryChange();
}

let prevState;

function render() {
  if (prevState !== state) {
    searchInput.value = '';
    prevState = state;
  }

  document.querySelector('.container').className = 'container';
  document.querySelector('.container').classList.add(state);

  if (isBioSignedIn) {
    document.querySelector('.container').classList.add('bioSignedIn');
  }

  if (isBioSignedUp) {
    document.querySelector('.container').classList.add('bioSignedUp');
  }

  if (!isBioSignedIn && !isBioSignedUp) {
    document.querySelector('.container').classList.add('noBio');
  }

  if (isBioDismissed) {
    document.querySelector('.container').classList.add('bioDismissed');
  }

  if (state === 'login') {
    searchInput.placeholder = 'הזן סיסמא';
    searchInput.setAttribute('type', 'password');
    document.body.style.backgroundColor = '#000';
    // document.querySelector('.bg').style.opacity = 1;
    version.style.opacity = '1';
    searchInput.focus();
  } else if (state === 'search') {
    searchInput.placeholder = 'הזן קו דיווח/שם חייל/תפקיד';
    searchInput.setAttribute('type', 'text');
    // document.querySelector('.bg').style.opacity = 0;
    document.body.style.backgroundColor = '#fff';
    version.style.opacity = '0';
    if (favorites.length) {
      favoritesEl.innerHTML = `<h1>מועדפים</h1>`;
      favoritesEl.innerHTML += favorites
        .map((key) => {
          const soldier = decryptedDataMap[key];
          if (!soldier) {
            return '';
          }
          return `<button class="favItemButton" onClick="handleFavoriteClick('${key}')">${soldier.firstName} ${soldier.lastName}</button>`;
        })
        .join('');
    } else {
      favoritesEl.innerHTML = '';
    }
  }
}

render();
