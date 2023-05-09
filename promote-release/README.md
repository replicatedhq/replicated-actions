# Promote a Release

```mermaid
---
title: Promote Release
---
graph LR
replicated_promote_release["Replicated promote Release"]
replicated_app ---> replicated_promote_release
replicated_api_token ---> replicated_promote_release
channel_from ---> replicated_promote_release
channel_to ---> replicated_promote_release
release_version ---> replicated_promote_release
```