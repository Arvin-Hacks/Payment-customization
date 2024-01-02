// @ts-check

// Use JSDoc annotations for type safety
/**
* @typedef {import("../generated/api").RunInput} RunInput
* @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
*/

/**
* @type {FunctionRunResult}
*/
const NO_CHANGES = {
  operations: [],
};

// The configured entrypoint for the 'purchase.payment-customization.run' extension target
/**
* @param {RunInput} input
* @returns {FunctionRunResult}
*/
export function run(input) {

  const configuration = JSON.parse(input.paymentCustomization.metafield?.value ?? "{}")

  const Config_paymentMethod_order = [
    {
      index: 0,
      name: "Bank Deposit"
    },
    // {
    //   // index: 1,
    //   name: "Cash on Delivery (COD)"
    // },
    {
      index: 1,
      name: "Money Order"
    },
    {
      index: 2,
      name: "(for testing) Bogus Gateway"
    },
  ]
  const Config_paymentMethod_rename = [
    {
      rename: 'new Bank Deposit ',
      name: "Bank Deposit"
    },
    // {
    //   // index: 1,
    //   name: "Cash on Delivery (COD)"
    // },
    {
      rename: "New Money Order",
      name: "Money Order"
    },
    {
      rename: "New (for testing) Bogus Gateway",
      name: "(for testing) Bogus Gateway"
    },
  ]

  // Get the cart total from the function input, and return early if it's below 100
  const cartTotal = parseFloat(input.cart.cost.totalAmount.amount ?? "0.0");
  if (cartTotal < 1000) {
    // You can use STDERR for debug logs in your function
    console.error("Cart total is not high enough, no need to hide the payment method.");
    return NO_CHANGES;
  }

  // console.error('input ', JSON.stringify(input))

  console.error('config', JSON.stringify(configuration))

  //Hide Payment method Option 
  const configurationhidedata = ["Gift card", "(for testing) Bogus Gateway"]

  const hidePaymentMethod = configuration?.hidePaymentmethod ?
    input.paymentMethods.filter(paymentMethod => configuration?.hidePaymentmethod.includes(paymentMethod.name)).map(({ id }) => ({ hide: { paymentMethodId: id } })) : {}


  //Reorder Payment Option
  const reorderPaymentMethods = GetReordereddata(input.paymentMethods, configuration.reorderPaymentmethod)

  console.error('reorderPaymentMethods',JSON.stringify(reorderPaymentMethods))

  // Rename payment Method 

  const renamedPaymentmethods = RenamePaymentMethod(input.paymentMethods, configuration.renamedPaymentmethod)
  console.error('renamedPaymentmethods',renamedPaymentmethods)

  const finaloperationsdata = renamedPaymentmethods.concat(hidePaymentMethod,reorderPaymentMethods)
  
  console.error('final data', JSON.stringify(finaloperationsdata))
  console.error('test')
  // Find the payment method to hide
  // const hidePaymentMethod = input.paymentMethods
  //   .find(method => method.name.includes("Cash on Delivery"));

  // if (!hidePaymentMethod) {
  //   return NO_CHANGES;
  // } 

  // The @shopify/shopify_function package applies JSON.stringify() to your function result
  // and writes it to STDOUT
  return {
    operations: finaloperationsdata
    // [{
    //   hide: {
    //     paymentMethodId: "gid://shopify/PaymentCustomizationPaymentMethod/4"
    //   },      
    // },

      // {
      //   move: {
      //     index: 1,
      //     paymentMethodId: 'gid://shopify/PaymentCustomizationPaymentMethod/1'
      //   }
      // },
      // {
      //   move: {
      //     index: 0,
      //     paymentMethodId: 'gid://shopify/PaymentCustomizationPaymentMethod/4'
      //   }
      // },
      // {
      //   move: {
      //     index: 2,
      //     paymentMethodId: 'gid://shopify/PaymentCustomizationPaymentMethod/5'
      //   }
      // }
    // ]
  };
};




const GetReordereddata = (input, config) => {
  if (config) {
    const paymentMap = input.reduce((acc, cur) => {
      acc[cur.name] = { id: cur.id };
      return acc;
    }, {});

    // Iterate through paymentMethod_order to get the associated id and index

    const result = config.map((method) => {
      const paymentData = paymentMap[method.name];
      return {
        move: {
          index: method.index,
          paymentMethodId: paymentData ? paymentData.id : null,
        }
      };
    });

    return result
  }
  return []
}


const RenamePaymentMethod = (payment, config) => {
  if (config) {
    const renamedPayment = payment
      .filter(({ name }) => config.some((data) => data.name === name))
      .map(({ id, name }) => {
        const renamedData = config.find((data) => data.name === name);
        const renamedName = renamedData ? renamedData.rename : name;

        return {
          rename: {
            paymentMethodId: id,
            name: renamedName,
          }
        };
      })
    return renamedPayment
  }
  return []
}


//Request to hide a payment method.
// type HideOperation = {
//   paymentMethodId: Scalars['ID'];
// }


//Request to move a payment method to a new index
//type MoveOperation = {
//   index: Scalars['Int'];
//   paymentMethodId: Scalars['ID'];
// }



//Request to rename a payment method.
//
//type RenameOperation = {
//   name: Scalars['String'];
//   paymentMethodId: Scalars['ID'];
// }

const payment =
  [
    {
      "id": "gid://shopify/PaymentCustomizationPaymentMethod/0",
      "name": "Gift card"
    },
    {
      "id": "gid://shopify/PaymentCustomizationPaymentMethod/1",
      "name": "(for testing) Bogus Gateway"
    },
    {
      "id": "gid://shopify/PaymentCustomizationPaymentMethod/2",
      "name": "Deferred"
    },
    {
      "id": "gid://shopify/PaymentCustomizationPaymentMethod/3",
      "name": "Cash on Delivery (COD)"
    },
    {
      "id": "gid://shopify/PaymentCustomizationPaymentMethod/4",
      "name": "Money Order"
    },
    {
      "id": "gid://shopify/PaymentCustomizationPaymentMethod/5",
      "name": "Bank Deposit"
    }
  ]