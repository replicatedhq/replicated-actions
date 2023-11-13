## Create Customer

```mermaid
---
title: Create Customer
---
graph LR
create_customer["Create Customer"]
app_slug["app-slug"]
api_token["api-token"]
customer_name["customer-name"]
customer_email["customer-email"]
license_type["license-type"]
channel_slug["channel-slug"]
expires_in["expires-in"]
entitlements["entitlements"]
is_kots_install_enabled["is-kots-install-enabled"]
customer_id["customer-id"]
license_id["license-id"]
license_file["license-file"]
app_slug ---> create_customer
api_token ---> create_customer
customer_name ---> create_customer
customer_email ---> create_customer
license_type ---> create_customer
channel_slug ---> create_customer
expires_in ---> create_customer
entitlements ---> create_customer
is_kots_install_enabled ---> create_customer
create_customer ---> customer_id
create_customer ---> license_id
create_customer ---> license_file
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| customer-name |  | True | Name of the customer. |
| customer-email |  | False | Email of the customer. |
| license-type | dev | True | License Type for the customer. |
| channel-slug |  | False | Channel to assign the customer to. |
| expires-in | 0 | False | Expiration of the license in days. (default: 0 - never expires)) |
| entitlements |  | False | Entitlements to assign to the customer. |
| is-kots-install-enabled |  | False | If KOTS install should be enabled for the customer. |

## Outputs
| Name | Description |
| --- | --- |
| customer-id | Contains the customer id. |
| license-id | Contains the license id. |
| license-file | Contains he license file. |

