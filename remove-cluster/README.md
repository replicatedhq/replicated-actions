# Remove a cluster

```mermaid
---
title: Remove cluster
---
graph LR
remove_cluster["Remove cluster"]
replicated_api_token ---> remove_cluster
cluster_id ---> remove_cluster
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| replicated-api-token |  | True | Replicated API Token. |
| cluster-id |  | True | Cluster id to remove. |

## Outputs
| Name | Description |
| --- | --- |