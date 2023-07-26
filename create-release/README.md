## Replicated create release

```mermaid
---
title: Replicated create release
---
graph LR
replicated_create_release["Replicated create release"]
app_slug ---> replicated_create_release
api_token ---> replicated_create_release
yaml_dir ---> replicated_create_release
chart ---> replicated_create_release
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
| yaml-dir | manifests | False | The directory containing multiple yamls for a Replicated release. |
| chart |  | False | The Helm chart tarball for a Replicated release |
| promote-channel |  | False | Channel name or id to promote this release to. |
| version | ${GITHUB_SHA::7} | False | Release version |

## Outputs
| Name | Description |
| --- | --- |
| channel-slug | Contains the channel slug. |
| release-sequence | Sequence number of the release. |

