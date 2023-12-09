import { app } from "./fbAuth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseGetStorage = getStorage(app);
const storage = getStorage(app);


export const uploadPhotoToFirebase = async (file: any, path: string) => {
  const storageRef = ref(firebaseGetStorage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

const storageRef = ref;
