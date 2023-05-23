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
create_cluster ---> cluster_id
create_cluster ---> cluster_status
create_cluster ---> cluster_kubeconfig
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| kubernetes-distribution | kind | True | Kubernetes distribution of the cluster to provision (default "kind") |
| kubernetes-version | v1.25.3 | True | Kubernetes version to provision (format is distribution dependent) (default "v1.25.3") |
| cluster-name |  | True | Name of the cluster to provision |
| ttl | 1h | True | Cluster TTL (duration) (default "1h") |

## Outputs
| Name | Description |
| --- | --- |
| cluster-id | Contains the cluster id. |
| cluster-status | Contains the cluster status. |
| cluster-kubeconfig | Contains the kubeconfig to connect with the cluster. |

