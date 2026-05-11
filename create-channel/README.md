## Create Channel

```mermaid
---
title: Create Channel
---
graph LR
create_channel["Create Channel"]
api_token["api-token"]
app_slug["app-slug"]
channel_name["channel-name"]
build_airgap_automatically["build-airgap-automatically"]
channel_id["channel-id"]
channel_slug["channel-slug"]
api_token ---> create_channel
app_slug ---> create_channel
channel_name ---> create_channel
build_airgap_automatically ---> create_channel
create_channel ---> channel_id
create_channel ---> channel_slug
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| app-slug |  | True | App Slug. |
| channel-name |  | True | The name of the channel to create. |
| build-airgap-automatically | false | False | Build airgap bundles automatically for releases promoted to this channel. |

## Outputs
| Name | Description |
| --- | --- |
| channel-id | Contains the channel id. |
| channel-slug | Contains the channel slug. |

