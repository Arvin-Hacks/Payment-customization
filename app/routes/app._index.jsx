
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useNavigation, useSubmit } from "@remix-run/react";
import {Badge,
   Button,
   Banner, 
   Card,
    Frame, 
    IndexTable, 
    Layout, Page, 
    Text, Pagination,
     Tag,Toast, Modal,
     Spinner, Popover,
      ActionList,

    useIndexResourceState } from "@shopify/polaris";
import {EditMajor} from '@shopify/polaris-icons'    
import { authenticate } from "~/shopify.server";
import { DeleteCustomization, GetCustomizationListDb, UpdateStatus } from "~/api/db-api.server";
import prisma from "~/db.server";
import PopOverComponent from "~/Component/PopOverComponent";
import { DeleteCustomizationPayment, UpdateCustomizationPaymentStatus } from "~/api/api.sever";
// import { authenticate } from "~/shopify.server";


export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request)

  try {
    const data=await GetCustomizationListDb()
    console.log('response',data)
    // return data
  } catch (error) {
    console.log('GetCustomizationListDb loader error',error)
    // return []
  }

  const customPaymentData = await admin.graphql(
    `#graphql    
            query MyQuery {
              paymentCustomizations(first: 20) {
              nodes {
              id
              title
              enabled
              }
            }
        }`
  )
  const data = await customPaymentData.json()
  console.log("customPaymentData", data.data.paymentCustomizations.nodes)

  return json({
    nodes: data.data.paymentCustomizations.nodes,
    totalCount: data.data.paymentCustomizations.nodes.length,
  })


};


export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request)
  const bodydata = await request.formData();

  const data=JSON.parse(bodydata.get("data"))
  console.log('daata ',data)
 

  switch (request.method) {
    case "PUT":
        console.log('PUT Data',data)
        const res=[]
        for (const id of data.ids) {

          try {
                const response=await UpdateStatus(id,data.status)
                console.log('response',response)
                if(response){
                  const result=await UpdateCustomizationPaymentStatus(admin,id,data.status)
                  console.log('response',result)
                }else{ throw 'somthing went wrong with database'; }                
          
         } catch (error) {
                console.log('error',error)
                return json({status:false,msg:'Something went Wrong'})

          }

        }
        return json({status:true,msg:'Status changed '})

         console.log('ress',res)
      break;
    case "DELETE":
      // return json({data:'error',status:false,msg:'Something went Wrong'})
      const deleteResult=[]
      for (const id of data.ids) {
        try {                   
          const deleteResponse=await DeleteCustomizationPayment(admin,id)
          console.log('paymentCustomizationDelete',deleteResponse)
  
          // if(!deleteResponse?.data?.paymentCustomizationDelete?.deletedId){
          //   return json({data:deleteResponse,status:true,msg:'Deleted...'})
          // }else{
          //   return json({data:deleteResponse,status:false,msg:'Something went Wrong'})
          // }
          if(!deleteResponse?.data?.paymentCustomizationDelete?.deletedId){
            return json({data:deleteResponse,status:false,msg:'Something went Wrong'})
          }
          deleteResult.push(deleteResponse)
          
        } catch (error) {
            console.log('errror..',error)
            return json({data:error,status:false,msg:'Something went Wrong'})
        }
      } 
            return json({data:deleteResult,status:true,msg:'Deleted...'})

                   
  
    default:
      break;
  }

  // setTimeout(() => {
  //   console.log('afsdfsd')
  // }, 3000);

  // const bodydata=
  // return true
};


export default function Index() {


  const nav=useNavigation()
  const Navigate = useNavigate()
  const loaderData = useLoaderData()
  const submit=useSubmit()
  const actionData=useActionData()
  const isLoading = nav.state === "submitting";

  const {selectedResources, allResourcesSelected, handleSelectionChange,clearSelection} =
  useIndexResourceState(loaderData);
  const customizepaymentdata = loaderData?.nodes ? loaderData?.nodes : []


  useEffect(()=>{
    if(actionData){
      setActive(false);setActiveToast(true)  ;

      console.log('action data',actionData)
      
        const remainingPages = Math.ceil((customizepaymentdata.length - selectedResources.length) / 5);
          if (remainingPages < currentPage) {
            handlePageChange(remainingPages);
          }
      
      clearSelection()
    }    
  },[actionData ])
 

  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const paginatedData = customizepaymentdata.slice(startIndex, endIndex);


  const [active, setActive] = useState(false) 
  const [activeToast, setActiveToast] = useState(false)

  const resourceName = {
    singular: 'Payment',
    plural: 'Payments',
  }

  // handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
 
//Handle Bulk Delete 
  const handleDelete=()=>{
      submit({data:JSON.stringify({ids:selectedResources})},{method:"DELETE"})
   
  }

//Handle Bulk Status Change  
  const handleStatusChange=(state)=>{      
      submit(
        {
          data:JSON.stringify(
            {
              ids:selectedResources,
              status:state
            })
      },
      {method:"PUT"}
      )
    
  }

// Bulk action list for Index table
  const promotedBulkActions = [
    {
      content: 'Active',
      onAction:()=> handleStatusChange(true),
    },
    {
      content:'Deactivate',
      onAction:()=>handleStatusChange(false) ,
    },
    {
      content: 'Delete',
      onAction: handleDelete,
    },
  ];

  // handle row selection
  const toggleSelection = (itemId) => {
    const newSelectedResources = selectedResources.includes(itemId)
      ? selectedResources.filter((id) => id !== itemId)
      : [...selectedResources, itemId];

    handleSelectionChange(newSelectedResources);
  };


  return (   

    <Page title="Dashboard">     

      <Frame>
        <Layout>          
          <Layout.Section variant="oneThird">

            <IndexTable
              resourceName={resourceName}
              itemCount={customizepaymentdata.length}
              selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
              onSelectionChange={handleSelectionChange}
              hasZebraStriping
              headings={[
                { title: '#' },
                { title: 'Title' },
                { title: 'Status' },
                { title: 'Action' },
              ]}
            promotedBulkActions={promotedBulkActions}
            loading={isLoading}
            >
              {paginatedData.map(
                (
                  data,
                  index,
                ) => (
                  <IndexTable.Row
                    id={data.id}
                    key={data.id}
                    position={index}
                    selected={selectedResources.includes(data.id)}
                  onSelectionChange={() => toggleSelection(data.id)}
                  // onClick={()=>Navigate(`/app/updatecustomize/${encodeURIComponent(data.id)}`)}
                  >
                    <IndexTable.Cell>
                      <Text variant="bodyMd" fontWeight="bold" as="span">
                        {startIndex+index+1}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>{data.title}</IndexTable.Cell>
                    <IndexTable.Cell>                      
                        <Badge tone={data.enabled ? "success" : "enabled"} >
                          {data.enabled ? " Active " : "Inactive"}
                        </Badge>                      
                    
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Button variant="tertiary"  onClick={()=>Navigate(`/app/updatecustomize/${encodeURIComponent(data.id)}`)} icon={EditMajor} size="slim"></Button>                    </IndexTable.Cell>

                  </IndexTable.Row>
                ),
              )}
            </IndexTable>

            <Pagination
              hasNext={currentPage * 5 < customizepaymentdata.length}
              hasPrevious={currentPage > 1}
              onPrevious={() => handlePageChange(currentPage - 1)}
              onNext={() => handlePageChange(currentPage + 1)}
              type="table"
              label={`Page ${currentPage} of ${Math.ceil(customizepaymentdata.length / 5)} `}
            />
          </Layout.Section>
        </Layout>
        <Layout>
        </Layout>

        <Modal
        size="small"
          open={active}
          onClose={() => setActive(false)}
          title="Status Confirmation"
          primaryAction={{
            content:isLoading?<Spinner  size="small"/> :"Change",
            onAction: handleDelete

          }}
          secondaryActions={[{
            content:  "Cancel",
            onAction: () => setActive(false)
          }]}
        >
          <Modal.Section>
            
              <Text variant="bodyLg" as="p">
                Are You Sure to Delete this customize payment method...?
              </Text>
            
          </Modal.Section>

        </Modal>
        {activeToast ? <Toast content={actionData?.msg} duration={2000} onDismiss={() => setActiveToast(false)} error={!actionData?.status} /> : null}

      </Frame>

    </Page>
  );
}

