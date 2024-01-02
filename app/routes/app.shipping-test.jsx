import { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useForm, useField } from "@shopify/react-form";
import { ResourcePicker, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { CurrencyCode } from "@shopify/react-i18n";



import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  ActiveDatesCard,
  CombinationCard,
  DiscountClass,
  DiscountMethod,
  MethodCard,
  DiscountStatus,
  RequirementType,
  SummaryCard,
  UsageLimitsCard,
  onBreadcrumbAction,

} from "@shopify/discount-app-components";
import {
  Banner,
  Card,
  Text,
  Layout,
  Page,
  PageActions,
  TextField,
  List,
  Button,
  Tag
} from "@shopify/polaris";



import shopify from "../shopify.server";
import ComboBoxComponent from "~/Component/ComboBoxComponent";
import { GetProductTagsList } from '../api/api.sever'

export const loader = async ({ request }) => {
  const { admin, session } = await shopify.authenticate.admin(request)

  try {

    const Customerdata = await admin.rest.resources.Customer.all({ session, fields: ['first_name', 'last_name', 'tags', 'admin_graphql_api_id'] })
    const productTags = await GetProductTagsList(admin, session)

    // @ts-ignore
    return json({ customers: Customerdata.data, productTags: productTags })
  } catch (error) {
    console.log('result', error)
    return null
  }
};

// This is a server-side action that is invoked when the form is submitted.
// It makes an admin GraphQL request to create a discount.
export const action = async ({ request }) => {
  const functionId = '1efb682e-e9b8-45e2-832d-8c48a79f7405';
  const { admin } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const {
    title,
    method,
    code,
    combinesWith,
    usageLimit,
    appliesOncePerCustomer,
    startsAt,
    endsAt,
    productTags,
    configuration,
  } = JSON.parse(formData.get("discount"));

  const baseDiscount = {
    functionId,
    title: `${configuration.percentage}% off on purchase over Rs. ${configuration.minimunSubtotal}`,
    combinesWith,
    startsAt: new Date(startsAt),
    endsAt: endsAt && new Date(endsAt),
  };

  console.log('basediscount', baseDiscount, configuration, productTags)

  // return null

  if (method === DiscountMethod.Code) {
    const baseCodeDiscount = {
      ...baseDiscount,
      title: code,
      code,
      usageLimit,
      appliesOncePerCustomer,
    };


    const response = await admin.graphql(
      `#graphql
          mutation CreateCodeDiscount($discount: DiscountCodeAppInput!) {
            discountCreate: discountCodeAppCreate(codeAppDiscount: $discount) {
              codeAppDiscount{
                title
                startsAt    
                discountClass
              }
              userErrors {
                code
                message
                field
              }
            }
          }`,
      {
        variables: {
          discount: {
            ...baseCodeDiscount,
            metafields: [
              {
                namespace: "$app:shipping-discount-logistics",
                key: "function-configuration-logistics",
                type: "json",
                value: JSON.stringify({
                  quantity: configuration.quantity,
                  percentage: configuration.percentage,
                  minimunSubtotal: configuration.minimunSubtotal,
                  customerIds: configuration.customerIds,
                  variantIds: configuration.variantIds,
                }),
              },
              {
                namespace: "$app:product-tags",
                key: "product-tags",
                type: "json",
                value: JSON.stringify({
                  productTags: productTags,
                  customerTags: ['VIP'],
                  collectionIds: configuration.collectionIds
                })
              }
            ],
          },
        },
      }
    );

    const responseJson = await response.json();

    console.log('responseJson', responseJson)

    const errors = responseJson.data.discountCreate?.userErrors;
    return json({ errors });
  } else {
    const response = await admin.graphql(
      `#graphql
          mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
            discountCreate: discountAutomaticAppCreate(automaticAppDiscount: $discount) {
             automaticAppDiscount{
              title
              startsAt
              status     
              discountClass         
             }
             userErrors {
                code
                message
                field
              }
            }
          }`,
      {
        variables: {
          discount: {
            ...baseDiscount,

            metafields: [
              {
                namespace: "$app:shipping-discount-logistics",
                key: "function-configuration-logistics",
                type: "json",
                value: JSON.stringify({
                  quantity: configuration.quantity,
                  minimunSubtotal: configuration.minimunSubtotal,
                  percentage: configuration.percentage,
                  customerIds: configuration.customerIds,
                  variantIds: configuration.variantIds

                }),
              },
              {
                namespace: "$app:product-tags",
                key: "product-tags",
                type: "json",
                value: JSON.stringify({
                  productTags: productTags,
                  customerTags: ['VIP'],
                  collectionIds: configuration.collectionIds
                })
              },
            ],
          },
        },
      }
    );

    const responseJson = await response.json();
    console.log('responseJson', responseJson)

    const errors = responseJson.data.discountCreate?.userErrors;
    return json({ errors });
  }

};

// This is the React component for the page.
export default function VolumeNew() {
  const { customers, productTags } = useLoaderData()
  // console.warn('customerrrr', customers)
  const submitForm = useSubmit();
  const actionData = useActionData();
  const navigation = useNavigation();
  const app = useAppBridge();
  const todaysDate = useMemo(() => new Date(), []);

  const isLoading = navigation.state === "submitting";
  const currencyCode = CurrencyCode.Cad;
  const submitErrors = actionData?.errors || [];
  const redirect = Redirect.create(app);

  useEffect(() => {
    if (actionData?.errors.length === 0) {
      redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
        name: Redirect.ResourceType.Discount,
      });
    }
  }, [actionData]);

  const {
    fields: {
      discountTitle,
      discountCode,
      discountMethod,
      combinesWith,
      requirementType,
      requirementSubtotal,
      requirementQuantity,
      usageLimit,
      appliesOncePerCustomer,
      startDate,
      endDate,
      configuration,
    },
    submit,
  } = useForm({
    fields: {
      discountTitle: useField(""),
      discountMethod: useField(DiscountMethod.Code),
      discountCode: useField(""),
      combinesWith: useField({
        orderDiscounts: false,
        productDiscounts: false,
        shippingDiscounts: false,
      }),
      requirementType: useField(RequirementType.None),
      requirementSubtotal: useField("0"),
      requirementQuantity: useField("0"),
      usageLimit: useField(null),
      appliesOncePerCustomer: useField(false),
      startDate: useField(todaysDate),
      endDate: useField(null),
      configuration: {
        quantity: useField("0"),
        percentage: useField("0"),
        minimunSubtotal: useField("1000"),

      },
    },
    onSubmit: async (form) => {
      const discount = {
        title: form.discountTitle,
        method: form.discountMethod,
        code: form.discountCode,
        combinesWith: form.combinesWith,
        usageLimit: form.usageLimit == null ? null : parseInt(form.usageLimit),
        appliesOncePerCustomer: form.appliesOncePerCustomer,
        startsAt: form.startDate,
        endsAt: form.endDate,
        productTags: selectedProductTags,
        configuration: {
          quantity: parseInt(form.configuration.quantity),
          percentage: parseFloat(form.configuration.percentage),
          minimunSubtotal: parseFloat(form.configuration.minimunSubtotal),
          customerIds: selectedCustomer,
          variantIds: selectedProduct,
          collectionIds: selectedCollection
        },
      };
      submitForm({ discount: JSON.stringify(discount) }, { method: "post" });

      return { status: "success" };
    },
  });



  const errorBanner =
    submitErrors.length > 0 ? (
      <Layout.Section>
        <Banner status="critical">
          <p>There were some issues with your form submission:</p>
          <ul>
            {submitErrors.map(({ message, field }, index) => {
              return (
                <li key={`${message}${index}`}>
                  {field.join(".")} {message}
                </li>
              );
            })}
          </ul>
        </Banner>
      </Layout.Section>
    ) : null;

  const customerOption = customers.map((customer) => ({
    label: customer.first_name + ' ' + customer.last_name,
    value: customer.admin_graphql_api_id
  }))
  const customerTagsOption = [...new Set(customers.map(({ tags }) => tags).filter(tag => tag !== ""))].map((tag) => ({ label: tag, value: tag }))
  console.warn("customerTagsOption", customerTagsOption)


  const [selectedCustomer, setSelectCustomer] = useState([])

  const updateCustomerselection = (selected) => {

    // @ts-ignore
    if (selectedCustomer.includes(selected)) {
      setSelectCustomer(
        selectedCustomer.filter((option) => option !== selected),
      );
    } else {
      // @ts-ignore
      setSelectCustomer([...selectedCustomer, selected]);
    }

  }
  const [selectedCustomertags, setSelectCustomertags] = useState([])

  const updateCustomerTagselection = (selected) => {

    // @ts-ignore
    if (selectedCustomertags.includes(selected)) {
      setSelectCustomertags(
        selectedCustomertags.filter((option) => option !== selected),
      );
    } else {
      // @ts-ignore
      setSelectCustomertags([...selectedCustomertags, selected]);
    }

  }





  const updateproducttagsSelection = (selected) => {

    // @ts-ignore
    if (selectedProductTags.includes(selected)) {
      setProductTags(
        selectedProductTags.filter((option) => option !== selected),
      );
    } else {
      // @ts-ignore
      setProductTags([...selectedProductTags, selected]);
    }

  }

  // Handle Product Picker start
  const [openProductPicker, setOpenProductPicker] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState([])
  const [selectedProductposition, setSelectedProductposition] = useState([])


  const handleSelectionProductPicker = (resources) => {

    console.warn("BuyPicke resources product ", resources);

    console.warn('new selection', resources.selection)

    setSelectedProduct(resources.selection.map(({ id }) => id))
    setSelectedProductposition(resources.selection.map(({ position }) => position))

    // const productId=resources.selection[0].id
    console.info('productId', selectedProduct)

    setOpenProductPicker(false)
  }  // Handle Product Picker end

  // handle collection picker
  const [openCollectionPicker, setOpenCollectionPicker] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState([])
  // const [selectedProductposition, setSelectedProductposition] = useState([])

  const handleSelectionCollectionPicker = (resources) => {

    console.warn("BuyPicke resources product ", resources);

    console.warn('new selection', resources.selection)

    setSelectedCollection(resources.selection.map(({ id }) => id))
    // setSelectedProductposition(resources.selection.map(({ position }) => position))

    // const productId=resources.selection[0].id
    console.info('productId', selectedCollection)

    setOpenCollectionPicker(false)
  }  // Handle Collection Picker end

  const [selectedProductTags, setProductTags] = useState([])
  return (
    // Render a discount form using Polaris components and the discount app components
    <Page
      title="Create volume discount"
      backAction={{
        content: "Discounts",
        onAction: () => onBreadcrumbAction(redirect, true),
      }}
      primaryAction={{
        content: "Save",
        onAction: submit,
        loading: isLoading,
      }}
    >
      <Layout>
        {errorBanner}
        <Layout.Section>
          <Form method="post">
            <MethodCard
              title="Volume"
              discountTitle={discountTitle}
              discountClass={DiscountClass.Product}
              discountCode={discountCode}
              discountMethod={discountMethod}
            />
            <Card >
              <Text variant="headingMd" as="h2">
                Volume
              </Text>
              <TextField
                label="Minimum quantity"
                autoComplete="on"
                {...configuration.quantity}
              />
              <TextField
                label="Minimum SubTotal"
                autoComplete="on"
                {...configuration.minimunSubtotal}
              />
              <TextField
                label="Discount percentage"
                autoComplete="on"
                {...configuration.percentage}
                suffix="%"
              />
            </Card>
            <br />
            <Card>
              <Text variant="headingMd" as="h2">
                Selected Customer
              </Text>
              <ComboBoxComponent
                optiondata={customerOption}
                label='Select Customer'
                selected={selectedCustomer}
                onChange={updateCustomerselection}

              />
              <List >
                {selectedCustomer ?
                  selectedCustomer.map((customer) => (
                    <List.Item>{customer}</List.Item>

                  ))
                  : <List.Item>No customer Selected</List.Item>
                }
              </List>
              <br />
              <Text variant="bodyMd">
                Selecte Customer Tags
              </Text>
              <ComboBoxComponent
                optiondata={customerTagsOption}
                label='Select Customer tag'
                selected={selectedCustomertags}
                onChange={updateCustomerTagselection}

              />
              <List gap="100">
                {selectedCustomertags ?
                  selectedCustomertags.map((tags,index) => (
                    <Tag key={index}  onRemove={selectedCustomertags.splice(index,1)}>{tags}</Tag>
                  ))
                  : <List.Item>No customer tag Selected</List.Item>
                }
              </List>


            </Card>
            <br />
            <Card>
              <TextField
                label="Products"
                placeholder="Select Product"
                onFocus={() => setOpenProductPicker(true)}

              />
              <ResourcePicker
                open={openProductPicker}
                resourceType="ProductVariant"
                selectMultiple
                // initialSelectionIds={selectedProductposition}
                onSelection={handleSelectionProductPicker}
                onCancel={() => setOpenProductPicker(false)}

              />
              <Button onClick={() => console.warn('idsssdsdsdsdsd', selectedProduct)}>Test</Button>
              {/* <List >
                {selectedProduct ?
                  selectedProduct.map((customer) => (
                    <List.Item>{customer}</List.Item>

                  ))
                  : <List.Item>No customer Selected</List.Item>
                }
              </List> */}
              <br></br>
              <TextField
                label="Product Collection"
                placeholder="Select collection"
                onFocus={() => setOpenCollectionPicker(true)}

              />
              <ResourcePicker
                open={openCollectionPicker}
                resourceType="Collection"
                selectMultiple
                // initialSelectionIds={selectedProductposition}
                onSelection={handleSelectionCollectionPicker}
                onCancel={() => setOpenCollectionPicker(false)}

              />
              <List >
                {selectedCollection ?
                  selectedCollection.map((collection) => (
                    <List.Item>{collection}</List.Item>

                  ))
                  : <List.Item>No Collection Selected</List.Item>
                }
              </List>
              {/* <Button onClick={() => console.warn('idsssdsdsdsdsd', selectedCollection)}>Test</Button> */}





            </Card>

            <br />
            <Card>
              <Text variant="headingMd" as="h2">
                Product Tags
              </Text>
              <ComboBoxComponent
                optiondata={productTags.map((tag) => ({ label: tag, value: tag }))}
                label='Select Product Tags'
                selected={selectedProductTags}
                onChange={updateproducttagsSelection}
              />

              <br />
              {selectedProductTags ?
                selectedProductTags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>

                ))
                : null
              }

            </Card>
            <br />
            {discountMethod.value === DiscountMethod.Code && (
              <UsageLimitsCard
                totalUsageLimit={usageLimit}
                oncePerCustomer={appliesOncePerCustomer}
              />
            )}
            <CombinationCard
              combinableDiscountTypes={combinesWith}
              discountClass={DiscountClass.Product}
              discountDescriptor={"Discount"}
            />
            <ActiveDatesCard
              startDate={startDate}
              endDate={endDate}
              timezoneAbbreviation="EST"
            />
          </Form>
        </Layout.Section>


        <Layout.Section secondary >
          <SummaryCard
            header={{
              discountMethod: discountMethod.value,
              discountDescriptor:
                discountMethod.value === DiscountMethod.Automatic
                  ? discountTitle.value
                  : discountCode.value,
              appDiscountType: "Volume",
              isEditing: false,
            }}
            performance={{
              status: DiscountStatus.Scheduled,
              usageCount: 0,
              isEditing: false,
            }}
            minimumRequirements={{
              requirementType: requirementType.value,
              subtotal: requirementSubtotal.value,
              quantity: requirementQuantity.value,
              currencyCode: currencyCode,
            }}
            usageLimits={{
              oncePerCustomer: appliesOncePerCustomer.value,
              totalUsageLimit: usageLimit.value,
            }}
            activeDates={{
              startDate: startDate.value,
              endDate: endDate.value,
            }}
            
          />
        </Layout.Section>
        <Layout.Section>

          <PageActions
            primaryAction={{
              content: "Save discount",
              onAction: submit,
              loading: isLoading,
            }}
            secondaryActions={[
              {
                content: "Discard",
                onAction: () => onBreadcrumbAction(redirect, true),
              },
            ]}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
