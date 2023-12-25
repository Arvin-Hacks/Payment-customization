import { BlockStack, Breadcrumbs, Button, Card, Grid, Icon, Page, Select, Text, TextField, ResourceItem, Thumbnail, Tooltip, Frame } from "@shopify/polaris";
import { Link, useActionData, useSubmit, useNavigation } from '@remix-run/react'
import ComboBoxComponent from "~/Component/ComboBoxComponent";
import { CameraMajor, HideMinor, ViewMinor, DragDropMajor } from '@shopify/polaris-icons'
import { useEffect, useState, useTransition, useCallback } from "react";
import { authenticate } from "~/shopify.server";
import { getProperty, hasProperty } from 'dot-prop'
// import {useDrag,useDrop} from 'react-dnd'
// import {HTML5Backend} from 'react-dnd-html5-backend'
import DraggableList from '../Component/DraggableComponent'
// import 'bootstrap/dist/css/bootstrap.min.css';

// import Draggable from '../Component/Draggable'
// const functionId = "e719473b-507b-4f03-87f6-6564b7812960"

let d = { a: { tet: 'b' } }

console.log(getProperty(d, d.a))


export const loader = async ({ request }) => {

    const { admin, session } = await authenticate.admin(request)

    return {}
};



export const action = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request)
    // const functionId = "e719473b-507b-4f03-87f6-6564b7812960"
    let g = 'gid://shopify/PaymentCustomization/59408670'
    console.log('test')
    const body = await request.formData();

    const payData = JSON.parse(body.get('data'))

    console.log('payData', payData)
    // return null


    try {
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
                        title: "Hide payment method 2",
                        enabled: true,
                        functionId: "e719473b-507b-4f03-87f6-6564b7812960",

                        metafields: [
                            {
                                namespace: "$app:custom-payment-methods",
                                key: "custom-payment-methods",
                                type: "json",
                                value: JSON.stringify({
                                    renamedPaymentmethod: payData.renamedPayment,
                                    hidePaymentmethod: payData.hideDtata,
                                })
                            }
                        ],
                    }
                }
            }
        )
        const JsonResponse = await responses.json()

        console.log('JsonResponse', JsonResponse)

        return JsonResponse;
    } catch (error) {
        console.log('error', error)
        return error
    }
};


export default function () {

    const submit = useSubmit()
    const actionData = useActionData()
    const nav = useNavigation();

    // const [paymentMehod,setPaymentMethods]=useState([])  


    const isLoading =
        ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
    const [selectedmethod, setSelectedMethods] = useState([])
    const [subTotal, setSubtotal] = useState('1000')
    const PaymentMethods = ['Bank Deposit', 'Cash on Delivery', 'Money Order', '(for testing) Bogus Gateway', 'Gift card']

    const handleMethodChange = (selected) => {
        console.warn('selected methods')
        if (selectedmethod.includes(selected)) {
            setSelectedMethods(
                selectedmethod.filter((option) => option !== selected),
            );
        } else {
            // @ts-ignore
            setSelectedMethods([...selectedmethod, selected]);
        }
    }


    useEffect(() => {
        if (actionData) {
            console.warn("actionData", actionData)
        }

    }, [actionData])

    // const payment = [
    //     {
    //         "id": "gid://shopify/PaymentCustomizationPaymentMethod/0",
    //         "name": "Gift card"
    //     },
    //     {
    //         "id": "gid://shopify/PaymentCustomizationPaymentMethod/1",
    //         "name": "(for testing) Bogus Gateway"
    //     },
    //     {
    //         "id": "gid://shopify/PaymentCustomizationPaymentMethod/2",
    //         "name": "Deferred"
    //     },
    //     {
    //         "id": "gid://shopify/PaymentCustomizationPaymentMethod/3",
    //         "name": "Cash on Delivery (COD)"
    //     },
    //     {
    //         "id": "gid://shopify/PaymentCustomizationPaymentMethod/4",
    //         "name": "Money Order"
    //     },
    //     {
    //         "id": "gid://shopify/PaymentCustomizationPaymentMethod/5",
    //         "name": "Bank Deposit"
    //     }
    // ]

    const [payment, setPayment] = useState([
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
    ]);


    const [paymentMethods, setPaymentMethods] = useState(payment.map(({ name }) => ({ name, value: name })));

    const handleInputChange = (newValue, name) => {
        setPaymentMethods((prevMethods) =>
            prevMethods.map((method) =>
                method.name === name ? { name, value: newValue, oldValue: method.value } : method
            )
        );


    };

    const ITEMS = [
        { id: '1', title: 'Example list item 1' },
        { id: '2', title: 'Example list item 2' },
        { id: '3', title: 'Example list item 3' },
        { id: '4', title: 'Example list item 4' },
        { id: '5', title: 'Example list item 5' },
    ];

    const items = [
        { id: '1', title: 'Item 1' },
        { id: '2', title: 'Item 2' },
        { id: '3', title: 'Item 3' },
    ];

    const [toggle, setToggle] = useState(false)

    const [showStates, setShowStates] = useState(paymentMethods.reduce((acc, { name }) => ({ ...acc, [name]: false }), {}));

    const toggleDisabled = (name) => {
        setShowStates((prev) => ({ ...prev, [name]: !prev[name] }));

        console.log('toggle',)
    };



    const hideDtata = []
    const RenamedData = []


    const hadndleFinalData = () => {
        const data = paymentMethods.map((item) => {
            console.log('first', item,)
            if (hasProperty(item, 'oldValue')) {
                RenamedData.push({ name: item.name, rename: item.value })
            }
            if (showStates[item.name]) {
                hideDtata.push(item.name)
            }


            console.log('showStates', showStates[item.name])
            return {
                name: item.name,

            }
            //    console.warn('showStates.filter(({name})=>)',showStates.filter(({name})=>name==item.name)) 
        })
        console.warn('renamed data ', RenamedData)
        console.warn('hideDtata ', hideDtata)


        submit({
            data: JSON.stringify(
                {
                    renamedPayment: RenamedData,
                    hideDtata: hideDtata
                }
            )
        }, { method: "POST" })
        console.error('sds')
    }
    return (
        <Page narrowWidth>
            <Frame>

                <Breadcrumbs backAction={{ url: '/app/', content: 'Back to Dashboard' }} >Hide payment menthod</Breadcrumbs>
                <br />
                {/* <Card >

                <BlockStack gap={300}   >
                    <Text variant="headingMd" as="h4">Hide payment menthod</Text>

                    <ComboBoxComponent
                        label="Select Payment method"
                        optiondata={PaymentMethods.map((method) => ({ label: method, value: method }))}
                        selected={selectedmethod}
                        onChange={handleMethodChange}
                    />

                    <TextField
                        label="Minimum Cart Subtotal"
                        // connectedLeft='Rs.'
                        value={subTotal}
                        onChange={(value) => setSubtotal(value)}
                        autoComplete="on"
                        type="integer"
                        monospaced
                        prefix='Rs. '
                    />
                    <Button onClick={() => submit(null, { method: 'POST' })} loading={isLoading}>Submit</Button>
                </BlockStack>
            </Card> */}


                <Card>
                    <BlockStack gap={'300'}>
                        {paymentMethods.map(({ name, value, oldValue }) => (
                            <TextField
                                key={name}
                                label='Method'
                                value={value}
                                placeholder="Test"
                                disabled={showStates[name]}
                                // readOnly
                                autoComplete="off"
                                onChange={(newValue) => handleInputChange(newValue, name)}
                                connectedRight={
                                    <Button
                                        variant="tertiary"
                                        icon={showStates[name] ? ViewMinor : HideMinor}
                                        onClick={() => toggleDisabled(name)}
                                    ></Button>
                                }
                                connectedLeft={<Button icon={DragDropMajor} variant="tertiary" />}
                            />
                        ))}
                    </BlockStack>
                    <br />

                    <Button onClick={() => console.warn('first', paymentMethods, showStates)} >Add Payment </Button>
                    <Button onClick={hadndleFinalData}>Test</Button>
                </Card>

                <Card>
                    {/* <DraggableList /> */}
                </Card>
            </Frame>
        </Page >
    );

}
