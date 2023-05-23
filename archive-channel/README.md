## Archive Channel

```mermaid
---
title: Archive Channel
---
graph LR
archive_channel["Archive Channel"]
app_slug ---> archive_channel
replicated_api_token ---> archive_channel
channel_name ---> archive_channel
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | Replicated App Slug. |
| replicated-api-token |  | True | Replicated API Token. |
| channel-name |  | True | The name of the channel to archive. |

## Outputs
| Name | Description |
| --- | --- |

