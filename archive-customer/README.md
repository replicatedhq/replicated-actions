## Archive Customer

```mermaid
---
title: Archive Customer
---
graph LR
archive_customer["Archive Customer"]
api_token["api-token"]
customer_id["customer-id"]
customer_name["customer-name"]
app_slug["app-slug"]
api_token ---> archive_customer
customer_id ---> archive_customer
customer_name ---> archive_customer
app_slug ---> archive_customer
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| customer-id |  | False | The id of the customer. Either customer-id or customer-name must be provided. |
| customer-name |  | False | The name of the customer. Either customer-id or customer-name must be provided. |
| app-slug |  | False | The app slug to filter customers by when using customer-name. |

## Outputs
| Name | Description |
| --- | --- |

