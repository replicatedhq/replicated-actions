## Get Customer Instances

```mermaid
---
title: Get Customer Instances
---
graph LR
get_customer_instances["Get Customer Instances"]
app_slug["app-slug"]
api_token["api-token"]
matrix["matrix"]
app_slug ---> get_customer_instances
api_token ---> get_customer_instances
get_customer_instances ---> matrix
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |

## Outputs
| Name | Description |
| --- | --- |
| matrix | Matrix to test with (json). |

