## Create Object Store

```mermaid
---
title: Create Object Store
---
graph LR
create_object_store["Create Object Store"]
api_token["api-token"]
cluster_id["cluster-id"]
bucket_name["bucket-name"]
timeout_minutes["timeout-minutes"]
bucket_name["bucket-name"]
bucket_prefix["bucket-prefix"]
service_account_name["service_account_name"]
service_account_name_read_only["service_account_name_read_only"]
service_account_namespace["service_account_namespace"]
api_token ---> create_object_store
cluster_id ---> create_object_store
bucket_name ---> create_object_store
timeout_minutes ---> create_object_store
create_object_store ---> bucket_name
create_object_store ---> bucket_prefix
create_object_store ---> service_account_name
create_object_store ---> service_account_name_read_only
create_object_store ---> service_account_namespace
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| cluster-id |  | True | Cluster id to attach object store to |
| bucket-name |  | True | Name of the bucket to create |
| timeout-minutes | 20 | False | Time to wait for the object store to have a status of `running` |

## Outputs
| Name | Description |
| --- | --- |
| bucket-name | Contains the final bucket name. |
| bucket-prefix | Contains the prefix of the bucket. |
| service_account_name | Contains the name of the service account. |
| service_account_name_read_only | Contains the name of the read only service account. |
| service_account_namespace | Contains the namespace of the service account. |

