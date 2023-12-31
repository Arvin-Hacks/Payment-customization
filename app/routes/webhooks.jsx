import { authenticate } from "../shopify.server";
import db from "../db.server";
import { AddShopInfo } from "~/api/api.sever";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(
    request
  );

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;

    case "SHOP_UPDATE":
      console.log('SHOP_UPDATE_payload ', payload)

      const response = await AddShopInfo(admin, session)
      console.log("SHOP_UPDATE_DB ", response)

      break;

    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
