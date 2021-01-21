/**
 * Mappings for overwrites
 * example: [`@magento/venia-ui/lib/components/Main/main.js`]: './lib/components/Main/main.js'
 */
module.exports = componentOverride = {
    [`@magento/venia-ui/lib/components/ProductFullDetail/productFullDetail.js`]:'@simicart/storelocator/src/overwrites/ProductFullDetail/productFullDetail.js',
    [`@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail.js`]:'@simicart/storelocator/src/overwrites/ProductFullDetail/useProductFullDetail.js',
    [`@magento/venia-ui/lib/components/ProductFullDetail/productFullDetail.gql.js`]:'@simicart/storelocator/src/overwrites/ProductFullDetail/productFullDetail.gql.js',
    [`@magento/venia-ui/lib/RootComponents/Product/product.gql.js`]:'@simicart/storelocator/src/overwrites/ProductFullDetail/product.gql.js'
};
