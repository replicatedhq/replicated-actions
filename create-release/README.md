# Create Release

```mermaid
---
title: Replicated create release
---
graph LR
replicated_create_release["Replicated create release"]
replicated_app ---> replicated_create_release
replicated_api_token ---> replicated_create_release
yaml_dir ---> replicated_create_release
promote_channel ---> replicated_create_release
version ---> replicated_create_release
replicated_create_release ---> channel_slug
replicated_create_release ---> release_sequence
```
## Inputs
| Name | Default | Required | Description |
| --- | --- | --- | --- |
| replicated-app |  | True | Replicated App Slug. |
| replicated-api-token |  | True | Replicated API Token. |
| yaml-dir | manifests | True | The directory containing multiple yamls for a Replicated release. |
| promote-channel | ${GITHUB_REF} | True | Channel name or id to promote this release to. |
| version | ${GITHUB_SHA::7} | True | Release version |

## Outputs
| Name | Description |
| --- | --- |
| channel-slug | Contains the channel slug. |
| release-sequence | Sequence number of the release. |