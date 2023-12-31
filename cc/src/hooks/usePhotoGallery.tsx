import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
// import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface UserPhoto {
  filepath: string;
  webviewPath: string | undefined;
}

// Custom hook for managing the photo gallery
export function usePhotoGallery() {
  const takePhoto = async (): Promise<UserPhoto | null> => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 80,
    });
    const fileName = Date.now() + '.png'; // TODO: Add UUID if required
    return {
      filepath: fileName,
      webviewPath: photo.webPath,
    };
  };

  return { takePhoto };
}