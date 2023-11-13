import { IonPage, IonContent, IonSegment, IonSegmentButton, IonLabel, IonCardTitle, IonCardContent, IonCardHeader, IonImg, IonCard, IonToolbar, IonButtons, IonBackButton, IonTitle } from '@ionic/react';
import { useParams } from 'react-router-dom';

// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
register();
// import required modules

import 'swiper/css';
import 'swiper/swiper-bundle.css';
import '@ionic/react/css/ionic-swiper.css';
import { useRef } from 'react';

const SaleDetailPage: React.FC = () => {
  const { month } = useParams<{ month: string }>();

  // Retrieve ad data based on the month or do anything with the month parameter.
  
  // Example images array, replace with your actual data
  const images = [
    {src: './2023sales/october/1.jpg', title: 'Image 1'},
    {src: './2023sales/october/2.jpg', title: 'Image 2'},
    {src: './2023sales/october/3.jpg', title: 'Image 3'},
    {src: './2023sales/october/4.jpg', title: 'Image 4'},
    {src: './2023sales/october/5.jpg', title: 'Image 5'},
    {src: './2023sales/october/6.jpg', title: 'Image 6'},
    {src: './2023sales/october/7.jpg', title: 'Image 7'},
    {src: './2023sales/october/8.jpg', title: 'Image 8'},
    {src: './2023sales/october/9.jpg', title: 'Image 9'},
    {src: './2023sales/october/10.jpg', title: 'Image 10'},

    // ...other images
  ];
  

  return (
    <IonPage>
       <IonToolbar>
    <IonButtons slot="start">
      <IonBackButton defaultHref="/dashboard/sale"></IonBackButton>
    </IonButtons>
    <IonTitle>{month}</IonTitle>
  </IonToolbar>
  
      <IonContent>
        {/* Your combination of IonSlides and IonSegment goes here */}

 

<swiper-container slides-per-view="1" speed="500" loop="false" css-mode="true" pagination="true" navigation="true" pagination-clickable="true" space-between="30">
          {images.map((image, index) => (
            <swiper-slide key={index}>
              <IonImg src={image.src} />
            </swiper-slide>
          ))}
        </swiper-container>


      </IonContent>
    </IonPage>
  );
};

export default SaleDetailPage;