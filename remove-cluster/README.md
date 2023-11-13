## Remove cluster

```mermaid
---
title: Remove cluster
---
graph LR
remove_cluster["Remove cluster"]
api_token["api-token"]
cluster_id["cluster-id"]
api_token ---> remove_cluster
cluster_id ---> remove_cluster
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| cluster-id |  | True | Cluster id to remove. |

## Outputs
| Name | Description |
| --- | --- |

