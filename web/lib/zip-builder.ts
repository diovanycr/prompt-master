function crc32(data: Uint8Array): number {
  if (!(crc32 as any)._t) {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
      t[i] = c
    }
    ;(crc32 as any)._t = t
  }
  const t: Uint32Array = (crc32 as any)._t
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) crc = t[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export interface ZipEntry {
  name: string
  data: Uint8Array
}

export function buildZip(files: ZipEntry[]): Uint8Array {
  const enc = new TextEncoder()
  let offset = 0
  const locals: { bytes: Uint8Array; nameBytes: Uint8Array; crc: number; sz: number; offset: number }[] = []

  for (const file of files) {
    const nameBytes = enc.encode(file.name)
    const data = file.data
    const crc = crc32(data)
    const sz = data.length
    const local = new Uint8Array(30 + nameBytes.length + sz)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true)
    lv.setUint16(6, 0, true); lv.setUint16(8, 0, true)
    lv.setUint16(10, 0, true); lv.setUint16(12, 0, true)
    lv.setUint32(14, crc, true); lv.setUint32(18, sz, true)
    lv.setUint32(22, sz, true); lv.setUint16(26, nameBytes.length, true)
    lv.setUint16(28, 0, true)
    local.set(nameBytes, 30); local.set(data, 30 + nameBytes.length)
    locals.push({ bytes: local, nameBytes, crc, sz, offset })
    offset += local.length
  }

  const cdStart = offset
  const centrals: Uint8Array[] = []
  for (const { nameBytes, crc, sz, offset: lo } of locals) {
    const cd = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(cd.buffer)
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true)
    cv.setUint16(6, 20, true); cv.setUint16(8, 0, true)
    cv.setUint16(10, 0, true); cv.setUint16(12, 0, true)
    cv.setUint16(14, 0, true); cv.setUint32(16, crc, true)
    cv.setUint32(20, sz, true); cv.setUint32(24, sz, true)
    cv.setUint16(28, nameBytes.length, true); cv.setUint16(30, 0, true)
    cv.setUint16(32, 0, true); cv.setUint16(34, 0, true)
    cv.setUint16(36, 0, true); cv.setUint32(38, 0, true)
    cv.setUint32(42, lo, true); cd.set(nameBytes, 46)
    centrals.push(cd); offset += cd.length
  }

  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(4, 0, true)
  ev.setUint16(6, 0, true); ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true); ev.setUint32(12, offset - cdStart, true)
  ev.setUint32(16, cdStart, true); ev.setUint16(20, 0, true)

  const out = new Uint8Array(offset + 22)
  let pos = 0
  for (const { bytes } of locals) { out.set(bytes, pos); pos += bytes.length }
  for (const cd of centrals) { out.set(cd, pos); pos += cd.length }
  out.set(eocd, pos)
  return out
}

export function downloadBlob(bytes: Uint8Array, filename: string, mime = 'application/octet-stream') {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
