## Create VM

```mermaid
---
title: Create VM
---
graph LR
create_vm["Create VM"]
api_token["api-token"]
distribution["distribution"]
version["version"]
vm_name["vm-name"]
ttl["ttl"]
disk["disk"]
instance_type["instance-type"]
count["count"]
public_keys["public-keys"]
tags["tags"]
timeout_minutes["timeout-minutes"]
vm_id["vm-id"]
vm_ids["vm-ids"]
vm_status["vm-status"]
network_id["network-id"]
api_token ---> create_vm
distribution ---> create_vm
version ---> create_vm
vm_name ---> create_vm
ttl ---> create_vm
disk ---> create_vm
instance_type ---> create_vm
count ---> create_vm
public_keys ---> create_vm
tags ---> create_vm
timeout_minutes ---> create_vm
create_vm ---> vm_id
create_vm ---> vm_ids
create_vm ---> vm_status
create_vm ---> network_id
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| distribution |  | True | VM distribution to provision (e.g., ubuntu). |
| version |  | False | Distribution version to provision. |
| vm-name |  | False | Name of the VM to provision. |
| ttl |  | False | VM TTL (duration, max 48h) |
| disk |  | False | Disk size in GiB |
| instance-type |  | False | Instance type to provision |
| count |  | False | Number of VMs to provision |
| public-keys |  | False | SSH public keys to inject into the VM.<br>Example:<br><pre>public-keys: \|<br>  - "ssh-ed25519 AAAA... user@host"</pre><br> |
| tags |  | False | Tags to assign to the VM.<br>Example:<br><pre>tags: \|<br>  - key: "department"<br>    value: "engineering"</pre><br> |
| timeout-minutes | 20 | False | Time to wait for the VM(s) to have a status of `running` |

## Outputs
| Name | Description |
| --- | --- |
| vm-id | Contains the first VM's id (convenient for count=1). |
| vm-ids | JSON array of all created VM ids. |
| vm-status | Final status of the first VM after polling. |
| network-id | Contains the network id associated with the first VM. |

