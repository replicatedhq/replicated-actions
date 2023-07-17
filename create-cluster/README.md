## Create Cluster

```mermaid
---
title: Create Cluster
---
graph LR
create_cluster["Create Cluster"]
api_token ---> create_cluster
kubernetes_distribution ---> create_cluster
kubernetes_version ---> create_cluster
cluster_name ---> create_cluster
ttl ---> create_cluster
timeout_minutes ---> create_cluster
create_cluster ---> cluster_id
create_cluster ---> cluster_kubeconfig
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| kubernetes-distribution |  | True | Kubernetes distribution of the cluster to provision. |
| kubernetes-version |  | True | Kubernetes version to provision (format is distribution dependent). |
| cluster-name |  | True | Name of the cluster to provision |
| ttl |  | False | Cluster TTL (duration, max 48h) |
| timeout-minutes | 20 | False | Time to wait for the cluster to have a status of `running` |

## Outputs
| Name | Description |
| --- | --- |
| cluster-id | Contains the cluster id. |
| cluster-kubeconfig | Contains the kubeconfig to connect with the cluster. |

