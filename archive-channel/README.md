## Archive Channel

```mermaid
---
title: Archive Channel
---
graph LR
archive_channel["Archive Channel"]
app_slug ---> archive_channel
api_token ---> archive_channel
channel_slug ---> archive_channel
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| channel-slug |  | True | The slug of the channel to archive. |

## Outputs
| Name | Description |
| --- | --- |

