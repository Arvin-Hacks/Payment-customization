import { BlockStack, Breadcrumbs, Button, Card, List, Grid, Icon, Page, Select, Text, TextField, ResourceItem, Thumbnail, Toast, Tooltip, Frame, Divider, Layout, Box, InlineGrid } from "@shopify/polaris";
import { Link, useActionData, useSubmit, useNavigation, useLocation, useLoaderData, useNavigate } from '@remix-run/react'
import ComboBoxComponent from "~/Component/ComboBoxComponent";
import { CameraMajor, HideMinor, ViewMinor, DragDropMajor } from '@shopify/polaris-icons'
import { useEffect, useState, useTransition, useCallback } from "react";
import { authenticate } from "~/shopify.server";
import { getProperty, hasProperty } from 'dot-prop'

import prisma from "~/db.server";
import { UpdateCustomizationPaymentData } from "~/api/api.sever";

export const loader = async ({ request, params }) => {

    const { admin, session } = await authenticate.admin(request)
    try {
        const response = await prisma.customepaymentmethod.findMany({ where: { paymentCustomizeId: params.id } })
        console.log('response', response)

        return response[0]
    } catch (error) {
        console.log('error', error)
        return error
    }

};


export const action = async ({ request, params }) => {
    const { admin, session } = await authenticate.admin(request)
    // const functionId = "e719473b-507b-4f03-87f6-6564b7812960"
    const body = await request.formData();
    const payData = JSON.parse(body.get('data'))

    console.log('payData', payData)       // return null

    const response = await UpdateCustomizationPaymentData(admin, params.id, payData)
    return response
};


export default function () {

    const submit = useSubmit()
    const actionData = useActionData()
    const loaderData = useLoaderData()
    const Navigate = useNavigate()
    const nav = useNavigation();
    const [activeToast, setActiveToast] = useState(false)

    const isLoading =
        ["loading", "submitting"].includes(nav.state) && nav.formMethod === "PUT";
    const [title, setTitle] = useState(loaderData.title)

    console.log('loaderdata', loaderData)
    const [paymentMethods, setPaymentMethods] = useState(loaderData.methods)

    // Handle input for Renaming a payment options
    const handleInputChange = (newValue, methodname) => {

        setPaymentMethods((prevMethods) =>
            prevMethods.map((method) => {
                const { hide, name, position } = method
                return name === methodname ? { name, hide, value: newValue, oldValue: name, position } : method
            })
        );
    };

    // handle Hide and Show payment options
    const toggleDisabled = (methodname) => {

        let i = 1

        setPaymentMethods((prevMethods) =>
            prevMethods.map((menthod) => menthod.name === methodname ? { ...menthod, hide: !menthod.hide } : menthod
            ).map((method) => !method.hide ? { ...method, position: i++ } : method)
        );

    };

    // Handle input for positioning payment options
    const handlePositionChange = (methodname, newindex) => {

        const availableData = paymentMethods.filter((method) => !method.hide);

        if (newindex <= availableData.length) {
            setPaymentMethods((prevMethods) =>
                prevMethods.map((method) =>
                    method.name === methodname ? { ...method, position: newindex } : method
                )
            );
        } else {
            alert('Invalid position value:', newindex);

        }

    }

    // Handle data before Submitting to action

    const hadndleFinalData = () => {

        const hideDtata = []
        const RenamedData = []
        const reorderData = []

        paymentMethods.forEach(item => {
            console.log('first', item,)
            if (hasProperty(item, 'oldValue')) {
                RenamedData.push({
                    name: item.name,
                    rename: item.value
                })
            }
            if (item.hide) {
                hideDtata.push(item.name)
            } else {
                reorderData.push({
                    index: parseInt(item.position - 1),
                    name: item.name
                })
            }
        });

        console.warn('renamed data ', RenamedData)
        console.warn('hideDtata ', hideDtata)
        console.warn('reorderData ', reorderData)



        submit({
            data: JSON.stringify(
                {
                    renamedPayment: RenamedData,
                    hideDtata: hideDtata,
                    reorderData: reorderData,
                    title: title,
                    metafieldId: loaderData.metafieldId
                }
            )
        }, { method: "PUT" })
    }

    useEffect(() => {
        if (actionData) {
            setActiveToast(true)
            console.warn("actionData", actionData)
            actionData?.status ? setTimeout(() => { Navigate('/app/') }, 500) : null;
        }

    }, [actionData])

    return (
        <Page title="Update PaymentCustomization " >
            <Frame>

                <Breadcrumbs backAction={{ url: '/app/', content: 'Back to Dashboard' }} >Hide payment menthod</Breadcrumbs>
                <br />
                <Card>
                    <BlockStack gap={'300'}>
                        <TextField label={<Text as="h4" fontWeight="medium">Title</Text>} value={title} onChange={(value) => setTitle(value)} variant="inherit" monospaced X />

                        <Divider borderColor="border-inverse" borderWidth="050" />

                        <Layout >
                            <Layout.Section variant="oneHalf">
                                {paymentMethods.map(({ name, value, oldValue, hide, position }) => (
                                    <TextField
                                        key={name}
                                        label='Method'
                                        value={value}
                                        placeholder="Test"
                                        disabled={hide}
                                        // readOnly
                                        autoComplete="off"
                                        onChange={(newValue) => { handleInputChange(newValue, name) }}
                                        connectedRight={
                                            <Button
                                                variant="tertiary"
                                                icon={hide ? ViewMinor : HideMinor}
                                                onClick={() => { toggleDisabled(name) }}
                                            ></Button>
                                        }
                                    // connectedLeft={<TextField autoComplete="off" inputMode="numeric" monospaced value={ position} />}
                                    />
                                ))}
                            </Layout.Section>
                            <Divider />
                            <Layout.Section variant="oneHalf" >
                                <Box paddingBlock="600" >
                                    <BlockStack gap={"200"}>
                                        <Text variant="headingMd">Renamed Data:</Text>
                                        <List type="bullet">
                                            {paymentMethods
                                                .filter((item) => item.oldValue && !item.hide)
                                                .map(({ name, value }) => (
                                                    <List.Item key={name}>
                                                        <InlineGrid columns={2} gap='050'>
                                                            <Text fontWeight="medium">{name}</Text>
                                                            <Text >{`: ${value}`}</Text>
                                                        </InlineGrid>
                                                    </List.Item>
                                                ))}

                                        </List>
                                        <Text variant="headingMd">Hidden Data:</Text>
                                        <List type="bullet">
                                            {paymentMethods
                                                .filter((item) => item.hide)
                                                .map(({ name }) => (
                                                    <List.Item key={name}>{name}</List.Item>
                                                ))}
                                        </List>
                                        <Text variant="headingMd">Availabe Data:</Text>
                                        <List type="bullet">
                                            {paymentMethods
                                                .filter((item) => !item.hide)
                                                .map((method, index) => (
                                                    < List.Item key={index} >
                                                        <InlineGrid columns={2}>
                                                            <TextField
                                                                autoComplete="on"
                                                                value={method.position}
                                                                //  inputMode="numeric" 
                                                                onChange={(value) => handlePositionChange(method.name, value)}
                                                                connectedLeft={'Position'}
                                                            />

                                                            <Text >{`: ${method.value}`}</Text>
                                                        </InlineGrid>
                                                    </List.Item>
                                                )
                                                )}
                                        </List>
                                    </BlockStack>

                                </Box>
                            </Layout.Section>
                        </Layout>

                    </BlockStack>
                    <br />

                    <Button onClick={hadndleFinalData} tone="success" variant="primary" loading={isLoading}>Save</Button>
                </Card>
                {activeToast ? <Toast content={actionData?.msg} duration={2000} onDismiss={() => setActiveToast(false)} error={!actionData?.status} /> : null}

            </Frame>
        </Page >
    );

}
