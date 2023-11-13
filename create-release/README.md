## Replicated create release

```mermaid
---
title: Replicated create release
---
graph LR
replicated_create_release["Replicated create release"]
app_slug["app-slug"]
api_token["api-token"]
chart["chart"]
yaml_dir["yaml-dir"]
promote_channel["promote-channel"]
version["version"]
channel_slug["channel-slug"]
release_sequence["release-sequence"]
app_slug ---> replicated_create_release
api_token ---> replicated_create_release
chart ---> replicated_create_release
yaml_dir ---> replicated_create_release
promote_channel ---> replicated_create_release
version ---> replicated_create_release
replicated_create_release ---> channel_slug
replicated_create_release ---> release_sequence
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| app-slug |  | True | App Slug. |
| api-token |  | True | API Token. |
| chart |  | False | Path to the helm chart (One of `chart` or `yaml-dir` is required). |
| yaml-dir |  | False | The directory containing multiple yamls for a Replicated release (One of `chart` or `yaml-dir` is required). |
| promote-channel |  | False | Channel name or id to promote this release to. |
| version |  | False | Release version |

## Outputs
| Name | Description |
| --- | --- |
| channel-slug | Contains the channel slug. |
| release-sequence | Sequence number of the release. |

