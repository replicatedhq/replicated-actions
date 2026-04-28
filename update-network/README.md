## Update Network

```mermaid
---
title: Update Network
---
graph LR
update_network["Update Network"]
api_token["api-token"]
network_id["network-id"]
policy["policy"]
collect_report["collect-report"]
network_id["network-id"]
network_status["network-status"]
network_policy["network-policy"]
collect_report["collect-report"]
api_token ---> update_network
network_id ---> update_network
policy ---> update_network
collect_report ---> update_network
update_network ---> network_id
update_network ---> network_status
update_network ---> network_policy
update_network ---> collect_report
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| network-id |  | True | Network id to update. |
| policy |  | False | Network policy to set (e.g., `airgap`). At least one of `policy` or `collect-report` must be provided. |
| collect-report |  | False | Whether to collect a network report (true/false). At least one of `policy` or `collect-report` must be provided. |

## Outputs
| Name | Description |
| --- | --- |
| network-id | Contains the network id. |
| network-status | Contains the network status. |
| network-policy | Contains the network policy. |
| collect-report | Whether the network is collecting a report (true/false). |

