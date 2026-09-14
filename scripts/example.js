export default {
  name: 'example',

  async onMessage(ctx) {
    if (ctx.text === `${ctx.config.prefix}hello`) {
      await ctx.reply(
        `Hello! 👋\n\nRepanOS v${ctx.config.version}\nBaileys Script Runner`
      )
    }

    if (ctx.text === `${ctx.config.prefix}info`) {
      await ctx.reply([
        '╭─「 REPANOS 」',
        `│ Version: ${ctx.config.version}`,
        `│ Prefix : ${ctx.config.prefix}`,
        `│ Group  : ${ctx.isGroup ? 'Yes' : 'No'}`,
        '╰────────────'
      ].join('\n'))
    }
  }
}