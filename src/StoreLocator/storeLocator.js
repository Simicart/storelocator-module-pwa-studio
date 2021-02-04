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
import banner from './images/maxresdefault.jpg'
import logo from './images/the_body_shop_logo-svg.png'
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
    const [showPhone, setShowPhone] = useState(false)
    const [directions, setDirections] = useState(null)
    const [store, setStore] = useState([])
    const [showDirection, setShowDirection] = useState(false)
    const { data: dataStoreLocatorLocation, loading: loadingStoreLocatorLocation, error: errorStoreLocatorLocation } = useQuery(GET_MP_STORELOCATOR_LOCATIONS, {
        variables: {
            pageSize: 99999,
            currentPage: 1
        }
    });
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
    const handleOnkeyDown = useCallback(
        (e) => {
           if(e.key === 'Enter'){
               searchStoreByName({
                   variables:{
                       name:`%${valueSearch}%`
                   }
               })
           }
        }
    )
    const handleSelectFilter = useCallback(
        (e) => {
            if (centerGPS) {
                if (dataStoreLocatorConfig.MpStoreLocatorConfig.distance_unit !== null) {
                    if (dataStoreLocatorConfig.MpStoreLocatorConfig.distance_unit === 'km') {
                        if (e.target.value == 'df' && dataStoreLocatorConfig.MpStoreLocatorConfig.default_radius !== null) {
                            setValueFilterRadius(default_radius * 1000)
                        }
                        setValueFilterRadius(e.target.value * 1000)

                    } else {
                        if (e.target.value == 'df' && dataStoreLocatorConfig.MpStoreLocatorConfig.default_radius !== null) {
                            setValueFilterRadius(dataStoreLocatorConfig.MpStoreLocatorConfig.default_radius * 100)
                        }
                        setValueFilterRadius(e.target.value * 100)

                    }
                } else {
                    setValueFilterRadius(e.target.value * 1000)
                }
            }

        },
        [valueFilterRadius, centerGPS, directions],
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
    const handleShowDirection = useCallback(
        () => {
            setShowDirection(!showDirection)
            if (!centerGPS) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setCenterGPS({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        })
                    })
            }
        },
        [showDirection,centerGPS],
    )
    const handleChangeSearch = useCallback(
        (e) => {
            setValueSearch(e.target.value)
            setIsShowDetail(false)
        }
    )
    const onClickSearch=useCallback(
        () => {
                searchStoreByName({
                    variables:{
                        name: `%${valueSearch}%`
                    }
                })
        },
        [valueSearch],
    )
    const handleClickSearchBar = useCallback(
        () => {
            setDirections(null)
            setIsShowDetail(false)
            setStore(dataStoreLocatorLocation.MpStoreLocatorLocations.items)
        }
    )
    useEffect(() => {
        let listStore = []
        if (!valueSearch && !centerGPS && !valueFilterRadius) {
            if (loadingStoreLocatorLocation || errorStoreLocatorLocation) {
                return
            }else{
              
                let newList = dataStoreLocatorLocation.MpStoreLocatorLocations.items
                newList = JSON.parse(JSON.stringify(newList))
                listStore = newList.reverse()
            
            }
        }
        if (centerGPS && valueFilterRadius && !directions) {
            setValueSearch('')
            setDirections(null)
            listStore = listFilterRadius
        }else{
            let newList = dataStoreLocatorLocation.MpStoreLocatorLocations.items
            newList = JSON.parse(JSON.stringify(newList))
            listStore = newList.reverse()
           
        }
        if (dataSearch) {
            let newList = dataSearch.MpStoreLocatorLocations.items
            newList = JSON.parse(JSON.stringify(newList))
            listStore = newList.reverse()
            
        }
        setStore(listStore)
    }, [valueSearch,
        centerGPS,
        valueFilterRadius,
        listFilterRadius,
        dataSearch,
        loadingDataSearch,
        searchStoreByName])

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
    const getTimeStore = (locationId) => {
        const getToday = new Date();
        const today = getToday.getDay();
        let time;
        locationsData.map((item, index) => {
            if (item.locationId == locationId) {
                let timeOpen = item.timeData[today].from.map((to, io) => {
                    if (io === 0) {
                        return to + ':'
                    }
                    return to
                })
                let timeClose = item.timeData[today].to.map((tc, ic) => {
                    if (ic === 0) {
                        return tc + ':'
                    }
                    return tc;
                })
                time = timeOpen + ' - ' + timeClose;
            }

        })
        return time.replace(',', '').replace(',', '');
    }
    let listTimeOnWeek;
    let timeOfStore;
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
    }
    const handleImage = (arrImage) => {
        let images;
        let newImage;
        if (arrImage !== "[]") {
            images = JSON.parse(arrImage).map(item => item)
            newImage = images[0].file
        } else {
            newImage = MpStoreLocatorConfig.upload_default_image
        }
        return newImage
    }
    let filter_radius = new Array();
    if (MpStoreLocatorConfig.filter_radius !== null) {
        filter_radius = MpStoreLocatorConfig.filter_radius.split(',')
    }
    return (
        <div>

            <div className={classes.banner} style={{ backgroundImage: `url(${MpStoreLocatorConfig.upload_head_image ? MpStoreLocatorConfig.upload_head_image : banner})` }}>
                <div className={classes.bannerLeft}>
                    <div className={classes.title}>{MpStoreLocatorConfig.title ? MpStoreLocatorConfig.title : 'Find a store'}</div>
                    <div className={classes.subTitle}>{MpStoreLocatorConfig.description ? MpStoreLocatorConfig.description : 'We have more than 100 stores all over the globe. Find the nearest store to get your favorite stuff.'}</div>
                </div>
                <div className={classes.bannerRight}>
                    <img src={MpStoreLocatorConfig.upload_head_icon ? MpStoreLocatorConfig.upload_head_icon : logo} />
                </div>
            </div>
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
                            onClick={handleClickSearchBar}
                            onChange={handleChangeSearch}
                            onKeyDown={handleOnkeyDown}
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
                                onClick={onClickSearch}
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
                            {
                               store.length>0? store.map((store, index) => (
                                    <li key={index} onClick={handleClickStore(store, index)}>
                                        <div className={classes.storeItem}>
                                            <div className={classes.storeItemImg}>
                                                <img src={store.images !=='[]'?handleImage(store.images):MpStoreLocatorConfig.upload_default_image?MpStoreLocatorConfig.upload_default_image:banner} alt={'image'} />
                                            </div>
                                            <div className={classes.storeItemInfo}>
                                                <div className={classes.itemTitle}>
                                                    <h3>{store.name?store.name:''}</h3>
                                                </div>
                                                <div className={classes.itemAddress}>
                                                    {store.street?store.street + ' ':''}
                                                    {store.state_province?store.state_province + ' ':''}
                                                    {store.city?store.city + ' ':''}
                                                    {store.country?store.country + ' ':''}
                                                </div>
                                                <div className={classes.openDoor}>
                                                    {getTimeStore(store.location_id)}
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
                                )):<div className={classes.noResuilt}>
                                    No store ++++
                                </div>
                            }
                            {
                                isShowDetail === true && location !== null ?
                                    <div className={classes.storeDetails}>
                                        <p className={classes.btnBack} onClick={() => setIsShowDetail(!isShowDetail)}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 512 512"
                                                width="1em"
                                                height="1em"

                                            >
                                                <path d="M492 236H68.442l70.164-69.824c7.829-7.792 7.859-20.455.067-28.284-7.792-7.83-20.456-7.859-28.285-.068l-104.504 104-.018.019c-7.809 7.792-7.834 20.496-.002 28.314l.018.019 104.504 104c7.828 7.79 20.492 7.763 28.285-.068 7.792-7.829 7.762-20.492-.067-28.284L68.442 276H492c11.046 0 20-8.954 20-20s-8.954-20-20-20z" />
                                            </svg>
                                            <button>
                                                Back to resuilts
                                        </button>
                                        </p>
                                        <div className={classes.getDirection}>
                                            <div className={classes.btnGetDirection} onClick={handleShowDirection}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 511.983 511.983"
                                                    width="1em"
                                                    height="1em"
                                                >
                                                    <path
                                                        d="M507.328 215.175l-234.667-160c-4.873-3.311-11.507-2.045-14.817 2.828A10.674 10.674 0 00256 63.986v96.213C91.947 166.983 2.133 329.33 0 447.453v.533c0 5.891 4.776 10.667 10.667 10.667 5.825.001 10.573-4.672 10.667-10.496v-.619C22.528 418.887 134.656 295.303 256 288.306v95.68c.007 5.891 4.788 10.661 10.679 10.655a10.666 10.666 0 005.983-1.844l234.667-160c4.866-3.321 6.119-9.957 2.798-14.823a10.69 10.69 0 00-2.799-2.799z"
                                                        fill="#2196f3"
                                                    />
                                                </svg>
                                                get directions
                                            </div>
                                             <div className={showDirection? classes.listDirection:classes.noShowDirection}>
                                                    <div id="panel"></div>
                                                </div>
                                        </div>
                                        {location.name && <h2>{location.name}</h2>}
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
                                            {location.street && location.street + ' '}
                                            {location.state_province && location.state_province + ' '}
                                            {location.city && location.city + ' '}
                                            {location.country && location.country + ' '}
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
                                            </svg>Open at {getTimeStore(location.location_id)}
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
                                        {
                                            location.phone_one ? <p>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 473.806 473.806"
                                                    width="1em"
                                                    height="1em"
                                                >
                                                    <path d="M374.456 293.506c-9.7-10.1-21.4-15.5-33.8-15.5-12.3 0-24.1 5.3-34.2 15.4l-31.6 31.5c-2.6-1.4-5.2-2.7-7.7-4-3.6-1.8-7-3.5-9.9-5.3-29.6-18.8-56.5-43.3-82.3-75-12.5-15.8-20.9-29.1-27-42.6 8.2-7.5 15.8-15.3 23.2-22.8 2.8-2.8 5.6-5.7 8.4-8.5 21-21 21-48.2 0-69.2l-27.3-27.3c-3.1-3.1-6.3-6.3-9.3-9.5-6-6.2-12.3-12.6-18.8-18.6-9.7-9.6-21.3-14.7-33.5-14.7s-24 5.1-34 14.7l-.2.2-34 34.3c-12.8 12.8-20.1 28.4-21.7 46.5-2.4 29.2 6.2 56.4 12.8 74.2 16.2 43.7 40.4 84.2 76.5 127.6 43.8 52.3 96.5 93.6 156.7 122.7 23 10.9 53.7 23.8 88 26 2.1.1 4.3.2 6.3.2 23.1 0 42.5-8.3 57.7-24.8.1-.2.3-.3.4-.5 5.2-6.3 11.2-12 17.5-18.1 4.3-4.1 8.7-8.4 13-12.9 9.9-10.3 15.1-22.3 15.1-34.6 0-12.4-5.3-24.3-15.4-34.3l-54.9-55.1zm35.8 105.3c-.1 0-.1.1 0 0-3.9 4.2-7.9 8-12.2 12.2-6.5 6.2-13.1 12.7-19.3 20-10.1 10.8-22 15.9-37.6 15.9-1.5 0-3.1 0-4.6-.1-29.7-1.9-57.3-13.5-78-23.4-56.6-27.4-106.3-66.3-147.6-115.6-34.1-41.1-56.9-79.1-72-119.9-9.3-24.9-12.7-44.3-11.2-62.6 1-11.7 5.5-21.4 13.8-29.7l34.1-34.1c4.9-4.6 10.1-7.1 15.2-7.1 6.3 0 11.4 3.8 14.6 7l.3.3c6.1 5.7 11.9 11.6 18 17.9 3.1 3.2 6.3 6.4 9.5 9.7l27.3 27.3c10.6 10.6 10.6 20.4 0 31-2.9 2.9-5.7 5.8-8.6 8.6-8.4 8.6-16.4 16.6-25.1 24.4-.2.2-.4.3-.5.5-8.6 8.6-7 17-5.2 22.7l.3.9c7.1 17.2 17.1 33.4 32.3 52.7l.1.1c27.6 34 56.7 60.5 88.8 80.8 4.1 2.6 8.3 4.7 12.3 6.7 3.6 1.8 7 3.5 9.9 5.3.4.2.8.5 1.2.7 3.4 1.7 6.6 2.5 9.9 2.5 8.3 0 13.5-5.2 15.2-6.9l34.2-34.2c3.4-3.4 8.8-7.5 15.1-7.5 6.2 0 11.3 3.9 14.4 7.3l.2.2 55.1 55.1c10.3 10.2 10.3 20.7.1 31.3zM256.056 112.706c26.2 4.4 50 16.8 69 35.8s31.3 42.8 35.8 69c1.1 6.6 6.8 11.2 13.3 11.2.8 0 1.5-.1 2.3-.2 7.4-1.2 12.3-8.2 11.1-15.6-5.4-31.7-20.4-60.6-43.3-83.5s-51.8-37.9-83.5-43.3c-7.4-1.2-14.3 3.7-15.6 11s3.5 14.4 10.9 15.6zM473.256 209.006c-8.9-52.2-33.5-99.7-71.3-137.5s-85.3-62.4-137.5-71.3c-7.3-1.3-14.2 3.7-15.5 11-1.2 7.4 3.7 14.3 11.1 15.6 46.6 7.9 89.1 30 122.9 63.7 33.8 33.8 55.8 76.3 63.7 122.9 1.1 6.6 6.8 11.2 13.3 11.2.8 0 1.5-.1 2.3-.2 7.3-1.1 12.3-8.1 11-15.4z" />
                                                </svg>
                                                {location.phone_one}
                                                {
                                                    location.phone_two !== null && <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="1em"
                                                        height="1em"
                                                        viewBox="0 0 970.586 970.586"
                                                        className={classes.iconDoubleDown}
                                                        onClick={() => setShowPhone(!showPhone)}
                                                    >
                                                        <path d="M44.177 220.307l363.9 296.4c22.101 18 48.9 27 75.8 27 26.901 0 53.701-9 75.801-27l366.699-298.7c51.4-41.9 59.101-117.4 17.2-168.8-41.8-51.4-117.399-59.1-168.8-17.3l-290.901 237-288.1-234.7c-51.4-41.8-127-34.1-168.8 17.3-41.899 51.4-34.099 126.9 17.201 168.8z" />
                                                        <path d="M44.177 642.207l363.9 296.399c22.101 18 48.9 27 75.8 27 26.901 0 53.701-9 75.801-27l366.699-298.7c51.4-41.899 59.101-117.399 17.2-168.8-41.899-51.399-117.399-59.1-168.8-17.2l-290.901 236.9-288.1-234.6c-51.4-41.9-127-34.101-168.8 17.199-41.899 51.402-34.099 127.001 17.201 168.802z" />
                                                    </svg>
                                                }
                                            </p> : null
                                        }
                                        {showPhone && location.phone_two !== null ? <p className={classes.phoneTwo}> Phone two: {location.phone_two}</p> : null}
                                        {
                                            location.website && <p>{location.website}</p>
                                        }

                                        {
                                            location.email && <p>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 512 512"
                                                    width="1em"
                                                    height="1em"
                                                >
                                                    <path d="M467 61H45C20.218 61 0 81.196 0 106v300c0 24.72 20.128 45 45 45h422c24.72 0 45-20.128 45-45V106c0-24.72-20.128-45-45-45zm-6.214 30L256.954 294.833 51.359 91h409.427zM30 399.788V112.069l144.479 143.24L30 399.788zM51.213 421l144.57-144.57 50.657 50.222c5.864 5.814 15.327 5.795 21.167-.046L317 277.213 460.787 421H51.213zM482 399.787L338.213 256 482 112.212v287.575z" />
                                                </svg>
                                                {location.email}
                                            </p>
                                        }
                                        {
                                            showTime ? (
                                                <div className={classes.timeInWeeks}>
                                                    <div className={classes.dayInWeeks}>
                                                        {dayInWeeks.map((item, index) => <p className={index == today - 1 ? classes.timeToday : ''}>{item}</p>)}
                                                    </div>
                                                    <div className={classes.timeItem}>
                                                        {timeOfStore.map((item, index) => <p key={index} className={index == today - 1 ? classes.timeToday : ''}>{item.replace(',', '').replace(',', '')}</p>)}
                                                    </div>
                                                </div>
                                            ) : null
                                        }
                                        <p className={classes.imageDetail}>
                                            {
                                                location.images!=='[]'&&<img src={handleImage(location.images)} alt="images store" />
                                            }
                                        </p>
                                    </div> : null
                            }

                        </ul>
                    </div>
                    {
                        toggleLeft &&
                        <div className={classes.toggleLeft}>
                            <label>Filter radius:</label>
                            <select onChange={handleSelectFilter}>
                                <option value='df'>Default</option>
                                {filter_radius.map((item, index) => (
                                    <option key={index} value={item} onClick={handleSelectFilter}>{item}</option>
                                ))}

                            </select>
                            <span onClick={() => setToggleLeft(!toggleLeft)}>X</span>
                        </div>
                    }
                </div>
                <div className={classes.map}>
                    <Map
                        listItem={listStore}
                        MpStoreLocatorConfig={MpStoreLocatorConfig}
                        keyStore={keyStore}
                        onMapLoad={onMapLoad}
                        isUpdate={isUpdate}
                        isGPS={isGPS}
                        storeLatLng={location}
                        valueFilterRadius={valueFilterRadius}
                        centerGPS={centerGPS}
                        handleFilterRadius={handleFilterRadius}
                        getDirection={setDirections}
                        direct={directions}
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
