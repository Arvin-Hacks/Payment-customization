import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";
import prisma from "./db.server";
import { AddShopInfo } from "./api/api.sever";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    SHOP_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      const response = await AddShopInfo(admin, session)
      console.log("afterAuth_response", response)
      shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;



/// testingsss....

const paymentMethod_order = [
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
const paymentMethod_rename = [
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

const paymentMap = payment.reduce((acc, cur) => {
  acc[cur.name] = { id: cur.id };
  return acc;
}, {});

// Iterate through paymentMethod_order to get the associated id and index
const result = paymentMethod_order.map((method) => {
  const paymentData = paymentMap[method.name];
  return {
    move: {
      index: method.index,
      paymentMethodId: paymentData ? paymentData.id : null,
    }
  };
});

// const hidedata = ["Gift card", "(for testing) Bogus Gateway"]
const hidedata = [""]

const newArray = payment.filter(paymentMethod => hidedata.includes(paymentMethod.name)).map(({ id }) => ({ hide: { id: id } }));

// console.log('ad', result)
console.log('result', newArray)

// console.log('final', result.concat())
// console.log(result)

const renamedPayment = payment
  .filter(({ name }) => paymentMethod_rename.some((data) => data.name === name))
  .map(({ id, name }) => {
    const renamedData = paymentMethod_rename.find((data) => data.name === name);
    const renamedName = renamedData ? renamedData.rename : name;

    return {
      rename: {
        id,
        name: renamedName,
      }
    };
  })

// console.log('final', newArray.concat(renamedPayment))
// console.log(renamedPayment)


const renamedData=[{name: '(for testing) Bogus Gateway', rename: '(for testing) Bogus Gateway b'},{name: 'Gift card', rename: 'Gift card '}]






// console.log('')


const array2 = [
  {
    "index": 0,
    "name": "(for testing) Bogus Gateway"
  },
  {
    "index": 1,
    "name": "Deferred"
  },
  {
    "index": 2,
    "name": "Cash on Delivery (COD)"
  },
  {
    "index": 3,
    "name": "Money Order"
  },
  {
    "index": 4,
    "name": "Bank Deposit"
  }
];

const hasNoDuplicates = array2.every(
  (item, index, arr) => arr.findIndex((el) => el.index === item.index) === index
);

console.log(hasNoDuplicates)