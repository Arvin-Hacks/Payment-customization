import prisma from "~/db.server"

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