import React, { useState } from 'react';
import {
  Button,
  Popover,
  ActionList,
  Text,
  Card,
  Layout,
} from '@shopify/polaris';

const PopOverComponent = ({ data, handleStatusChange }) => {
  const [activePopover, setActivePopover] = useState(false);

  const handlePopoverToggle = () => {
    setActivePopover(!activePopover);
  };

  const handleAction = (action) => {
    // Perform action based on the selected item
    if (action === 'active') {
      handleStatusChange(data.id, true);
    } else if (action === 'deactivate') {
      handleStatusChange(data.id, false);
    }

    // Close the popover after performing the action
    setActivePopover(false);
  };

  const popoverContent = (
    <Card>
      <Card.Section>
        <Text variant="subdued">{data.title}</Text>
      </Card.Section>
      <Card.Section>
        <ActionList
          items={[
            { content: 'Active', onAction: () => handleAction('active'), disabled: data.enabled },
            { content: 'Deactivate', onAction: () => handleAction('deactivate'), disabled: !data.enabled },
          ]}
        />
      </Card.Section>
    </Card>
  );

  return (
    <Layout.Section>
      <Popover
        active={activePopover}
        activator={<Button onClick={handlePopoverToggle} disclosure>{data.enabled ? 'Active' : 'Inactive'}</Button>}
        onClose={handlePopoverToggle}
      >
        {popoverContent}
      </Popover>
    </Layout.Section>
  );
};

export default PopOverComponent;
