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
disk ---> create_cluster
nodes ---> create_cluster
instance_type ---> create_cluster
timeout_minutes ---> create_cluster
kubeconfig_path ---> create_cluster
export_kubeconfig ---> create_cluster
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
| disk |  | False | Disk size in GiB |
| nodes |  | False | Number of nodes to provision |
| instance-type |  | False | Instance type to provision |
| timeout-minutes | 20 | False | Time to wait for the cluster to have a status of `running` |
| kubeconfig-path |  | False | If specified, the kubeconfig will be written to this path |
| export-kubeconfig | false | False | Export the KUBECONFIG variable (true/false) |

## Outputs
| Name | Description |
| --- | --- |
| cluster-id | Contains the cluster id. |
| cluster-kubeconfig | Contains the kubeconfig to connect with the cluster. |

