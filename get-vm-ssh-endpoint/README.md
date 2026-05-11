## Get VM SSH Endpoint

```mermaid
---
title: Get VM SSH Endpoint
---
graph LR
get_vm_ssh_endpoint["Get VM SSH Endpoint"]
api_token["api-token"]
vm_id["vm-id"]
username["username"]
ssh_endpoint["ssh-endpoint"]
api_token ---> get_vm_ssh_endpoint
vm_id ---> get_vm_ssh_endpoint
username ---> get_vm_ssh_endpoint
get_vm_ssh_endpoint ---> ssh_endpoint
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| vm-id |  | True | The ID of the VM to get the SSH endpoint for. |
| username |  | False | Optional username to include in the SSH endpoint. |

## Outputs
| Name | Description |
| --- | --- |
| ssh-endpoint | Contains the SSH endpoint for the VM. |

