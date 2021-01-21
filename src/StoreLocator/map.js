import React, { useEffect, useReducer, useRef, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { lightGrey, buleEssence, darkGrey, defaultStyle, midNight } from './mapStyles'
const containerStyle = {
  width: '100%',
  height: '100%'
};
const Map = props => {
  const {
    listStore,
    keyStore,
    MpStoreLocatorConfig,
    onMapLoad,
    timeStore,
    isUpdate,
    isGps,
    valueFilterRadius,
    centerGPS,
    handleFilterRadius
  } = props;
  const [markers, setMarkers] = useState(listStore);
  const [selected, setSelected] = useState(null);
  const [keyStoreItem, setKeyStoreItem] = useState(keyStore)
  const [centerMap, setCenterMap] = useState({
    defaultCenter: {
      lat: 20.981408408337995,
      lng: 105.789511242358
    }
  })
  const [mapStyles, setMapStyles] = useState(defaultStyle)
  
  useEffect(() => {
    if (MpStoreLocatorConfig.custom_style === null) {
      switch (MpStoreLocatorConfig.style) {
        // case 'default':
        //   setMapStyles(defaultStyle);
        //   break;
        case 'light-grey':
          setMapStyles(lightGrey);
          break;
        case 'dark-grey':
          setMapStyles(darkGrey);
          break;
        case 'blue-essence':
          setMapStyles(buleEssence);
          break;
        case 'mid-night':
          setMapStyles(midNight);
          break;
        default:
          setMapStyles(defaultStyle);
          break;
      }
    }else{
      setMapStyles(MpStoreLocatorConfig.custom_style)
    }
    
  }, [MpStoreLocatorConfig, mapStyles])
  useEffect(() => {
    if (keyStoreItem >= 0) {
      setCenterMap({
        ...centerMap,
        storeCenter: {
          lat: parseFloat(markers[keyStore].latitude),
          lng: parseFloat(markers[keyStore].longitude)
        }
      }
      )
    }

  }, [isUpdate])
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MpStoreLocatorConfig.key
  })
  const options = {
    styles: mapStyles,
    disableDefaultUI: false,
    zoomControl: true,
    fullscreenControl: true,
    radius: parseFloat(valueFilterRadius),

  };

  const circleOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    center: centerGPS ? centerGPS : null,
    radius: parseFloat(valueFilterRadius) >= 5000 ? parseFloat(valueFilterRadius) : 0,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    zIndex: 1,
  }
  let listStoreFilterRadius= Array();
  let distance;
  const showMarker = valueFilterRadius !== null && markers.map((marker, index) =>{
    if (centerGPS) {
      distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(centerGPS.lat, centerGPS.lng), new google.maps.LatLng(marker.latitude, marker.longitude));
    }
    if (valueFilterRadius < distance) {
      return
    }else{
      listStoreFilterRadius.push(marker)
      return   <Marker
      key={index}
      position={
        {
          lat: parseFloat(marker.latitude),
          lng: parseFloat(marker.longitude)
        }
      }
      onClick={() => {
        setSelected(marker);
      }}
      icon={{
        url: MpStoreLocatorConfig.markerIcon,
        // origin: new window.google.maps.Point(0, 0),
        // anchor: new window.google.maps.Point(15, 15),
        // scaledSize: new window.google.maps.Size(24, 24),
      }}
    />
    }
  })
  handleFilterRadius(listStoreFilterRadius);
  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerMap.gspCenter ? centerMap.gspCenter : centerMap.storeCenter ? centerMap.storeCenter : centerMap.defaultCenter}
      center={centerMap.defaultCenter}
      options={options}
      zoom={isUpdate === 1 ? parseInt(MpStoreLocatorConfig.zoom) : 14}
      onLoad={onMapLoad}
      
    >
      {showMarker}
      {
        centerGPS && (
          <Marker
            position={centerGPS}
            icon={{
              url: MpStoreLocatorConfig.markerIcon,
              // origin: new window.google.maps.Point(0, 0),
              // anchor: new window.google.maps.Point(15, 15),
              // scaledSize: new window.google.maps.Size(24, 24),
            }}
          />
        )
      }
      <Circle
        options={circleOptions}
      />
      {selected ? (
        <InfoWindow
          position={{ lat: parseFloat(selected.latitude) + 0.0025, lng: parseFloat(selected.longitude) }}
          onCloseClick={() => {
            setSelected(null);
          }}
        >
          <div>
            <h2>
              <span role="img" aria-label="bear">
                <img src={MpStoreLocatorConfig.markerIcon} />
              </span>{" "}
              {selected.name}
            </h2>
            <p>
              {selected.street}
              {selected.state_province}
              {selected.city}
              {selected.country}
            </p>
            <p>Open at {timeStore}</p>
            {/* <p>Open at: {formatRelative(new Date(), new Date())}</p> */}
            <p>{selected.website}</p>
          </div>
        </InfoWindow>
      ) : null}
    </GoogleMap>
  ) : <></>
}

export default React.memo(Map)