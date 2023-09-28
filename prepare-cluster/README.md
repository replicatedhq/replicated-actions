## Prepare Cluster

```mermaid
---
title: Prepare Cluster
---
graph LR
prepare_cluster["Prepare Cluster"]
app_slug ---> prepare_cluster
api_token ---> prepare_cluster
chart ---> prepare_cluster
yaml_dir ---> prepare_cluster
kubernetes_distribution ---> prepare_cluster
kubernetes_version ---> prepare_cluster
ttl ---> prepare_cluster
helm_values ---> prepare_cluster
helm_chart_name ---> prepare_cluster
helm_run_preflights ---> prepare_cluster
kots_config_values ---> prepare_cluster
kots_wait_duration ---> prepare_cluster
prepare_cluster ---> cluster_id
prepare_cluster ---> cluster_kubeconfig
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| chart |  | False | Path to the helm chart (One of `chart` or `yaml-dir` is required). |
| yaml-dir |  | False | The directory containing multiple yamls for a Replicated release. |
| kubernetes-distribution |  | True | Kubernetes distribution of the cluster to provision. |
| kubernetes-version |  | False | Kubernetes version to provision (format is distribution dependent). |
| ttl |  | False | Cluster TTL (duration, max 48h) |
| helm-values |  | False | A Helm values.yaml file to use |
| helm-chart-name |  | False | The name of the Helm chart to use |
| helm-run-preflights | true | False | Run preflight checks (true/false) |
| kots-config-values |  | False | The KOTS config values to use |
| kots-wait-duration |  | False | Timeout for KOTS to be used while waiting for individual components to be ready. must be in Go duration format (eg: 10s, 2m) (default "2m") |

## Outputs
| Name | Description |
| --- | --- |
| cluster-id | Contains the cluster id. |
| cluster-kubeconfig | Contains the kubeconfig to connect with the cluster. |

