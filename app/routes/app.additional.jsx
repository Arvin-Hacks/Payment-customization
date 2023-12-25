import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";
import prisma from "~/db.server";
import { authenticate } from "~/shopify.server";

export const loader = async ({ request }) => {

  const { admin, session } = await authenticate.admin(request)

//   let shops = (await admin.rest.resources.Shop.all({ session })).data[0]

//   const data = {
//     name: shops.name,
//     email: shops.email,
//     access_token: session.accessToken,
//     access_scope: session.scope,
//     shop: session.shop,
//     domain: shops.domain,
//     country_name: shops.country,
//     country_code: shops.country_code,
//     timestamp: shops.timezone,
//     customer_email: shops.customer_email,
//     DomainsPaths: shops.domain,
//     money_format: shops.money_format,
//     zip: shops.zip,
//     city: shops.city,
//     phone: shops.phone,
//     currency: shops.currency,
//     shop_owner: shops.shop_owner,
//     app_status: "Installed",
//   }
// console.log('asdsd',data)
//   try {
//     const Db_response = await prisma.shop.upsert({
//       where: {
//         shop: data.shop
//       },
//       create: data,
//       update: data,
//     })
//     console.log('fd', Db_response)
//   } catch (error) {
//     console.warn('erer',error)
//   }

  return null
};




export default function AdditionalPage() {
  return (
    <Page title="Additional PAGE">
      <Card>
        <Text as='h3'>Additional page info</Text>
      </Card>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}
