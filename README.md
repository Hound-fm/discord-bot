# discord-bot
Community discord bot for hound.fm

### Prefixes

> Default prefixes: `~` and `.`

Don't forget to include the prefix at the start of the message:
```python
# Syntax
{prefix}command <args>
# Examlples
~help
~queue now
.queue now
```

### Commands
Anyone can use this commands:

| name| alias | args | description |
|---|---|---|---|
| `help` | `about` |  | Show help message and useful information. |
| `search` | | query: Lbry url, id or title  | Get information of lbry stream |

### Player commands

Commands to control the player. You need to **join** a **voice channel** before using any of this commands.

| name| alias | args | description |
|---|---|---|---|
| `play` | `p` | query: Lbry url, id or title | Add stream to queue. If there is no stream playing it will start playing. |
| `skip` | `next` | | Play next stream in queue.
| `stop` | `clear`, `disconnect` | | Disconnect from voice channel and clear queue.
| `queue` | | index: Numeric index on queue | Show current queue of streams. Pass index to show a specific stream.
| `queue now` | | | Show current playing stream on queue.
