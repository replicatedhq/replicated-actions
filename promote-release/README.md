## Promote Release

```mermaid
---
title: Promote Release
---
graph LR
promote_release["Promote Release"]
replicated_app ---> promote_release
replicated_api_token ---> promote_release
channel_to ---> promote_release
release_sequence ---> promote_release
release_version ---> promote_release
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| replicated-app |  | True | Replicated App Slug. |
| replicated-api-token |  | True | Replicated API Token. |
| channel-to |  | True | The name of the Channel to promote the release sequence to. |
| release-sequence |  | True | The release sequence number to promote. |
| release-version |  | True | The version field of the Release to promote. |

## Outputs
| Name | Description |
| --- | --- |

