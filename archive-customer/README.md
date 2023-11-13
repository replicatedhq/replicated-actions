## Archive Customer

```mermaid
---
title: Archive Customer
---
graph LR
archive_customer["Archive Customer"]
api_token["api-token"]
customer_id["customer-id"]
api_token ---> archive_customer
customer_id ---> archive_customer
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| customer-id |  | True | The id of the customer. |

## Outputs
| Name | Description |
| --- | --- |

