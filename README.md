# `line-sticker-downloader`

Tool that downloads stickers or emojis from the LINE store.

## Requirements

Node 8 or higher

## Usage

1. Find something you want from http://store.line.me
2. Copy the URL to the item (eg `https://store.line.me/emojishop/product/5bfcd255040ab139c41b2d0e/en`)
3. Run `npx line-sticker-downloader <URL> [folder]`, replacing `<URL>` with your URL and `[folder]` with a folder to save them to
4. It will download all the stickers/emoji from that page and save them to the folder.

Example:

```
npx line-sticker-downloader https://store.line.me/emojishop/product/5bfcd255040ab139c41b2d0e/en menhera-emoji-cat
```

## Notes/troubleshooting

- If you don't specify a folder, it will use `stickers` by default.
- The script clicks on each sticker and then waits a bit to see if there's an animated version, and if there is, it downloads the animated version. If it's failing to download animated versions, you can increase the amount of time it waits by using the `--animated-wait-delay` flag:

  ```
  npx line-sticker-downloader --animated-wait-delay 1000 https://store.line.me/stickershop/product/1565020/en gojill-animated
  ```

- If you don't care about checking for animated versions, you can set `--animated-wait-delay` to 0 to speed up the download.

## License

MIT
