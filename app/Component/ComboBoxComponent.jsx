import { Combobox, Icon, Listbox, Tag, Text } from '@shopify/polaris'
import { SearchMajor } from '@shopify/polaris-icons'
import { useState } from 'react'

const ComboBoxComponent = (data) => {
    const { optiondata, label, selected, onChange, placeholder } = data

    // const optiondata = optiondata.map((tag) => ({ value: tag, label: tag }))

    const [serachvalue, setSearchValue] = useState('')
    const [tagoption, SetTagsOption] = useState(optiondata || [])

    const handlesearch = (value) => {
        setSearchValue(value)
        if (value !== '') {
            const regex = new RegExp(value, 'i');

            SetTagsOption(optiondata.filter((item) => regex.test(item.value) || regex.test(item.label)))
            // console.log('firsttttttttt',)
        } else {
            SetTagsOption(optiondata)
            // console.log('firstdsds', tagoption)
        }
    }

    return (

        <Combobox allowMultiple
            activator={
                <Combobox.TextField
                    prefix={<Icon source={SearchMajor} />}
                    label={label || 'select'}
                    labelHidden
                    placeholder={placeholder || "Search tags"}
                    autoComplete="off"
                    value={serachvalue}
                    onChange={handlesearch}
                />
            }
        >
            {tagoption.length > 0 ? <Listbox onSelect={onChange}>
                {tagoption.map(({ value, label }, index) => (

                    <Listbox.Option key={index} value={value} selected={selected.includes(
                        // @ts-ignore
                        value)} accessibilityLabel={label} >
                        {label}
                    </Listbox.Option>


                ))}
            </Listbox>
                :
                // <Listbox.Option value='a' divider>
                //     No Search Found
                // </Listbox.Option>
                <Text as='h5' variant='bodyMd' alignment='center'> No Search Found</Text>
            }

        </Combobox>
    )
}

export default ComboBoxComponent