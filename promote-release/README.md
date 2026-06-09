## Promote Release

```mermaid
---
title: Promote Release
---
graph LR
promote_release["Promote Release"]
app_slug["app-slug"]
api_token["api-token"]
channel_to["channel-to"]
release_sequence["release-sequence"]
release_version["release-version"]
notify_users["notify-users"]
app_slug ---> promote_release
api_token ---> promote_release
channel_to ---> promote_release
release_sequence ---> promote_release
release_version ---> promote_release
notify_users ---> promote_release
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| channel-to |  | True | The slug of the Channel to promote the release sequence to. |
| release-sequence |  | True | The release sequence number to promote. |
| release-version |  | True | The version field of the Release to promote. |
| notify-users |  | False | Send a notification to channel subscribers when the release is promoted. Defaults to false. |

## Outputs
| Name | Description |
| --- | --- |

