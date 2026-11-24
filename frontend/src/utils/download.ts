import { Browser } from '@capacitor/browser';
import { isNative } from '../config/server';

/** Android WebView me <a download> kaam nahi karta, isliye system browser/Download Manager se kholte hain */
export const openDownload = async (url: string) => {
  if (isNative()) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
