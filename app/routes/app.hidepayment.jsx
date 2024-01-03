import { BlockStack, Breadcrumbs, Button, Card, List, Grid, Icon, Page, Select, Text, TextField, ResourceItem, Thumbnail, Tooltip, Frame, Divider, Layout, Box, InlineGrid, Toast, Banner } from "@shopify/polaris";
import { Link, useActionData, useSubmit, useNavigation, useNavigate } from '@remix-run/react'
import ComboBoxComponent from "~/Component/ComboBoxComponent";
import { CameraMajor, HideMinor, ViewMinor, DragDropMajor } from '@shopify/polaris-icons'
import { useEffect, useState, useTransition, useCallback } from "react";
import { authenticate } from "~/shopify.server";
import { getProperty, hasProperty } from 'dot-prop'

import { CreateCustomizationPayment } from "~/api/api.sever";
import TosterComponent from "~/Component/TosterComponent";


let d = { a: { tet: 'b' } }

console.log(getProperty(d, d.a))


export const loader = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request)

    return {}
};



export const action = async ({ request }) => {
    const { admin } = await authenticate.admin(request)
    const body = await request.formData();

    const payData = JSON.parse(body.get('data'))

    console.log('payData', payData)
    // return null
    const JsonResponse = await CreateCustomizationPayment(admin, payData)

    return JsonResponse;

}

export default function () {

    const submit = useSubmit()
    const actionData = useActionData()
    const nav = useNavigation();
    const Navigate = useNavigate()

    const isLoading =
        ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
    const [activeToast, setActiveToast] = useState(false)
    const [title, setTitle] = useState('')
    const [error, setError] = useState('')


    useEffect(() => {
        if (actionData) {
            console.log('action Datta', actionData)
            setActiveToast(true);
            actionData?.status ? setTimeout(() => { Navigate('/app/') }, 500) : setError(actionData?.error);
        }

    }, [actionData])


    const [payment, setPayment] = useState([
        // {
        //     "id": "gid://shopify/PaymentCustomizationPaymentMethod/0",
        //     "name": "Gift card"
        // },
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
    ]);



    const [paymentMethods, setPaymentMethods] = useState(payment.map(({ name }, index) => ({ name, value: name, hide: false, position: index + 1 })));


    // Handle input for Renaming a payment options
    const handleInputChange = (newValue, methodname) => {

        setPaymentMethods((prevMethods) =>
            prevMethods.map((method) => {
                const { hide, name, position } = method
                return name === methodname ? { name, hide, value: newValue, oldValue: name, position } : method
            })
        )
    };

    // Handle Hide and Show payment options
    const toggleDisabled = (methodname) => {

        let i = 1;

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
            setError('Invalid position value');
        }

    }

    // Handle data before Submitting to action
    const hadndleFinalData = () => {
        if (title) {
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

            const validatedata = checkFieldsValidityy(RenamedData, reorderData)

            console.log("validatedata", validatedata)
            if (validatedata) {
                submit({
                    data: JSON.stringify(
                        {
                            renamedPayment: RenamedData,
                            hideDtata: hideDtata,
                            reorderData: reorderData,
                            title: title,
                            paymentMethods: paymentMethods
                        }
                    )
                }, { method: "POST" }
                )
            } else { setError("Please Provide valid Details") }

        } else {
            setError("Please Provide title")
        }
    }


    return (
        <Page title="New Payment Customization" primaryAction={<Button onClick={hadndleFinalData} tone="success" variant="primary" loading={isLoading}>Add Payment</Button>}>
            <Frame>
                {error ?
                    <Banner tone="critical" title="Error creating new payment method">
                        <Text tone="magic-subdued">{error}</Text>
                    </Banner> : null
                }
                <br />
                {/* <Breadcrumbs backAction={{ url: '/app/', content: 'Back to Dashboard' }} >Hide payment menthod</Breadcrumbs> */}
                <Card>
                    <BlockStack gap={'300'}>
                        <TextField label={<Text as="h4" fontWeight="medium">Title</Text>} value={title} onChange={(value) => setTitle(value)} variant="inherit" monospaced error={title ? false : true} />

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
                    <Button onClick={hadndleFinalData} tone="success" variant="primary" loading={isLoading}>Add Payment</Button>
                </Card>

                <p>Status:{activeToast ? 'ok' : 'stand by'}</p>
                {activeToast ? <Toast content={actionData?.msg} duration={2000} onDismiss={() => setActiveToast(false)} error={!actionData?.status} /> : null}

                {/* {activeToast ? <TosterComponent message={actionData?.msg} type={actionData?.status} /> : null} */}
            </Frame>
        </Page >
    )

}
// Check for non-null values in the "rename" field and duplicates in the "position" field
const checkFieldsValidityy = (array1, array2) => {


    const hasNullRename = array1.some(item => item.rename === null || item.rename === '');

    const hasNoDuplicates = array2.every(
        (item, index, arr) => arr.findIndex((el) => el.index === item.index) === index
    );
    return !hasNullRename && hasNoDuplicates;
}