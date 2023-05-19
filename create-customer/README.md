# Create Customer

```mermaid
---
title: Create Customer
---
graph LR
create_customer["Create Customer"]
replicated_app ---> create_customer
replicated_api_token ---> create_customer
customer_name ---> create_customer
customer_email ---> create_customer
license_type ---> create_customer
channel_name ---> create_customer
create_customer ---> customer_name
create_customer ---> customer_id
create_customer ---> license_id
create_customer ---> license_file
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| replicated-app |  | True | Replicated App Slug. |
| replicated-api-token |  | True | Replicated API Token. |
| customer-name |  | True | Name of the customer. |
| customer-email |  | False | Email of the customer. |
| license-type | dev | True | License Type for the customer. |
| channel-name | ${GITHUB_REF} | True | Channel to assign the customer to. |

## Outputs
| Name | Description |
| --- | --- |
| customer-name | Contains the customer name. |
| customer-id | Contains the customer id. |
| license-id | Contains the license id. |
| license-file | Contains he license file. |