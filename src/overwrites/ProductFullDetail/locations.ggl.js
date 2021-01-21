import { gql } from '@apollo/client';

export const GET_LOCATION_STORE = gql`
query MpStoreLocatorLocations{
  MpStoreLocatorLocations{
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