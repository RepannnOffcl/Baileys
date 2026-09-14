# Scripts

Letakkan script `.js` di folder ini.

Format minimal:

```js
export default {
  name: 'nama-script',

  async onMessage(ctx) {
    if (ctx.text === '.hello') {
      await ctx.reply('Hello!')
    }
  }
}
```

Satu script error tidak menghentikan script lainnya.
