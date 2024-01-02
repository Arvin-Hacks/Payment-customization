import prisma from "~/db.server"
import { CreateCustomizationPaymentDb, DeleteCustomization, UpadeteCustomizationPaymentDb } from './db-api.server'
import { json } from "@remix-run/node"

export const AddShopInfo = async (admin, session) => {

    let shops = (await admin.rest.resources.Shop.all({ session })).data[0]

    const data = {
        name: shops.name,
        email: shops.email,
        access_token: session.accessToken,
        access_scope: session.scope,
        shop: session.shop,
        domain: shops.domain,
        country_name: shops.country,
        country_code: shops.country_code,
        timestamp: shops.timezone,
        customer_email: shops.customer_email,
        DomainsPaths: shops.domain,
        money_format: shops.money_format,
        zip: shops.zip,
        city: shops.city,
        phone: shops.phone,
        currency: shops.currency,
        shop_owner: shops.shop_owner,
        app_status: "Installed",
    }

    try {
        const Db_response = await prisma.shop.upsert({
            where: {
                shop: data.shop
            },
            create: data,
            update: data,
        })
        // console.log('Db_response', Db_response)
        return Db_response
    } catch (error) {
        // console.warn('erer', error)
        return error
    }

}

export const GetFunctionIdByName = async (admin, apiType) => {


    try {
        const res = await admin.graphql(
            `#graphql
        query ShopifyFunctionsInput($apiType: String!) {shopifyFunctions(apiType:$apiType,first: 10){
            nodes{
                apiType
                id
                title
            }
        }}
        `, {
            variables: {
                apiType: apiType || "payment_customization"
            }
        }
        )

        const data = await res.json()
        console.log('data', data)
        return data?.data?.shopifyFunctions?.nodes[0].id
    } catch (error) {
        console.log('errr', error)
        return ''
    }
}

export const GetProductTagsList = async (admin, session) => {
    const productTags = await admin.rest.resources.Product.all({ session, fields: 'tags' })
    // console.log('asdsdf', productTags.data.map(({data})))

    const uniqueTags = [...new Set(productTags.data.map(product => product.tags.split(',').map(tag => tag.trim())).flat())];

    // Filter out empty tags
    const filteredUniqueTags = uniqueTags.filter(tag => tag !== '')
    return filteredUniqueTags
}


export const GetCustomerTagList = async (admin, session) => {

    const productTags = await admin.rest.resources.Product.all({ session, fields: 'tags' })
    // console.log('asdsdf', productTags.data.map(({data})))

    const uniqueTags = [...new Set(productTags.data.map(product => product.tags.split(',').map(tag => tag.trim())).flat())];

    // Filter out empty tags
    const filteredUniqueTags = uniqueTags.filter(tag => tag !== '')
    return filteredUniqueTags

}


export const CreateCustomizationPayment = async (admin, payData) => {
    try {
        const functionId = await GetFunctionIdByName(admin, "payment_customization")

        const responses = await admin.graphql(
            `#graphql
                    mutation PaymentCustomizationCreate($paymentCustomize:PaymentCustomizationInput!){
                    customizeCreacte:paymentCustomizationCreate(paymentCustomization: $paymentCustomize) {
                    paymentCustomization {
                        id
                        title
                        metafields(first: 10){
                            nodes{
                                value
                                key
                                id
                            }
                        }
                        }
                    userErrors {
                        message
                    }
                    }
                }` ,
            {
                variables: {
                    paymentCustomize: {
                        title: payData.title || "New method",
                        enabled: true,
                        functionId: functionId,

                        metafields: [
                            {
                                namespace: "$app:custom-payment-methods",
                                key: "custom-payment-methods",
                                type: "json",
                                value: JSON.stringify({
                                    renamedPaymentmethod: payData.renamedPayment,
                                    hidePaymentmethod: payData.hideDtata,
                                    reorderPaymentmethod: payData.reorderData
                                })
                            }
                        ],
                    }
                }
            }
        )
        const JsonResponse = await responses.json()
        if (JsonResponse?.data?.customizeCreacte?.paymentCustomization) {

            const Db_response = await CreateCustomizationPaymentDb(JsonResponse, payData)

            console.log("Db_response ", Db_response)
            return json({ data: Db_response, status: true, msg: 'Successfully Craeted' })

        } else {
            console.log('JsonResponse', JsonResponse)
            return json({ data_error: JsonResponse?.data?.customizeCreacte?.paymentCustomization?.userErrors, status: false, msg: 'something went wrongggggg' })
        }
    } catch (error) {
        console.log('CreateCustomizationPayment', error)
        return json({ data_error: error, status: false, msg: 'something went wrongggggg' })

    }

}

export const UpdateCustomizationPaymentData = async (admin, id, payData) => {
    try {
        const functionId = await GetFunctionIdByName(admin, "payment_customization")

        const Db_response = await UpadeteCustomizationPaymentDb(id,payData)

        const responses = await admin.graphql(
            `#graphql
                    mutation paymentCustomizationUpdate($id: ID!, $paymentCustomization: PaymentCustomizationInput!) {
                           customizeupdate: paymentCustomizationUpdate(id: $id, paymentCustomization: $paymentCustomization) {
                              paymentCustomization {
                                  title
                                  id
                                  enabled
                                                             
                                
                              }
                            userErrors {
                            field
                            message
                            }
                            }
                    }`,
            {
                variables: {
                    id: id,
                    paymentCustomization: {
                        title: payData.title || "New method",
                        enabled: true,
                        functionId: functionId,
                        metafields: [
                            {
                                // id:payData.metafieldId,
                                namespace: "$app:custom-payment-methods",
                                key: "custom-payment-methods",
                                type: "json",
                                value: JSON.stringify({
                                    renamedPaymentmethod: payData.renamedPayment,
                                    hidePaymentmethod: payData.hideDtata,
                                    reorderPaymentmethod: payData.reorderData
                                })
                            }
                        ],


                    }
                }
            }
        )
        const JsonResponse = await responses.json()
        console.log('JsonResponse', JsonResponse)

        if (JsonResponse?.data.customizeupdate.paymentCustomization) {
            return json({ data: JsonResponse, msg: 'Upadeted Successfully', status: true })
        } else {
            return json({ data: JsonResponse, status: false, msg: 'Something went Wrong' })
        }
    } catch (error) {
        console.log('error', error)
        return json({ data: error, status: false, msg: 'Something went Wrong' })

    }
}

export const UpdateCustomizationPaymentStatus = async (admin, id, status) => {

    try {
        let result = await admin.graphql(
            `#graphql
                    mutation paymentCustomizationUpdate($id: ID!, $paymentCustomization: PaymentCustomizationInput!) {
                           customizeupdate: paymentCustomizationUpdate(id: $id, paymentCustomization: $paymentCustomization) {
                              paymentCustomization {
                                  title
                                  id
                                  enabled
                              }
                            userErrors {
                            field
                            message
                            }
                            }
                    }`,
            {
                variables: {
                    id: id,
                    paymentCustomization: {
                        enabled: status,
                    }
                }
            }
        )
        result = await result.json()


        return result


    } catch (error) {
        console.log('api error', error)
        return error
    }

}


export const BulkUpdateCustomizationPaymentStatus = () => {

}


export const DeleteCustomizationPayment = async (admin, id) => {
    try {
        const response = await DeleteCustomization(id)// Deleting from Database as well
        console.log('response', response)
        if (response) {
            const res = await admin.graphql(
                `#graphql
        mutation paymentCustomizationDelete($id: ID!) {
            paymentCustomizationDelete(id: $id) {
              deletedId
              userErrors {
                field
                message
              }
            }
        }`
                , {
                    variables: {
                        id: id
                    }
                })
            const deleteResponse = await res.json()
            return deleteResponse
        } else {
            return json({ error: response?.data?.customizeCreacte?.userErrors, status: false, msg: 'Something went Wrong' })
        }
    } catch (error) {
        console.log('DeleteCustomizationPayment_api error', error)
        return error
    }
}


