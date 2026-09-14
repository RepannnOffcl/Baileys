# RepanOS — Baileys Script Runner

**Baileys by RepanOffcl**

RepanOS adalah runner/engine untuk menjalankan script WhatsApp berbasis Baileys.
Core runner dipisahkan dari script sehingga project tidak perlu memasukkan semua
fitur bot ke satu file besar.

## Requirement

- Node.js 20+
- WhatsApp biasa atau WhatsApp Business
- Internet stabil

## Install

```bash
npm install
cp .env.example .env
npm start
```

## Pairing Code

Edit `.env`:

```env
USE_QR=false
PAIRING_NUMBER=628xxxxxxxxxx
```

Nomor gunakan format internasional tanpa `+`.

## QR

```env
USE_QR=true
PAIRING_NUMBER=
```

## Menambah Script

Semua script diletakkan di:

```text
scripts/
```

Contoh:

```js
export default {
  name: 'hello',
  async onMessage(ctx) {
    if (ctx.text === '.hello') {
      await ctx.reply('Hello dari RepanOS!')
    }
  }
}
```

Setelah file dimasukkan ke `scripts/`, restart runner.

## Context Script

Setiap script menerima:

```js
{
  sock,
  message,
  text,
  jid,
  isGroup,
  sender,
  reply,
  config
}
```

## Identitas

Core menggunakan identitas client:

```text
RepanOS / Chrome / <version>
```

Nama perangkat yang ditampilkan oleh WhatsApp dapat berbeda karena tampilan
device dikontrol oleh WhatsApp. Jangan mengandalkan tampilan UI tertentu.

## Arsitektur

```text
RepanOS
├── Core Engine
├── WhatsApp Connection
├── Script Loader
├── Session Manager
└── Scripts
```

Core tidak mengandung command bot tertentu.

## Stabilitas

Runner memiliki:
- persistent authentication
- auto reconnect
- reconnect backoff
- isolated script errors
- uncaught exception logging
- unhandled rejection logging
- graceful SIGINT/SIGTERM
- dynamic script loading saat startup
- text fallback untuk script interactive sederhana

Tidak ada implementasi yang dapat menjamin 100% bebas error atau menjamin
semua fitur WhatsApp selalu tersedia. API/server WhatsApp dapat berubah.

## GitHub

Jangan commit `.env`, session, data, atau logs.
File tersebut sudah dimasukkan ke `.gitignore`.

## Catatan penggunaan

Gunakan secara wajar dan patuhi aturan WhatsApp. Hindari spam dan automation
yang melanggar ketentuan layanan.
