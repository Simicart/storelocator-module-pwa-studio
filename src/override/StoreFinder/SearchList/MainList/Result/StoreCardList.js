import React from 'react';
import StoreCard from "./StoreCard";
import {StoreDetailInSearchSpace} from "../../StoreDetail/StoreDetail";
import {md_hash} from "../../../../other/md_hash";

const StoreCardList = (props) => {
    const showDetail = props ? props.showDetail : false;
    const storeDetails = props ? props.storeDetails : null;
    const filteredLocationData = props ? props.filteredLocationData : null;
    const locationsData = props ? props.locationsData : null;
    const upload_default_image = props ? props.upload_default_image : null;
    const setChosenStore = props ? props.setChosenStore : null;
    const setStoreDetails = props ? props.setStoreDetails : null;
    const setShowDetail = props ? props.setShowDetail : null;


    const storeDetailInSearchSpace = (
        <StoreDetailInSearchSpace
            storeDetails={storeDetails}
            setShowDetail={setShowDetail}
        />
    )

    return (
        <div style={{
            overflow: 'hidden',
            overflowY: "scroll",
            height: 500,
        }}>
            {(showDetail && storeDetails) ? (
                storeDetailInSearchSpace
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: "column",
                    alignItems: "center",
                    alignContent: "center",
                    justifyContent: "center",
                    paddingBottom: 5
                }}>
                    {!!filteredLocationData && filteredLocationData.map(x => {
                        const {location_id} = x
                        const _itemConfig = locationsData ? locationsData.filter(y => y.locationId === location_id) : []
                        const itemConfig = (_itemConfig.length > 0) ? _itemConfig[0] : {}
                        return (
                            <StoreCard {...x}
                                       key={md_hash(x)}
                                       config={itemConfig}
                                       upload_default_image={upload_default_image}
                                       handlePress={(address, weekTime) => {
                                           setChosenStore({
                                               lat: x.latitude,
                                               lng: x.longitude,
                                               address: address,
                                               id: location_id,
                                               weekTime: weekTime
                                           })
                                       }}
                                       handleDetailPress={(address, weekTime) => {
                                           setStoreDetails(address)
                                           setShowDetail(true)
                                       }}/>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default StoreCardList;
