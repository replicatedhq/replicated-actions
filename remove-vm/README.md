## Remove VM

```mermaid
---
title: Remove VM
---
graph LR
remove_vm["Remove VM"]
api_token["api-token"]
vm_id["vm-id"]
api_token ---> remove_vm
vm_id ---> remove_vm
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| vm-id |  | True | VM id to remove. |

## Outputs
| Name | Description |
| --- | --- |

