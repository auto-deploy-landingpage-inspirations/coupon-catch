 {/* <ReceiptList /> */}
          {/* <IonList>
          <IonItem>
            <IonLabel>
              <h1>{receipt.dateOfPurchase}</h1>
              <h2>
                {receipt.storeName || "Store name not available"}, #
                {receipt.storeNumber}
              </h2>
              <h3>Member# {receipt.memberNumber}</h3>
            </IonLabel>
          </IonItem>
          <div style={{ margin: "auto 0", textAlign: "center" }}>
            {receipt.itemLines.map((item: any, index: any) => (
              // If the item.couponNum is not "", then display all the text with italiics

              <IonItem key={index}>
                <IonLabel
                  style={{
                    flex: "0 0 19%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                  <h2>{item.itemNumber}</h2>
                </IonLabel>
                <IonLabel
                  style={{
                    flex: "0 0 50%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                  <h2>{item.itemDesc}</h2>
                </IonLabel>
                <IonLabel
                  style={{
                    flex: "0 0 15%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                  <h2>
                    {item.itemPrice}
                    {item.couponAmt > 0 && (
                      <span style={{ color: "red" }}> -{item.couponAmt}</span>
                    )}
                  </h2>
                </IonLabel>
                <IonLabel
                  style={{
                    flex: "0 0 17%",
                    fontStyle: item.couponNum !== "" ? "italic" : "normal",
                  }}
                >
                </IonLabel>
              </IonItem>
            ))}
          </div>
          <IonList lines="none">
            <IonItem>
              <IonLabel style={{ fontWeight: "bold" }} slot="end">
                <h2>Tax: ${receipt.taxAmount.toFixed(2)}</h2>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel style={{ fontWeight: "bold" }}>
                <h2>
                  {receipt.timeOfPurchase} - Trm:{receipt.terminalNumber} Trn:
                  {receipt.transactionNumber} Op:{receipt.operatorNumber}
                </h2>
              </IonLabel>
              <IonLabel style={{ fontWeight: "bold" }} slot="end">
                <h2>Total: ${receipt.totalAmount.toFixed(2)}</h2>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonList> */}