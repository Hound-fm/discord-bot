# discord-bot
Community discord bot for hound.fm

### Prefixes

Default prefixes: `~` and `.`

Don't forget to include the prefix at the start of the message:
```python
# Syntax
{prefix}command <args>
# Examlples
~queue now
.queue now
```

### Commands
Anyone can use this commands:

| name| args | description |
|---|---|---|
| `help` |  | Show command list and other useful information. |
| `about` |  | Show project information. |
| `search` | query: Lbry url, id or title  | Get information of lbry stream |

### Player commands

Commands to control the player. You need to **join** a **voice channel** before using any of this commands.

| name| args | description |
|---|---|---|
| `play` | query: Lbry url, id or title | Add stream to queue. If there is no stream playing it will start playing. |
| `skip` | | Play next stream in queue.
| `stop` | | Disconnect from voice channel and clear queue.
| `queue` | | Show current queue of streams.
| `queue now` | | Show current playing stream on queue.
