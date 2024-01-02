import { json } from '@remix-run/node'
import prisma from '../db.server'

export const CreateCustomizationPaymentDb = async (JsonResponse, payData) => {

    try {
        const Db_response = await prisma.customepaymentmethod.create({
            data: {
                paymentCustomizeId: JsonResponse?.data?.customizeCreacte?.paymentCustomization?.id,
                title: payData.title,
                status: true,
                methods: payData.paymentMethods,
                metafieldId: JsonResponse?.data?.customizeCreacte?.paymentCustomization?.metafields.nodes[0].id
            }
        })
        // console.log("Db_response api", Db_response)
        return Db_response
    } catch (error) {
        console.log("CreateCustomizationPaymentDb  error", error)
        return error
    }
}

export const GetCustomizationListDb = async () => {
    try {
        const response = await prisma.customepaymentmethod.findMany()
        return response

    } catch (error) {
        console.log('GetCustomizationListDb_error', error)
        return error

    }
}

export const UpadeteCustomizationPaymentDb = async (paymentCustomizeId, payData) => {

    try {
        const response = await prisma.customepaymentmethod.updateMany({
            where: {
                paymentCustomizeId: paymentCustomizeId
            },
            data: {
                title: payData?.title,
                methods: payData.paymentMethods,
            }
        })
        return json({ status: true })
    } catch (error) {
        console.log('error', error)
        return json({ data: error, msg: 'Database Error', status: false })
    }

}
export const UpdateStatus = async (id, status) => {
    try {
        const response = await prisma.customepaymentmethod.updateMany({
            where: {
                paymentCustomizeId: id
            },
            data: {
                status: status
            }
        })
        return response
    } catch (error) {
        console.log('UpdateStatus_error', error)
        return error
    }
}

export const DeleteCustomization = async (id) => {
    try {
        const response = await prisma.customepaymentmethod.deleteMany(
            {
                where: {
                    paymentCustomizeId: id
                }
            })
        return response
    } catch (error) {
        console.log('UpdateStatus_error', error)
        return error
    }
}
