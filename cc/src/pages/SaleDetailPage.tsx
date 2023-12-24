import React, { Suspense, useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
} from "@ionic/react";
import { useParams } from "react-router-dom";

// import function to register Swiper custom elements
import { register } from "swiper/element/bundle";
// register Swiper custom elements
register();
// import required modules

import "swiper/css";
import "swiper/swiper-bundle.css";
import "@ionic/react/css/ionic-swiper.css";
import { useRef } from "react";
import { AuthStore } from "../utils/store";
const DemoUINotice = React.lazy(() => import("../components/DemoUINotice"));
import { IAuthStore } from "../utils/store";
import { useStoreState } from "pullstate";
import { Swiper, SwiperSlide } from "swiper/react";

const SaleDetailPage: React.FC = () => {
  const selectUid = (state: IAuthStore) => state.uid;
  const uid = useStoreState(AuthStore, selectUid);
  type Image = {
    src: string;
    title: string;
  };
  const [images, setImages] = useState<Image[]>([]);

  const { month } = useParams<{ month: string }>();

  useEffect(() => {
    fetch(`./2024sales/${month}/images.json`)
      .then((response) => response.json())
      .then((data) => {
        setImages(
          data.map((src: string, i: number) => ({
            src: `./2024sales/${month}/${src}`,
            title: `Image ${i + 1}`,
          }))
        );
      });
  }, [month]);

  // const user = AuthStore.useState((s) => s.user);
  // make the first letter of the month uppercase
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  // Retrieve ad data based on the month or do anything with the month parameter.


  return (
    <IonPage>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/dashboard/sale"></IonBackButton>
        </IonButtons>
        <IonTitle>{formattedMonth}</IonTitle>
      </IonToolbar>

      <IonContent>
        {/* Your combination of IonSlides and IonSegment goes here */}

        <Swiper
          slidesPerView={1}
          speed={500}
          loop={false}
          pagination={{ clickable: true }}
          navigation={true}
          spaceBetween={30}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img style={{ 
                maxHeight: '90vh', 
                width: 'auto',
                objectFit: 'contain'
              }} src={image.src} alt={`Slide ${index}`} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Include the DemoAccountNotice component */}
        <Suspense>
        <DemoUINotice uid={uid} />
        </Suspense>      </IonContent>
    </IonPage>
  );
};

export default SaleDetailPage;
