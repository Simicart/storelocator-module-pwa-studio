/**
 * Mappings for overwrites
 * example: [`@magento/venia-ui/lib/components/Main/main.js`]: './lib/components/Main/main.js'
 */
module.exports = componentOverride = {
    [`@magento/venia-ui/lib/components/CheckoutPage/ShippingMethod/shippingMethod.js`]: '@simicart/store_locator/src/override/CheckoutPage/ShippingMethod.js',
    [`@magento/venia-ui/lib/components/CheckoutPage/checkoutPage.js`]: '@simicart/store_locator/src/override/CheckoutPage/CheckoutPage.js'
};
