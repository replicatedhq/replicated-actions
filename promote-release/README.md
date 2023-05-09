# Promote a Release

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