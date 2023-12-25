import { Card, InlineStack, Page, ResourceItem, ResourceList, Text, TextField, Avatar } from "@shopify/polaris";

export default function () {

    const g = `App identifier
    Select a template
    X
    Template name
    >
    Better payments by Integrate
    Customize payments at checkout
    Template description
    >
    >
    Hide payment method by Integrate
    Hide a payment method for customers from a selected country at checkout
    Rename a payments method by Focus Inc
    Rename a payment method
    Reorder payment methods by
    Focus Inc
    Organize payment gateways at checkout
    Store payments by
    app
    Filter, rename and redorder customer payments
    >
    >
    Cancel`
    return (
        <Page title="Payment Customization">
            <Card >
                <Text>Hide Selected Payment Method</Text>

                <ResourceList
                    showHeader
                    items={[
                        {
                            id: '341',
                            url: '#',
                            name: 'Hide payment method',
                            description: 'Hide a payment method for customers from a selected country at checkout',
                        },
                        {
                            id: '256',
                            url: '#',
                            name: 'Rename a payments method',
                            description: 'Rename a payment method',
                        },
                        {
                            id: '256',
                            url: '',
                            name: 'Reorder payment methods',
                            description: 'Organize payment gateways at checkout Store payments',
                        },
                    ]}
                    renderItem={(item) => {
                        const { id, url, name, description } = item;
                        const media = <Avatar customer size="md" name={name} />;

                        return (
                            <ResourceList.Item id={id} url={url} media={media} ariaExpanded>
                                <Text variant="bodyMd" fontWeight="bold" as="h3">
                                    {name}
                                </Text>
                                <div>{description}</div>

                            </ResourceList.Item>
                        );
                    }}
                />


                {/* <ResourceList >
            <InlineStack align="space-between">
               <ResourceItem >
                    
               </ResourceItem>

            </InlineStack>
        </ResourceList> */}
            </Card>
        </Page>
    );
}





