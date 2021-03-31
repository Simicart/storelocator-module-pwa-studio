import React, {Fragment, useMemo} from 'react';
import GgMapPopup from "../GoogleMap/GGMapPopup";

const StorePickup = (props) => {
    const shouldShowStorePickupText = props ? props.shouldShowStorePickupText : null;
    const isSelectingStorePickup = props ? props.isSelectingStorePickup : null;
    const showStorePickupMode = props ? props.showStorePickupMode : null;
    const submitStorePickup = props ? props.submitStorePickup : null;
    const cancelShowStorePickup = props ? props.cancelShowStorePickup : null;

    const saveLocationLoading = props ? props.saveLocationLoading : false;
    const saveLocationError = props ? props.saveLocationError : null;

    const storePickupAddress = props ? props.storePickupAddress : null;
    const storePickupDate = props ? props.storePickupDate : null;
    const storePickupTime = props ? props.storePickupTime : null;

    const cartId = props ? props.cartId : null;

    const popup = useMemo(() => (
        <GgMapPopup
            submitStorePickup={submitStorePickup}
            cancelShowStorePickup={cancelShowStorePickup}
            saveLocationLoading={saveLocationLoading}
            saveLocationError={saveLocationError}
            storePickupAddress={storePickupAddress}
            storePickupDate={storePickupDate}
            storePickupTime={storePickupTime}
            cartId={cartId}
        />
    ), [
        submitStorePickup,
        cancelShowStorePickup,
        saveLocationLoading,
        saveLocationError,
        storePickupDate,
        storePickupAddress,
        cartId,
        storePickupTime
    ])

    // handle session

    const chosenStore = (!!storePickupAddress && !!storePickupDate)

    if (!shouldShowStorePickupText) {
        return (
            <div>
            </div>
        )
    }

    return (
        <div>
            <h3 style={{
                cursor: "pointer",
                color: "#78c4d4",
                fontSize: 17,
                fontWeight: "bold"
            }}
                onClick={showStorePickupMode}
            >{chosenStore ? 'Change Store' : 'Select Store'}</h3>

            {!!chosenStore && (
                <div style={{
                    marginTop: 10
                }}>
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <h3 style={{marginRight: 5, flex: 1}}>Address:</h3>
                        <h3 style={{flex: 4}}>{storePickupAddress}</h3>
                    </div>

                    <div style={{display: "flex", flexDirection: "row"}}>
                        <h3 style={{marginRight: 5, flex: 1}}>Date</h3>
                        <h3 style={{flex: 4}}>{`${storePickupDate}, ${storePickupTime}`}</h3>
                    </div>
                </div>
            )}

            {isSelectingStorePickup && (
                popup
            )}
        </div>
    );
};

export default StorePickup;
