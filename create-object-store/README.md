## Create Object Store

```mermaid
---
title: Create Object Store
---
graph LR
create_object_store["Create Object Store"]
api_token["api-token"]
cluster_name["cluster-name"]
disk["disk"]
tags["tags"]
cluster_id["cluster-id"]
cluster_kubeconfig["cluster-kubeconfig"]
api_token ---> create_object_store
cluster_name ---> create_object_store
disk ---> create_object_store
tags ---> create_object_store
create_object_store ---> cluster_id
create_object_store ---> cluster_kubeconfig
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| cluster-name |  | True | Name of the cluster to provision |
| disk |  | False | Disk size in GiB |
| tags |  | False | Tags to assign to the cluster.<br>Example:<br><pre>tags: \|<br>  - key: "department"<br>    value: "engineering"</pre><br> |

## Outputs
| Name | Description |
| --- | --- |
| cluster-id | Contains the cluster id. |
| cluster-kubeconfig | Contains the kubeconfig to connect with the cluster. |

