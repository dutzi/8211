export type Soldier = {
  key: string;
  index: string;
  name: string;
  title: string;
  division: string;
  phone: string;
};

export default function decryptData(encData: string, password: string) {
  const data = (window as any).CryptoJS.AES.decrypt(encData, password) as any;
  try {
    const parsedData = JSON.parse(data.toString((window as any).CryptoJS.enc.Utf8));
    return parsedData.map((soldier: any, index: number) => ({
      index,
      ...soldier,
      key: `${soldier.name}|${soldier.division}`,
    })) as Soldier[];
  } catch (err) {
    return null;
  }
}
