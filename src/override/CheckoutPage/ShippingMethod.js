import React, {Fragment} from 'react';
import {FormattedMessage} from 'react-intl';
import {bool, func, shape, string} from 'prop-types';
import {Form} from 'informed';

import {
    displayStates,
    useShippingMethod
} from './useShippingMethod.js';

import {mergeClasses} from '@magento/venia-ui/lib/classify';
import Button from '@magento/venia-ui/lib/components/Button';
import FormError from '@magento/venia-ui/lib/components/FormError';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import CompletedView from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/completedView';
import ShippingRadios from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/shippingRadios';
import UpdateModal from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/updateModal';
import defaultClasses from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/shippingMethod.css';

import shippingMethodOperations from '@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/shippingMethod.gql';
import StorePickup from "./StorePickup";

const initializingContents = (
    <LoadingIndicator>
        <FormattedMessage
            id={'shippingMethod.loading'}
            defaultMessage={'Loading shipping methods...'}
        />
    </LoadingIndicator>
);

const ShippingMethod = props => {
    const {onSave, pageIsUpdating, setPageIsUpdating, cartId} = props;

    const talonProps = useShippingMethod({
        onSave,
        setPageIsUpdating,
        ...shippingMethodOperations
    });

    const {
        displayState,
        errors,
        handleCancelUpdate,
        handleSubmit,
        isLoading,
        isUpdateMode,
        selectedShippingMethod,
        shippingMethods,
        showUpdateMode,
        isSelectingStorePickup,
        submitStorePickup,
        showStorePickupMode,
        cancelShowStorePickup,
        shouldShowStorePickupText,
        saveLocationError,
        saveLocationLoading,
        storePickupAddress,
        storePickupDate,
        storePickupTime
    } = talonProps;

    const classes = mergeClasses(defaultClasses, props.classes);

    let contents;

    if (displayState === displayStates.DONE) {
        const updateFormInitialValues = {
            shipping_method: selectedShippingMethod.serializedValue
        };

        contents = (
            <Fragment>
                <div className={classes.done}>
                    <CompletedView
                        selectedShippingMethod={selectedShippingMethod}
                        showUpdateMode={showUpdateMode}
                    />
                    <StorePickup
                        isSelectingStorePickup={isSelectingStorePickup}
                        submitStorePickup={submitStorePickup}
                        showStorePickupMode={showStorePickupMode}
                        cancelShowStorePickup={cancelShowStorePickup}
                        shouldShowStorePickupText={shouldShowStorePickupText}
                        saveLocationLoading={saveLocationLoading}
                        saveLocationError={saveLocationError}
                        storePickupAddress={storePickupAddress}
                        storePickupDate={storePickupDate}
                        cartId={cartId}
                    />
                </div>


                <UpdateModal
                    formErrors={Array.from(errors.values())}
                    formInitialValues={updateFormInitialValues}
                    handleCancel={handleCancelUpdate}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    isOpen={isUpdateMode}
                    pageIsUpdating={pageIsUpdating}
                    shippingMethods={shippingMethods}
                />
            </Fragment>
        );
    } else {
        // We're either initializing or editing.
        let bodyContents = initializingContents;

        if (displayState === displayStates.EDITING) {
            const lowestCostShippingMethodSerializedValue = shippingMethods.length
                ? shippingMethods[0].serializedValue
                : '';
            const lowestCostShippingMethod = {
                shipping_method: lowestCostShippingMethodSerializedValue
            };

            bodyContents = (
                <Form
                    className={classes.form}
                    initialValues={lowestCostShippingMethod}
                    onSubmit={handleSubmit}
                >
                    <ShippingRadios
                        disabled={pageIsUpdating || isLoading}
                        shippingMethods={shippingMethods}
                    />
                    <div className={classes.formButtons}>
                        <Button
                            priority="normal"
                            type="submit"
                            disabled={pageIsUpdating || isLoading}
                        >
                            <FormattedMessage
                                id={'shippingMethod.continueToNextStep'}
                                defaultMessage={
                                    'Continue to Payment Information'
                                }
                            />
                        </Button>
                    </div>
                </Form>
            );
        }

        contents = (
            <div className={classes.root}>
                <h3 className={classes.editingHeading}>
                    <FormattedMessage
                        id={'shippingMethod.heading'}
                        defaultMessage={'Shipping Method'}
                    />
                </h3>
                <FormError errors={Array.from(errors.values())}/>
                {bodyContents}
            </div>
        );
    }

    return <Fragment>{contents}</Fragment>;
};

ShippingMethod.propTypes = {
    classes: shape({
        done: string,
        editingHeading: string,
        form: string,
        formButtons: string,
        root: string
    }),
    onSave: func.isRequired,
    pageIsUpdating: bool,
    setPageIsUpdating: func.isRequired
};

export default ShippingMethod;
