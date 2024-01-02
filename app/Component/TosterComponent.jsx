import { Toast } from '@shopify/polaris'
import React from 'react'

const TosterComponent = (message,type) => {
  return (
    <Toast  content={message} duration={3000}>

    </Toast>
  )
}

export default TosterComponent