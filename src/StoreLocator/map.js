import React, { useEffect,useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle, DirectionsRenderer } from '@react-google-maps/api';
import { lightGrey, buleEssence, darkGrey, defaultStyle, midNight } from './mapStyles.js'

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
    isUpdate,
    isGps,
    valueFilterRadius,
    centerGPS,
    handleFilterRadius,
    storeLatLng,
    getDirection,direct
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
  useEffect(
    () => {
      switch (MpStoreLocatorConfig.style) {
        case 'custom':
          setMapStyles(JSON.parse(MpStoreLocatorConfig.custom_style))
        case 'light-grey':
          setMapStyles(lightGrey);
        case 'dark-grey':
          setMapStyles(darkGrey);
        case 'blue-essence':
          setMapStyles(buleEssence);
        case 'mid-night':
          setMapStyles(midNight);
      }

    }, [MpStoreLocatorConfig])

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
useEffect(() => {
  if (storeLatLng && centerGPS) {
    let directions = new window.google.maps.DirectionsService();
    directions.route({
      origin: centerGPS,
      destination: {
        lat: parseFloat(storeLatLng.latitude),
        lng: parseFloat(storeLatLng.longitude)
      },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        getDirection(result)
        
        // console.log(response);
      }else {
        console.error(`Error: ${result}`)
      }
    })
  }

}, [storeLatLng,centerGPS])
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyD-87y9RrPsCJLNDTZ72oiwbaLxqJ0cgjE'
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
  let listStoreFilterRadius = Array();
  let distance;
  const showMarker = valueFilterRadius !== null && markers.map((marker, index) => {
    if (centerGPS) {
      distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(centerGPS.lat, centerGPS.lng), new google.maps.LatLng(marker.latitude, marker.longitude));
    }
    if (valueFilterRadius < distance) {
      return
    } else {
      listStoreFilterRadius.push(marker)
      return <Marker
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
        }}
      />
    }
  })
  handleFilterRadius(listStoreFilterRadius);

  const getTimeStore = (locationId) => {
    const getToday = new Date();
    const today = getToday.getDay();
    let time;
    MpStoreLocatorConfig.locationsData.map((item, index) => {
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




  
  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centerMap.storeCenter ? centerMap.storeCenter : centerMap.defaultCenter}
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
              origin: new window.google.maps.Point(0, 0),
              anchor: new window.google.maps.Point(15, 15),
              scaledSize: new window.google.maps.Size(24, 24),
            }}
            animation={window.google.maps.Animation.DROP}
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
              {selected.street&&selected.street}
              {selected.state_province&&selected.state_province}
              {selected.city&&selected.city}
              {selected.country&&selected.country}
            </p>
            <p>Open at {getTimeStore(selected.location_id)}</p>
            <p>{selected.website&&selected.website}</p>
          </div>
        </InfoWindow>
      ) : null}
      {direct&&<DirectionsRenderer directions={direct} panel={document.getElementById("panel")}/>}
    </GoogleMap>
  ) : <></>
}

export default React.memo(Map)