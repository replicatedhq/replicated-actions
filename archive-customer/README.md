## Archive Customer

```mermaid
---
title: Archive Customer
---
graph LR
archive_customer["Archive Customer"]
api_token["api-token"]
app_slug["app-slug"]
customer_id["customer-id"]
customer_name["customer-name"]
api_token ---> archive_customer
app_slug ---> archive_customer
customer_id ---> archive_customer
customer_name ---> archive_customer
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| app-slug |  | True | App Slug. |
| customer-id |  | False | The id of the customer. Either customer-id or customer-name must be provided. |
| customer-name |  | False | The name of the customer. If provided, will look up the customer ID. Either customer-id or customer-name must be provided. |

## Outputs
| Name | Description |
| --- | --- |

