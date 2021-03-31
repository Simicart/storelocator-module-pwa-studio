import {useCallback, useEffect, useMemo, useState} from 'react';
import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';

import {useCartContext} from '@magento/peregrine/lib/context/cart';
import {useUserContext} from '@magento/peregrine/lib/context/user';

const saveStoreLocationMutation = gql`
mutation($id: String, $time: String) {
  SaveLocationMpStoreLocator(
    input: { locationId: $id, timePickup: $time }
  )
}
`
export const displayStates = {
    DONE: 'done',
    EDITING: 'editing',
    INITIALIZING: 'initializing'
};

const serializeShippingMethod = method => {
    if (!method) return '';

    const {carrier_code, method_code} = method;

    return `${carrier_code}|${method_code}`;
};

const deserializeShippingMethod = serializedValue => {
    return serializedValue.split('|');
};

// Sorts available shipping methods by price.
const byPrice = (a, b) => a.amount.value - b.amount.value;

// Adds a serialized property to shipping method objects
// so they can be selected in the radio group.
const addSerializedProperty = shippingMethod => {
    if (!shippingMethod) return shippingMethod;

    const serializedValue = serializeShippingMethod(shippingMethod);

    return {
        ...shippingMethod,
        serializedValue
    };
};

const DEFAULT_SELECTED_SHIPPING_METHOD = null;
const DEFAULT_AVAILABLE_SHIPPING_METHODS = [];

export const useShippingMethod = props => {
    const {
        onSave,
        mutations: {setShippingMethod},
        queries: {getSelectedAndAvailableShippingMethods},
        setPageIsUpdating
    } = props;

    const [{cartId}] = useCartContext();
    const [{isSignedIn}] = useUserContext();

    /*
     *  Apollo Hooks.
     */
    const [
        setShippingMethodCall,
        {error: setShippingMethodError, loading: isSettingShippingMethod}
    ] = useMutation(setShippingMethod);

    const {data, loading: isLoadingShippingMethods, refetch} = useQuery(
        getSelectedAndAvailableShippingMethods,
        {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'no-cache', //TODO: report bug
            skip: !cartId,
            variables: {cartId}
        }
    );

    const [
        saveLocation,
        {
            data: saveLocationData,
            loading: saveLocationLoading,
            error: saveLocationError
        }
    ] = useMutation(saveStoreLocationMutation, {})

    /*
     *  State / Derived state.
     */
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [isSelectingStorePickup, setSelectingStorePickup] = useState(false)
    const [storePickupAddress, setStorePickupAddress] = useState(null)
    const [storePickupDate, setStorePickupDate] = useState(null)
    const [storePickupTime, setStorePickupTime] = useState(null)


    const hasData =
        data &&
        data.cart.shipping_addresses.length &&
        data.cart.shipping_addresses[0].selected_shipping_method;

    const derivedPrimaryShippingAddress =
        data &&
        data.cart.shipping_addresses &&
        data.cart.shipping_addresses.length
            ? data.cart.shipping_addresses[0]
            : null;

    const derivedSelectedShippingMethod = derivedPrimaryShippingAddress
        ? addSerializedProperty(
            derivedPrimaryShippingAddress.selected_shipping_method
        )
        : DEFAULT_SELECTED_SHIPPING_METHOD;

    const derivedShippingMethods = useMemo(() => {
        if (!derivedPrimaryShippingAddress)
            return DEFAULT_AVAILABLE_SHIPPING_METHODS;

        // Shape the list of available shipping methods.
        // Sort them by price and add a serialized property to each.
        const rawShippingMethods =
            derivedPrimaryShippingAddress.available_shipping_methods;
        const shippingMethodsByPrice = [...rawShippingMethods].sort(byPrice);
        const result = shippingMethodsByPrice.map(addSerializedProperty);

        return result;
    }, [derivedPrimaryShippingAddress]);

    // Determine the component's display state.
    const isBackgroundAutoSelecting =
        isSignedIn &&
        !derivedSelectedShippingMethod &&
        Boolean(derivedShippingMethods.length);
    const displayState = derivedSelectedShippingMethod
        ? displayStates.DONE
        : isLoadingShippingMethods ||
        (isSettingShippingMethod && isBackgroundAutoSelecting)
            ? displayStates.INITIALIZING
            : displayStates.EDITING;

    /*
     *  Callbacks.
     */
    const handleSubmit = useCallback(
        async value => {
            const [carrierCode, methodCode] = deserializeShippingMethod(
                value.shipping_method
            );

            try {
                await setShippingMethodCall({
                    variables: {
                        cartId,
                        shippingMethod: {
                            carrier_code: carrierCode,
                            method_code: methodCode
                        }
                    }
                });
                // await refetch();
            } catch (e) {
                return;
            }

            setIsUpdateMode(false);
        },
        [cartId, setIsUpdateMode, setShippingMethodCall]
    );

    const handleCancelUpdate = useCallback(() => {
        setIsUpdateMode(false);
    }, []);

    const showUpdateMode = useCallback(() => {
        setIsUpdateMode(true);
    }, []);


    const shouldShowStorePickupText = (
        !!derivedSelectedShippingMethod
        && derivedSelectedShippingMethod.method_code === 'mpstorepickup'
    )

    const showStorePickupMode = useCallback(() => {
        setStorePickupAddress(null)
        setStorePickupDate(null)
        setStorePickupTime(null)
        setSelectingStorePickup(true)
    }, [setSelectingStorePickup, setStorePickupAddress, setStorePickupDate, setStorePickupTime])

    const cancelShowStorePickup = useCallback(() => {

        setSelectingStorePickup(false)
    }, [setSelectingStorePickup])

    const submitStorePickup = useCallback(async (store) => {
        const {address, date, id, time} = store || {}


        return saveLocation({
            variables: {
                id: id.toString(),
                // id: '2',
                // date: '03/31/2021,+14:00-15:00'
                date: date.toString() + ', ' + time.toString()
            }
        }).then(x => {
            setStorePickupAddress(address)
            setStorePickupDate(date)
            setStorePickupTime(time)
            cancelShowStorePickup();
        }).catch(err => {
            console.warn(err)
        })

    }, [cancelShowStorePickup])

    /*
     *  Effects.
     */

    // When we have data we should tell the checkout page
    // so that it can set the step correctly.
    useEffect(() => {
        if (hasData) {
            onSave();
        }
    }, [hasData, onSave]);

    useEffect(() => {
        setPageIsUpdating(isSettingShippingMethod);
    }, [isLoadingShippingMethods, isSettingShippingMethod, setPageIsUpdating]);

    // If an authenticated user does not have a preferred shipping method,
    // auto-select the least expensive one for them.
    useEffect(() => {
        if (!data) return;
        if (!cartId) return;
        if (!isSignedIn) return;

        if (!derivedSelectedShippingMethod) {
            // The shipping methods are sorted by price.
            const leastExpensiveShippingMethod = derivedShippingMethods[0];

            if (leastExpensiveShippingMethod) {
                const {
                    carrier_code,
                    method_code
                } = leastExpensiveShippingMethod;

                setShippingMethodCall({
                    variables: {
                        cartId,
                        shippingMethod: {
                            carrier_code,
                            method_code
                        }
                    }
                });
            }
        }
    }, [
        cartId,
        data,
        derivedSelectedShippingMethod,
        derivedShippingMethods,
        isSignedIn,
        setShippingMethodCall
    ]);

    const errors = useMemo(
        () => new Map([['setShippingMethod', setShippingMethodError]]),
        [setShippingMethodError]
    );

    return {
        displayState,
        errors,
        handleCancelUpdate,
        handleSubmit,
        isLoading: isLoadingShippingMethods || isSettingShippingMethod,
        isUpdateMode,
        selectedShippingMethod: derivedSelectedShippingMethod,
        shippingMethods: derivedShippingMethods,
        showUpdateMode,
        shouldShowStorePickupText: shouldShowStorePickupText,
        isSelectingStorePickup: isSelectingStorePickup,
        showStorePickupMode: showStorePickupMode,
        cancelShowStorePickup: cancelShowStorePickup,
        submitStorePickup: submitStorePickup,
        saveLocationLoading: saveLocationLoading,
        saveLocationError: saveLocationError,
        storePickupAddress: storePickupAddress,
        storePickupDate: storePickupDate,
        storePickupTime: storePickupTime
    };
};
