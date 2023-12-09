import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonModal, IonText, IonTitle, IonToolbar } from '@ionic/react'
import { download } from 'ionicons/icons'
import React, { useRef } from 'react'

interface TermsModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onDidDismiss }) => {
  const modalRef = useRef<HTMLIonModalElement>(null);  return (
    <IonModal
    ref={modalRef}
    isOpen={isOpen}
    onDidDismiss={onDidDismiss}
    >
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
        <IonButton color="primary" onClick={onDidDismiss}>
            Close
          </IonButton>
        </IonButtons>
        <IonTitle>Terms and Conditions</IonTitle>
        <IonButtons slot="end">
        <a href="/terms.pdf" download>
          <IonButton strong={true}>
            <IonIcon slot="end" icon={download}></IonIcon>
          </IonButton>
        </a>
      </IonButtons>
      </IonToolbar>
    </IonHeader>

    <IonContent className="ion-padding">
      <IonItem>

        <IonText>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Omnis id illo aliquam quisquam nulla ducimus laborum fuga ipsa
            quos, nobis dignissimos necessitatibus blanditiis atque saepe?
            At rerum voluptates eaque qui harum magnam asperiores quia
            tempora, sunt, cumque saepe itaque mollitia, pariatur aliquam
            quasi tempore expedita. Harum illo fugiat similique expedita
            sunt amet est mollitia, necessitatibus quidem at corrupti.
            Adipisci placeat accusantium asperiores veniam obcaecati
            suscipit rerum! Vitae ad magnam adipisci rerum. Cupiditate
            autem maiores tempora labore eligendi quae fugit magni minus
            voluptatibus perferendis at quidem laborum dignissimos ullam
            dolorum quia commodi fugiat vel, maxime beatae? Quis quae eos
            exercitationem distinctio vero enim, perspiciatis est
            consequuntur aspernatur pariatur nobis voluptate esse unde
            itaque minima maiores adipisci autem nihil, explicabo
            repudiandae. Molestiae rerum accusantium similique voluptatum,
            doloribus, expedita assumenda quis est asperiores nam eveniet
            voluptates eaque, nihil deserunt tenetur corporis commodi
            recusandae reprehenderit laborum odit quam natus doloremque
            praesentium necessitatibus? Nobis recusandae illo voluptatibus
            laborum unde nostrum iure consequuntur distinctio deserunt,
            ducimus quas sed dolorum ex neque quae harum commodi quo
            facilis, explicabo velit? Nostrum eius tenetur inventore
            voluptate earum soluta voluptatem, necessitatibus illum,
            maxime mollitia labore totam ab repellat? Placeat voluptatum
            ducimus doloremque consequatur quaerat laborum minima totam
            beatae perspiciatis possimus quas quam et, minus blanditiis
            error dolorum sequi iste ratione, atque quos.
          </p>
        </IonText>
      </IonItem>
    </IonContent>
  </IonModal>
  )
}

export default TermsModal