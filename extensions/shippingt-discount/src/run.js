// @ts-nocheck
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  const targets = input.cart
  const products = input.cart.deliveryGroups[0]
  // @ts-ignore
  const productvariantIds = input.cart.deliveryGroups[0].cartLines.map(({ merchandise }) => merchandise.id)
  const customer = input.cart.buyerIdentity?.customer
  const configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}"
  );

  const subTotal = configuration?.minimunSubtotal || undefined

  // @ts-ignore
  const iscustomerTagFound = customer?.hasTags.length > 1 ? customer.hasAnyTag : true
  const iscustomerFound = configuration?.customerIds ? configuration.customerIds(customer?.id): true

  

  
  
  let hasAnyTag = true
  // @ts-ignore
  for (const cartLine of products.cartLines) {
    // @ts-ignore
    if (cartLine.merchandise.product.hasTags && cartLine.merchandise.product.hasTags.length > 0) {
      // @ts-ignore
      if (cartLine.merchandise.product.hasAnyTag) {
        hasAnyTag = true
        break;
      }
      hasAnyTag = cartLine.merchandise.product.hasAnyTag;
    } else {
      hasAnyTag = false;
    }
  }


  



  const isproductFound = configuration?.variantIds.length > 0 ? hasMatchingProductVariantIds(products.cartLines, configuration?.variantIds) : true
  // const isProductVariantIdMatch = cartLines.some(
  //   (cartLine) => cartLine.merchandise.__typename === "ProductVariant" && cartLine.merchandise.id === targetProductVariantId
  // );
  console.error("hasAnyTag", hasAnyTag)
  console.error("productvariantIds", isproductFound)
  // const isProductTagFound= 


  console.error('json', JSON.stringify(configuration))
  console.error('product ids', JSON.stringify(products))
  console.log('iscustomerTag', iscustomerTagFound)
  // console.error('cart data',JSON.stringify(targets))
  console.error('customer', JSON.stringify(customer))


  // if (targets.cost.subtotalAmount.amount > 5000 || configuration?.customerIds.includes(targets.buyerIdentity?.customer?.id )) {
  if (targets.cost.subtotalAmount.amount > subTotal) {
    
    return {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [
        {
          value: {
            percentage: {
              value: configuration.percentage,
            },
          },
          targets: [
            {
              deliveryGroup: {
                id: "gid://shopify/CartDeliveryGroup/0",
              },
            },
          ],
          message: `${configuration.percentage}% off more than 3 items for prime user`,
          // message: ,
        },
      ],
    };
  }
  return EMPTY_DISCOUNT

}


function hasMatchingProductVariantIds(cartLines, targetIds) {

  for (const cartLine of cartLines) {
    if (targetIds.includes(cartLine.merchandise.id)) {
      return true;
    }
  }
  return false;
}


