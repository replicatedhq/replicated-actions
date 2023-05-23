## Archive Customer

```mermaid
---
title: Archive Customer
---
graph LR
archive_customer["Archive Customer"]
app_slug ---> archive_customer
api_token ---> archive_customer
customer_id ---> archive_customer
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| customer-id |  | True | The id of the customer. |

## Outputs
| Name | Description |
| --- | --- |

