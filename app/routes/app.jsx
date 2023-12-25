import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useNavigate, useRouteError } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as DiscountAppProvider } from '@shopify/discount-app-components'
import { Provider as AppBridgeReactProvider } from "@shopify/app-bridge-react";

import { authenticate } from "../shopify.server";
import { Button, LegacyCard, Tabs } from "@shopify/polaris";
import { useCallback, useState } from "react";
// import Appcss from '../../app.css'

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export async function loader({ request }) {
  const { session, admin } = await authenticate.admin(request);
  const response = await admin.rest.resources.Shop.all({ session: session })


  const url = new URL(request.url);

  return json({
    apiKey: process.env.SHOPIFY_API_KEY,
    host: url.searchParams.get("host"),
  })

}


export default function App() {
  const { apiKey, host } = useLoaderData();
  const [config] = useState({ host, apiKey });
  const Navigate = useNavigate()


  const tabs = [

    {
      id: 'Products',
      content: <Link to={'/app'} style={{ textDecoration: "none", color: '#000000' }}>Products</Link>,
      panelID: 'Products',
    },
    {
      id: 'Hide payment',
      content: <Link to={'/app/hidepayment'} style={{ textDecoration: "none", color: '#000000' }}>Hide payment</Link>,
      panelID: 'Orders-1',
      action: console.log('order')
    },
    {
      id: 'Customers',
      content: <Link to={'/app'} style={{ textDecoration: "none", color: '#000000' }}>Customers</Link>,
      panelID: 'Customers-1',
      // action:Navigate('/app/customer')
    },
  ];

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );
  const [selected, setSelected] = useState(0);


  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <AppBridgeReactProvider config={config}>
        <DiscountAppProvider locale="en-US" ianaTimezone="America/New_York">
          <ui-nav-menu>
            <Link to="/app" rel="home">
              Home
            </Link>
            <Link to="/app/additional">Additional page</Link>
            <Link to="/app/shipping-test">Shipping Discount</Link>
            <Link to="/app/paymentCustomization">Payment Customization</Link>
            {/* <Link to="/app/customer">Customer page</Link>
            <Link to="/app/order">Orders page</Link>
            <Link to="/app/addCustomer"> Add Customer</Link> */}
          </ui-nav-menu>

          <Tabs
            // @ts-ignore
            tabs={tabs} selected={selected} onSelect={handleTabChange}>

          </Tabs>


          <Outlet />
        </DiscountAppProvider>
      </AppBridgeReactProvider>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
