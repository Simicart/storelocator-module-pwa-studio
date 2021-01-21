import { gql } from '@apollo/client';

export const GET_STORELOCATOR_CONFIG = gql`
query MpStoreLocatorConfig{
  MpStoreLocatorConfig{
    distance_unit
    custom_style
    style
    filter_radius
    zoom
    markerIcon
    isFilter
    isFilterRadius
    locationIdDetail
    urlSuffix
    keyMap
    router
    isDefaultStore
    defaultLat
    defaultLng
  locationsData{
      locationId
      timeData{
    from
    to
    use_system_config
    value
    __typename
  }
}
  }

}
`

export const GET_MP_STORELOCATOR_LOCATIONS = gql`
query MpStoreLocatorLocations{
  MpStoreLocatorLocations{
    total_count
    items{
      city
      country
      created_at
      description
      email
      fax
      images
      is_config_time_zone
      is_config_website
      is_default_store
      is_selected_all_product
      is_show_product_page
      latitude
      longitude
      location_id
      name
      phone_one
      phone_two
      postal_code
      product_ids
      sort_order
      street
      time_zone
      state_province
      status
      store_ids
      updated_at
      url_key
      website
      __typename
    }
  }
}
`;
export const GET_STORELOCATOR_LOCATION_BY_NAME = gql`
query MpStoreLocatorLocations($name:String!){
  MpStoreLocatorLocations(filter:{name:{like:$name}}){
    total_count
    items{
      
      city
      country
      description
      images
      is_config_time_zone
      is_config_website
      is_default_store
      is_selected_all_product
      is_show_product_page
      latitude
      longitude
      location_id
      name
      phone_one
      phone_two
      postal_code
      product_ids
      sort_order
      street
      time_zone
      state_province
      status
      store_ids
      updated_at
      url_key
      website
      __typename
    }
  }
}
`;