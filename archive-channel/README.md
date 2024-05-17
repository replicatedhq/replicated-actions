## Archive Channel

```mermaid
---
title: Archive Channel
---
graph LR
archive_channel["Archive Channel"]
api_token["api-token"]
app_slug["app-slug"]
channel_slug["channel-slug"]
api_token ---> archive_channel
app_slug ---> archive_channel
channel_slug ---> archive_channel
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| api-token |  | True | API Token. |
| app-slug |  | True | App Slug. |
| channel-slug |  | True | The slug of the channel to archive. |

## Outputs
| Name | Description |
| --- | --- |

