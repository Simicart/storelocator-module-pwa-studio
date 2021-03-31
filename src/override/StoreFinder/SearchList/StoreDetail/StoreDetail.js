import Icon from "@magento/venia-ui/lib/components/Icon";
import React, {useState} from "react";
import {useWindowDimensions} from "../../../other/useWindowDimension";
import {
    ArrowLeft as ArrowLeftIcon,
    MapPin as MapPinIcon,
    Phone as PhoneIcon,
    Mail as MailIcon,
} from 'react-feather';

import {useAnimatePresence} from "use-animate-presence";
import {UPPER_MEDIUM} from "../../../other/BREAKPOINTS";
import {DAYS_OF_WEEK} from "../../../other/DAYS_OF_WEEK";
import {md_hash} from "../../../other/md_hash";

const variants = {
    opacity: {from: 0.4, to: 1},
};

export const StoreDetailInSearchSpace = (props) => {
    const storeDetails = props ? props.storeDetails : null;
    const setShowDetail = props ? props.setShowDetail : () => console.warn('not implemented');
    const {width} = useWindowDimensions()
    const [showExtraTime, setShowExtraTime] = useState(false)
    const [showExtraPhone, setShowExtraPhone] = useState(false)

    const animatedDiv = useAnimatePresence({
        variants,
        initial: "hidden",
        debugName: 'store_detail',
        duration: 50,
    });

    const startTime = storeDetails.startTime;
    const endTime = storeDetails.endTime;
    const nowTime = new Date(Date.now())
    const canShowExtraPhone = (storeDetails.telephone_2 !== null)

    const currentHighLightDateIndex = (nowTime.getHours() >= startTime.getHours()
        && (nowTime.getHours() <= endTime.getHours())) ? nowTime.getDay() : null

    if (!storeDetails) {
        return (
            <div>

            </div>
        )
    }


    return (
        <div
            ref={animatedDiv.ref}
            style={{
                marginTop: 10,
                marginLeft: width > UPPER_MEDIUM ? 25 : 20,
                marginRight: 15,
                backgroundColor: 'white',
                height: '100%',
                paddingTop: 15,
                paddingBottom: 10,
                paddingLeft: 10,
                paddingRight: 10,
                width: width > 880 ? Math.max(381, (width * 3) / (3.2 + 6) - 2) - 50 : 300 - 40,
                maxWidth: 340
            }}>
            <div style={{display: 'flex', flexDirection: 'row', marginBottom: 10}}>
                <button onClick={() => setShowDetail(false)}
                        style={{color: 'rgb(153, 153, 153)'}}
                >
                    <Icon src={ArrowLeftIcon} size={20}/>
                </button>
                <h3 style={{
                    marginLeft: 20,
                    color: 'rgb(153, 153, 153)',
                    fontWeight: "bold",
                    fontSize: 17
                }}>Back to results</h3>
            </div>

            <div style={{marginLeft: 10}}>
                <div key={'name'} style={{marginBottom: 20}}>
                    <h3 style={{
                        fontWeight: "bold",
                        fontSize: 22
                    }}>{storeDetails.name}</h3>
                </div>

                <div>
                    <div key={'address'} style={{display: "flex", flexDirection: "row", marginTop: 7, marginBottom: 7}}>
                        <Icon src={MapPinIcon} size={20}/>
                        <h3 style={{marginLeft: 10, fontSize: 16}}>
                            {`${storeDetails.street || ''} ${storeDetails.region || ''} ${storeDetails.city || ''} ${storeDetails.countryId || ''}`}
                        </h3>
                    </div>

                    {!!storeDetails.timeDisplayTemplate && (
                        <>
                            <div key={'time'}
                                 style={{display: "flex", flexDirection: "row", marginTop: 7, marginBottom: 7}}>
                                <img
                                    src={'@simicart/store_locator/src/override/StoreFinder/SearchList/StoreDetail/clock.svg'}
                                    width={20}
                                    alt={'clock'}
                                />
                                <h3 style={{marginLeft: 10, fontSize: 16, marginRight: 5, marginTop: 3}}>
                                    {storeDetails.timeDisplayTemplate || ''}
                                </h3>

                                <button onClick={() => setShowExtraTime(prev => !prev)}
                                        style={{marginTop: 2}}
                                >
                                    <img
                                        src={showExtraTime ? '@simicart/store_locator/src/override/StoreFinder/SearchList/StoreDetail/chevrons-up.svg' : '@simicart/store_locator/src/override/StoreFinder/SearchList/StoreDetail/chevrons-down.svg'}
                                        width={18}
                                        alt={'extra'}
                                    />
                                </button>
                            </div>

                            {showExtraTime && (
                                <div style={{marginLeft: 33, width: '100%'}}>
                                    {DAYS_OF_WEEK.map((day, index) => {
                                        const chosen = (currentHighLightDateIndex - 1 === index)
                                        return (
                                            <div key={md_hash(day)} style={{
                                                display: "flex",
                                                flexDirection: "row"
                                            }}>
                                                <h3 style={{
                                                    flex: 1,
                                                    fontWeight: chosen ? "bold" : 300,
                                                    fontSize: 14,

                                                }}>{day}</h3>
                                                <h3 style={{
                                                    flex: 1.7,
                                                    fontWeight: chosen ? "bold" : 300,
                                                    fontSize: 14
                                                }}>{storeDetails.timeSimpleTemplate}</h3>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}

                    {!!storeDetails.telephone && (Number.parseInt(storeDetails.telephone) !== 0) && (
                        <div key={'phone'}
                             style={{display: "flex", flexDirection: "row", marginTop: 7, marginBottom: 7}}>
                            <Icon src={PhoneIcon} size={20}/>
                            <h3 style={{marginLeft: 10, fontSize: 16, marginRight: 5, marginTop: 3}}>
                                {storeDetails.telephone || ''}
                            </h3>

                            {canShowExtraPhone && (
                                <button onClick={() => setShowExtraPhone(prev => !prev)}
                                        style={{marginTop: 2}}
                                >
                                    <img
                                        src={showExtraTime ? '@simicart/store_locator/src/override/StoreFinder/SearchList/StoreDetail/chevrons-up.svg' : '@simicart/store_locator/src/override/StoreFinder/SearchList/StoreDetail/chevrons-down.svg'}
                                        width={18}
                                        alt={'extra'}
                                    />
                                </button>
                            )}
                        </div>
                    )}

                    {canShowExtraPhone && showExtraPhone && (
                        <div style={{marginLeft: 33}}>
                            <div style={{
                                display: "flex",
                                flexDirection: "row"
                            }}>
                                <h3 style={{flex: 1, fontSize: 14}}>{'Phone 2'}</h3>
                                <h3 style={{
                                    flex: 1.7, fontSize: 14
                                }}>{storeDetails.telephone_2}</h3>
                            </div>

                        </div>
                    )}

                    {!!storeDetails.email && (
                        <div key={'email'}
                             style={{display: "flex", flexDirection: "row", marginTop: 7, marginBottom: 7}}>
                            <Icon src={MailIcon} size={20}/>

                            <h3 style={{marginLeft: 10, fontSize: 16}}>
                                {storeDetails.email || ''}
                            </h3>
                        </div>
                    )}

                    {!!storeDetails.img && (
                        <div style={{
                            display: "flex",
                            // justifyContent: "center",
                            marginTop: 20,
                        }}>
                            <img src={storeDetails.img} style={{
                                width: '90%',
                                maxWidth: 300
                            }} alt={'Header Image'}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
