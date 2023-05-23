## Archive Customer

```mermaid
---
title: Archive Customer
---
graph LR
archive_customer["Archive Customer"]
replicated_app ---> archive_customer
replicated_api_token ---> archive_customer
customer_id ---> archive_customer
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| replicated-app |  | True | Replicated App Slug. |
| replicated-api-token |  | True | Replicated API Token. |
| customer-id |  | True | The id of the customer. |

## Outputs
| Name | Description |
| --- | --- |

