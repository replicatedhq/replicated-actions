# Archive Channel

```mermaid
---
title: Archive Channel
---
graph LR
archive_channel["Archive Channel"]
replicated_app ---> archive_channel
replicated_api_token ---> archive_channel
channel_name ---> archive_channel
```