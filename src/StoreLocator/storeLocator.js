import React, { useCallback, useEffect, useRef, useState } from 'react';
import { mergeClasses } from '@magento/venia-ui/lib/classify'
import defaultClass from './style.css';
import iconFilter from './images/icon-filter.png'
import Map from './map'
import {
    GET_MP_STORELOCATOR_LOCATIONS,
    GET_STORELOCATOR_CONFIG,
    GET_STORELOCATOR_LOCATION_BY_NAME
} from './storeLocator.gql'
import { useLazyQuery, useQuery } from '@apollo/client';
import SlideImage from './sildeImage';
import { array } from 'prop-types';


const StoreLocator = (props) => {
    const classes = mergeClasses(defaultClass, props.classes)
    const [keyStore, setKeyStore] = useState(0);
    const [toggleLeft, setToggleLeft] = useState(false)
    const [isShowDetail, setIsShowDetail] = useState(false)
    const [isUpdate, setIsUpdate] = useState(0)
    const [isGPS, setIsGPS] = useState(false)
    const [location, setLocation] = useState(null)
    const [valueFilterRadius, setValueFilterRadius] = useState(0)
    const [valueSearch, setValueSearch] = useState('')
    const [centerGPS, setCenterGPS] = useState(null)
    const [listFilterRadius, setListFilterRadius] = useState()
    const [showTime, setShowTime] = useState(false)
    const { data: dataStoreLocatorLocation, loading: loadingStoreLocatorLocation, error: errorStoreLocatorLocation } = useQuery(GET_MP_STORELOCATOR_LOCATIONS);
    const { data: dataStoreLocatorConfig, loading: loadingStoreLocatorConfig, error: errorStoreLocatorConfig } = useQuery(GET_STORELOCATOR_CONFIG);
    const [searchStoreByName, { data: dataSearch, loading: loadingDataSearch, error: errorDataSearch }] = useLazyQuery(GET_STORELOCATOR_LOCATION_BY_NAME)
    const mapRef = useRef();
    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);
    const panTo = useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
    }, []);
    const handleClickDetail = useCallback(
        (location, isShow) => () => {
            setLocation(location)
            setIsShowDetail(true)
        },
        [isShowDetail, location],
    )
    const handleFilterRadius = useCallback(
        (value) => setListFilterRadius(value),
        [valueFilterRadius],
    )
    const handleSelectFilter = useCallback(
        (e) => {
            if (MpStoreLocatorConfig.distance_unit !== null) {
                if (MpStoreLocatorConfig.distance_unit === 'km') {
                    setValueFilterRadius(e.target.value * 1000)
                    
                }else{
                    setValueFilterRadius(e.target.value * 100)

                }
            }
            setValueFilterRadius(e.target.value * 1000)

        },
        [valueFilterRadius],
    )
    const handleClickStore = useCallback(
        (store, index) => () => {
            setKeyStore(index)
            setIsUpdate(1)
            setLocation(store)
            panTo({
                lat: parseFloat(store.latitude),
                lng: parseFloat(store.longitude),
            });
        },
        [keyStore, isUpdate, location],
    )


    if (loadingStoreLocatorConfig || loadingStoreLocatorLocation || loadingDataSearch) {
        return 'loading'
    }
    if (errorStoreLocatorConfig || errorStoreLocatorLocation || errorDataSearch) {
        return 'err'
    }
    const { items: listStore } = dataStoreLocatorLocation.MpStoreLocatorLocations
    const { MpStoreLocatorConfig } = dataStoreLocatorConfig

    const getToday = new Date();
    const today = getToday.getDay();
    const { locationsData } = MpStoreLocatorConfig

    function getTimeStore(day) {
        const timeOpen = locationsData[0].timeData[day].from.map((item, index) => {
            if (index == 0) {
                return item + ':'
            } else {
                return item
            }

        });
        const timeClose = locationsData[0].timeData[day].to.map((item, index) => {
            if (index == 0) {
                return item + ':'
            } else {
                return item
            }
        });
        let newTime = timeOpen + ' - ' + timeClose
        return newTime.replace(',', '').replace(',', '')
    }
    let listTimeOnWeek;
    let timeOfStore;
    const timeStore = getTimeStore(today)
    const dayInWeeks = ['Monday', 'TuesDay', 'Wednesday', 'Thurday', 'Friday', 'Saturday', 'Sunday']
    if (location) {

        listTimeOnWeek = locationsData.map((item) => {
            if (location.location_id === item.locationId) {
                let listTime = item.timeData.map((timedat, indextimedata) => {
                    let timeOpen = timedat.from.map((itemfrom, indexfrom) => {
                        if (indexfrom === 0) {
                            return itemfrom + ' : '
                        }

                        return itemfrom
                    })
                    let timeClose = timedat.to.map((itemTo, indexTo) => {
                        if (indexTo === 0) {
                            return itemTo + ' : '
                        }
                        return itemTo
                    })
                    // console.log(timeOpen);
                    return timeOpen + '-' + timeClose
                })
                timeOfStore = listTime
                return listTime;
            }
        });
        //  console.log(listTimeOnWeek);


    }

    let center = {
        lat: 20.981408408337995,
        lng: 105.789511242358
    }
    const handleImage = (arrImage) => {
        let images;
        let newImage;
        if (arrImage !== "[]") {
            images = JSON.parse(arrImage).map(item => item)
            newImage = images[0].file
        } else {
            newImage = 'https://mpmed.pwa-commerce.com/static/version1610619864/frontend/Magento/luma/en_US/Mageplaza_StoreLocator/media/defaultImg.png'
        }
        return newImage
    }

    const allStore = listStore.map((store, index) => (
        <li key={index} onClick={handleClickStore(store, index)}>
            <div className={classes.storeItem}>
                <div className={classes.storeItemImg}>
                    <img src={handleImage(store.images)} alt={'image'} />
                </div>
                <div className={classes.storeItemInfo}>
                    <div className={classes.itemTitle}>
                        <h3>{store.name}</h3>
                    </div>
                    <div className={classes.itemAddress}>
                        {store.street + ' '}
                        {store.state_province + ' '}
                        {store.city + ' '}
                        {store.country + ' '}
                    </div>
                    <div className={classes.openDoor}>
                        {timeStore}
                    </div>
                </div>
            </div>
            <hr />
            <div className={classes.showDetails}
                onClick={
                    handleClickDetail(store, isShowDetail)
                }
            >
                Detail +
            </div>
        </li>
    ))
    let storeSearch
    if (dataSearch) {
        const { items: searchItem } = dataSearch.MpStoreLocatorLocations
        storeSearch = searchItem.length > 0 ? searchItem.map((store, index) => (
            <li key={index} onClick={handleClickStore(store, index)}>
                <div className={classes.storeItem}>
                    <div className={classes.storeItemImg}>
                        <img src={handleImage(store.images)} alt={'image'} />
                    </div>
                    <div className={classes.storeItemInfo}>
                        <div className={classes.itemTitle}>
                            <h3>{store.name}</h3>
                        </div>
                        <div className={classes.itemAddress}>
                            {store.street + ' '}
                            {store.state_province + ' '}
                            {store.city + ' '}
                            {store.country + ' '}
                        </div>
                        <div className={classes.openDoor}>
                            {timeStore}
                        </div>
                    </div>
                </div>
                <hr />
                <div className={classes.showDetails}
                    onClick={
                        handleClickDetail(store, isShowDetail)
                    }
                >
                    Detail +
                </div>
            </li>
        )) : (
                <div className={classes.noResuilt}>
                    No resuilt +
                </div>
            )
    }
    let storeFilterRadius
    if (listFilterRadius) {
        storeFilterRadius = listFilterRadius.length > 0 ? listFilterRadius.map((store, index) => (
            <li key={index} onClick={handleClickStore(store, index)}>
                <div className={classes.storeItem}>
                    <div className={classes.storeItemImg}>
                        <img src={handleImage(store.images)} alt={'image'} />
                    </div>
                    <div className={classes.storeItemInfo}>
                        <div className={classes.itemTitle}>
                            <h3>{store.name}</h3>
                        </div>
                        <div className={classes.itemAddress}>
                            {store.street + ' '}
                            {store.state_province + ' '}
                            {store.city + ' '}
                            {store.country + ' '}
                        </div>
                        <div className={classes.openDoor}>
                            {timeStore}
                        </div>
                    </div>
                </div>
                <hr />
                <div className={classes.showDetails}
                    onClick={
                        handleClickDetail(store, isShowDetail)
                    }
                >
                    Detail +
                </div>
            </li>
        )) : (
                <div className={classes.noResuilt}>
                    No resuilt +
                </div>
            )
    }

    return (
        <div>
            <div className={classes.storeLocator} >
                <div className={classes.store}>
                    <div className={classes.search}>
                        <span className={classes.iconLeft}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="#fff"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="prefix__icon-icon-5Yc"
                                {...props}
                                onClick={() => setToggleLeft(!toggleLeft)}
                            >
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </span>

                        <input type='text' value={valueSearch}
                            onClick={() => setIsShowDetail(false)}
                            onChange={(e) => {
                                setValueSearch(e.target.value)
                                setIsShowDetail(false)
                            }}
                            onKeyDown={(e) => {
                                setIsShowDetail(false)
                                if (e.key === 'Enter') {
                                    searchStoreByName({
                                        variables: {
                                            name: `%${valueSearch}%`
                                        }
                                    })
                                }
                            }}
                        />
                        <div className={`${classes.iconRight}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="#fff"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="prefix__icon-icon-5Yc"
                                {...props}
                                onClick={() => searchStoreByName({
                                    variables: {
                                        name: `%${valueSearch}%`
                                    }
                                })}
                            >
                                <circle cx={11} cy={11} r={8} />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <span className={classes.iconFilter} >
                                <button
                                    className="locate"
                                    onClick={() => {
                                        setIsGPS(!isGPS)
                                        navigator.geolocation.getCurrentPosition(
                                            (position) => {
                                                setCenterGPS({
                                                    lat: position.coords.latitude,
                                                    lng: position.coords.longitude,
                                                })
                                                panTo({
                                                    lat: position.coords.latitude,
                                                    lng: position.coords.longitude,
                                                });

                                            },
                                            () => null
                                        );
                                    }}
                                >
                                    <img src={iconFilter} alt="compass" />
                                </button>
                            </span>
                        </div>
                    </div>
                    <div className={classes.storeLocal}>
                        <ul className={classes.listStore}>
                            {valueSearch ? storeSearch : listFilterRadius ? storeFilterRadius : valueSearch ? valueSearch !== '' ? storeSearch : allStore : allStore}

                            {
                                isShowDetail === true && location !== null ?
                                    <div className={classes.storeDetails}>
                                        <p className="btn-back" onClick={() => setIsShowDetail(!isShowDetail)}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 512 512"
                                                width="1em"
                                                height="1em"
                                                {...props}
                                            >
                                                <path d="M492 236H68.442l70.164-69.824c7.829-7.792 7.859-20.455.067-28.284-7.792-7.83-20.456-7.859-28.285-.068l-104.504 104-.018.019c-7.809 7.792-7.834 20.496-.002 28.314l.018.019 104.504 104c7.828 7.79 20.492 7.763 28.285-.068 7.792-7.829 7.762-20.492-.067-28.284L68.442 276H492c11.046 0 20-8.954 20-20s-8.954-20-20-20z" />
                                            </svg>
                                            <button>
                                                Back to resuilts
                                        </button>
                                        </p>
                                        <h2>{location.name}</h2>
                                        <p>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="1em"
                                                height="1em"
                                                viewBox="0 0 491.582 491.582"
                                                {...props}
                                            >
                                                <path d="M245.791 0C153.799 0 78.957 74.841 78.957 166.833c0 36.967 21.764 93.187 68.493 176.926 31.887 57.138 63.627 105.4 64.966 107.433l22.941 34.773a12.497 12.497 0 0020.868 0l22.94-34.771c1.326-2.01 32.835-49.855 64.967-107.435 46.729-83.735 68.493-139.955 68.493-176.926C412.625 74.841 337.783 0 245.791 0zm76.511 331.576c-31.685 56.775-62.696 103.869-64.003 105.848l-12.508 18.959-12.504-18.954c-1.314-1.995-32.563-49.511-64.007-105.853-43.345-77.676-65.323-133.104-65.323-164.743C103.957 88.626 167.583 25 245.791 25s141.834 63.626 141.834 141.833c0 31.643-21.978 87.069-65.323 164.743z" />
                                                <path d="M245.791 73.291c-51.005 0-92.5 41.496-92.5 92.5s41.495 92.5 92.5 92.5 92.5-41.496 92.5-92.5-41.495-92.5-92.5-92.5zm0 160c-37.22 0-67.5-30.28-67.5-67.5s30.28-67.5 67.5-67.5c37.221 0 67.5 30.28 67.5 67.5s-30.279 67.5-67.5 67.5z" />
                                            </svg>
                                            {location.street + ' '}
                                            {location.state_province + ' '}
                                            {location.city + ' '}
                                            {location.country + ' '}
                                        </p>
                                        <p>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 512 512"
                                                width="1em"
                                                height="1em"
                                                {...props}
                                            >
                                                <path d="M347.216 301.211l-71.387-53.54V138.609c0-10.966-8.864-19.83-19.83-19.83-10.966 0-19.83 8.864-19.83 19.83v118.978c0 6.246 2.935 12.136 7.932 15.864l79.318 59.489a19.713 19.713 0 0011.878 3.966c6.048 0 11.997-2.717 15.884-7.952 6.585-8.746 4.8-21.179-3.965-27.743z" />
                                                <path d="M256 0C114.833 0 0 114.833 0 256s114.833 256 256 256 256-114.833 256-256S397.167 0 256 0zm0 472.341c-119.275 0-216.341-97.066-216.341-216.341S136.725 39.659 256 39.659c119.295 0 216.341 97.066 216.341 216.341S375.275 472.341 256 472.341z" />
                                            </svg>Open at {timeStore}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="1em"
                                                height="1em"
                                                viewBox="0 0 970.586 970.586"
                                                className={classes.iconDoubleDown}
                                                {...props}
                                                onClick={() => setShowTime(!showTime)}
                                            >
                                                <path d="M44.177 220.307l363.9 296.4c22.101 18 48.9 27 75.8 27 26.901 0 53.701-9 75.801-27l366.699-298.7c51.4-41.9 59.101-117.4 17.2-168.8-41.8-51.4-117.399-59.1-168.8-17.3l-290.901 237-288.1-234.7c-51.4-41.8-127-34.1-168.8 17.3-41.899 51.4-34.099 126.9 17.201 168.8z" />
                                                <path d="M44.177 642.207l363.9 296.399c22.101 18 48.9 27 75.8 27 26.901 0 53.701-9 75.801-27l366.699-298.7c51.4-41.899 59.101-117.399 17.2-168.8-41.899-51.399-117.399-59.1-168.8-17.2l-290.901 236.9-288.1-234.6c-51.4-41.9-127-34.101-168.8 17.199-41.899 51.402-34.099 127.001 17.201 168.802z" />
                                            </svg>
                                        </p>
                                        <p>{location.website}</p>
                                        {
                                            showTime ? (
                                                <div className={classes.timeInWeeks}>
                                                    <div className={classes.dayInWeeks}>
                                                        {dayInWeeks.map((item,index)=><p className={index==today-1?classes.timeToday:''}>{item}</p>)}
                                                    </div>
                                                    <div className={classes.timeItem}>
                                                        {timeOfStore.map((item,index)=><p className={index==today-1?classes.timeToday:''}>{item.replace(',','').replace(',','')}</p>)}
                                                    </div>
                                                </div>
                                            ) : null
                                        }

                                        
                                        <p className={classes.imageDetail}>
                                            <img src={handleImage(location.images)} alt="images store" />
                                        </p>
                                    </div> : null
                            }

                        </ul>
                    </div>
                    {
                        toggleLeft &&
                        <div className={classes.toggleLeft}>
                            <label>Filter radius:</label>
                            <select value={valueFilterRadius} onChange={handleSelectFilter}>
                                <option  value='5'>Default</option>
                                <option value='5'>5</option>
                                <option value='10'>10</option>
                                <option value='50'>50</option>
                                <option value='100'>100</option>

                            </select>
                            <span onClick={() => setToggleLeft(!toggleLeft)}>X</span>
                        </div>
                    }
                </div>
                <div className={classes.map}>
                    <Map
                        listStore={listStore}
                        MpStoreLocatorConfig={MpStoreLocatorConfig}
                        keyStore={keyStore}
                        onMapLoad={onMapLoad}
                        timeStore={timeStore}
                        isUpdate={isUpdate}
                        isGPS={isGPS}
                        location={location}
                        valueFilterRadius={valueFilterRadius}
                        centerGPS={centerGPS}
                        handleFilterRadius={handleFilterRadius}
                    />
                </div>
            </div>
            {
                isShowDetail &&
                <div className={classes.slideImages}>
                    <SlideImage location={location} />
                </div>
            }
        </div>
    )
}

export default StoreLocator
