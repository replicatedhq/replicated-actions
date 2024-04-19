## Expose Port

```mermaid
---
title: Expose Port
---
graph LR
expose_port["Expose Port"]
api_token["api-token"]
cluster_id["cluster-id"]
port["port"]
protocols["protocols"]
hostname["hostname"]
api_token ---> expose_port
cluster_id ---> expose_port
port ---> expose_port
protocols ---> expose_port
expose_port ---> hostname
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| cluster-id |  | True | Cluster id to expose port for |
| port |  | True | Cluster Port to expose. |
| protocols | https | False | Protocols to expose port for. Default is `https`. Possible values are `http`, `https`, `http,https`. |

## Outputs
| Name | Description |
| --- | --- |
| hostname | Contains the hostname of the exposed port. |

