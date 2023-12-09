// AmountSaved.tsx
import React, { useState } from "react";
import { IonChip, IonItem, IonLabel, IonList, IonText } from "@ionic/react";
import CountUp from "react-countup";

interface AmountSavedProps {
  monthAmount: number;
  yearAmount: number;
  allTimeAmount: number;
}

const AmountSaved: React.FC<AmountSavedProps> = ({
  monthAmount,
  yearAmount,
  allTimeAmount,
}) => {
  const [activeChip, setActiveChip] = useState("month");
  const [displayAmount, setDisplayAmount] = useState<number>(monthAmount); // Default amount

  const handleChipClick = (chipType: "month" | "year" | "all-time") => {
    setActiveChip(chipType);

    // Define the amount based on the chipType
    let amount: number;
    switch (chipType) {
      case "month":
        amount = monthAmount;
        break;
      case "year":
        amount = yearAmount;
        break;
      case "all-time":
        amount = allTimeAmount;
        break;
    }
    setDisplayAmount(amount);
  };

  return (
    <IonList lines="none">
      <IonItem>
        <IonLabel>
          <h1>
            So far you
            <br />
            have saved
          </h1>
        </IonLabel>
        <IonLabel slot="end">
          <IonText className="count-up-number" color="primary">
            <CountUp
              end={displayAmount}
              decimals={2}
              decimal="."
              prefix="$"
              duration={2}
            />
          </IonText>
        </IonLabel>
      </IonItem>
      <div style={{ margin: "0 0 0 152px" }}>
        <IonLabel>
          <IonChip
            className="chip-style"
            onClick={() => handleChipClick("month")}
            outline={activeChip !== "month"}
          >
            month
          </IonChip>
          <IonChip
            className="chip-style"
            onClick={() => handleChipClick("year")}
            outline={activeChip !== "year"}
          >
            year
          </IonChip>
          <IonChip
            className="chip-style"
            onClick={() => handleChipClick("all-time")}
            outline={activeChip !== "all-time"}
          >
            all-time
          </IonChip>
        </IonLabel>
      </div>
    </IonList>
  );
};

export default AmountSaved;
