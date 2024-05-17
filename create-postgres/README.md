## Create Postgres

```mermaid
---
title: Create Postgres
---
graph LR
create_postgres["Create Postgres"]
api_token["api-token"]
cluster_id["cluster-id"]
version["version"]
instance_type["instance-type"]
disk["disk"]
timeout_minutes["timeout-minutes"]
addon_id["addon-id"]
version["version"]
instance_type["instance-type"]
disk["disk"]
uri["uri"]
api_token ---> create_postgres
cluster_id ---> create_postgres
version ---> create_postgres
instance_type ---> create_postgres
disk ---> create_postgres
timeout_minutes ---> create_postgres
create_postgres ---> addon_id
create_postgres ---> version
create_postgres ---> instance_type
create_postgres ---> disk
create_postgres ---> uri
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| cluster-id |  | True | Cluster id to attach postgres to |
| version |  | False | Postgres version to provision. |
| instance-type |  | False | Instance type to provision |
| disk |  | False | Disk size in GiB |
| timeout-minutes | 10 | False | Time to wait for the postgres to have a status of `ready` |

## Outputs
| Name | Description |
| --- | --- |
| addon-id | Contains the id of the addon. |
| version | Contains the provisioned postgres version. |
| instance-type | Contains the instance type of postgres. |
| disk | Contains the disk size of postgres. |
| uri | Contains the URI of the postgres to connect to. |

