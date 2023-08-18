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
kots_config_values ---> prepare_cluster
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| chart |  | False | Path to the helm chart (One of `chart` or `yaml-dir` is required). |
| yaml-dir |  | False | The directory containing multiple yamls for a Replicated release. |
| kubernetes-distribution |  | True | Kubernetes distribution of the cluster to provision. |
| kubernetes-version |  | True | Kubernetes version to provision (format is distribution dependent). |
| ttl |  | False | Cluster TTL (duration, max 48h) |
| helm-values |  | False | A Helm values.yaml file to use |
| helm-chart-name |  | False | The name of the Helm chart to use |
| kots-config-values |  | False | The KOTS config values to use |

## Outputs
| Name | Description |
| --- | --- |

