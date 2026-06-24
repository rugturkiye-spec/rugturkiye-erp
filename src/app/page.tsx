'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
function beep(type: 'success' | 'error') {
  const ctx = new AudioContext()

  const playTone = (
    freq: number,
    start: number,
    duration: number
  ) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.value = freq
    osc.type = 'square'

    gain.gain.value = 0.2

    osc.start(ctx.currentTime + start)
    osc.stop(ctx.currentTime + start + duration)
  }

  if (type === 'success') {
  playTone(1800, 0, 0.08)
} else {
  playTone(180, 0, 0.25)
  playTone(180, 0.35, 0.25)
  playTone(180, 0.70, 0.25)
}
}
export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [flash, setFlash] = useState('')
  const [logs, setLogs] = useState<any[]>([])
  const [action, setAction] = useState('SCAN')
  const actionRef = useRef('SCAN')
  function changeAction(value: string) {
  setAction(value)
  actionRef.current = value
}
async function loadLogs() {
  const { data } = await supabase
    .from('scan_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (data) {
    setLogs(data)
  }
}

useEffect(() => {
  loadLogs()
}, [])
  async function searchBarcode(value: string) {
  setBarcode(value)

  if (timerRef.current) {
    clearTimeout(timerRef.current)
  }

  timerRef.current = setTimeout(async () => {
    const clean = value.trim()

    if (clean.length < 5) return

    setProduct(null)
    setMessage('')

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', clean)
      .maybeSingle()

    if (error) {
      setMessage('Hata: ' + error.message)
      return
    }

    if (!data) {
      setMessage('Ürün bulunamadı')
      setFlash('red')
setTimeout(() => setFlash(''), 1000)
      beep('error')
      setBarcode('')
      inputRef.current?.focus()
      return
    }

    setProduct(data)
   const { error: logError } = await supabase
  .from('scan_logs')
  .insert({
    sku: data.sku,
    barcode: data.barcode,
    stock_name: data.stock_name,
    reyon_code: data.reyon_code,
    current_status: data.current_status,
    action: actionRef.current
  })

console.log('SCAN LOG ERROR:', logError)
if (logError) {
  setMessage('Log hatası: ' + logError.message)
}
setFlash('green')
setTimeout(() => setFlash(''), 1000)
beep('success')
loadLogs()
setHistory(prev => [
  {
    time: new Date().toLocaleTimeString(),
    sku: data.sku,
    name: data.stock_name,
    action: actionRef.current,
  },
  ...prev,
].slice(0, 20))

    setTimeout(() => {
      setBarcode('')
      inputRef.current?.focus()
    }, 500)
  }, 300)
}

  return (
    <main
  style={{
    padding: 40,
    minHeight: '100vh',
    background:
      flash === 'green'
        ? '#d4ffd4'
        : flash === 'red'
        ? '#ffd4d4'
        : 'white',
    transition: '0.15s'
  }}
>
      <h1>RugTurkey ERP</h1>

      <input
      ref={inputRef}
        value={barcode}
        onChange={(e) => searchBarcode(e.target.value)}
        placeholder="Barkod ara..."
        style={{
          padding: 12,
          width: 400,
          border: '1px solid #ccc',
          borderRadius: 8,
        }}
      />

    <div style={{ marginTop: 8, fontWeight: 700 }}>
  Seçili işlem: {action}
</div>  
<div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
  <button onClick={() => changeAction('SCAN')}>
    SCAN
  </button>
    <button
  onClick={() => {
    changeAction('IN')
}}
>
GİRİŞ
</button>

<button onClick={() => changeAction('OUT')}>
  ÇIKIŞ
</button>
   

</div>
  {message && (
  <div
    style={{
      marginTop: 15,
      padding: 15,
      background: '#fee2e2',
      color: '#991b1b',
      fontWeight: 800,
      fontSize: 24,
      borderRadius: 10,
      width: 500,
    }}
  >
    ❌ {message}
  </div>
)}
      {product && (
        <div style={{ marginTop: 20 }}>
          <h2>📦 Ürün Bilgileri</h2>
          <div
  style={{
  width: 250,
  height: 250,
    border: '2px dashed #ccc',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    color: '#777'
  }}
>

  {product.photo_url ? (
  <img
    src={product.photo_url}
    alt={product.stock_name}
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      borderRadius: 10,
    }}
  />
) : (
<span>Fotoğraf Yok</span>
)}
</div>
          <hr style={{ marginBottom: 15 }} />
          <div style={{
  border: '1px solid #ddd',
  borderRadius: 12,
  padding: 20,
  width: 700,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  background: '#fafafa'
}}>
  <h2 style={{ margin: 0 }}>
  SKU {product.sku}
</h2>

<p
  style={{
    marginTop: 5,
    fontSize: 20,
    fontWeight: 600
  }}
>
  {product.stock_name}
</p>
  <p><b>Barkod:</b> {product.barcode}</p>
  <p><b>Ürün:</b> {product.stock_name}</p>
  <p><b>Konum:</b> {product.current_location}</p>
  <p>
  <b>Durum:</b>{' '}
  <span
    style={{
      padding: '4px 10px',
      borderRadius: 999,
      background: product.current_status === 'STOKTA' ? '#d1fae5' : '#fee2e2',
      color: product.current_status === 'STOKTA' ? '#065f46' : '#991b1b',
      fontWeight: 700
    }}
  >
    {product.current_status}
  </span>
</p>
  <div
  style={{
    marginTop: 12,
    marginBottom: 12,
    padding: 20,
    background: '#111827',
    color: 'white',
    fontSize: 64,
    fontWeight: 900,
    borderRadius: 16,
    textAlign: 'center',
    width: 220,
  }}
>
  {product.reyon_code}
</div>
  <p><b>Ölçü:</b> {product.length_cm} x {product.width_cm} cm</p>
  <p><b>M2:</b> {product.m2}</p>
  <p><b>Fotoğraf:</b> {product.photo_status}</p>
  <p><b>Yükleme:</b> {product.upload_status}</p>
</div>
        </div>
      )}
      <div style={{ marginTop: 30 }}>
  <h3>Son Okutulanlar</h3>
  <div style={{ marginTop: 30 }}>
  <h3>Kalıcı Hareket Geçmişi</h3>

    {logs.map((log, i) => (
  <div
    key={i}
    style={{
      padding: 8,
      borderBottom: '1px solid #ddd'
    }}
  >
    <span
      style={{
        fontWeight: 800,
        color:
          log.action === 'IN'
            ? '#065f46'
            : log.action === 'OUT'
            ? '#991b1b'
            : '#111827'
      }}
    >
      {log.action}
    </span>

    {' - '}
    {new Date(log.created_at).toLocaleTimeString()}
    {' - '}
    {log.sku}
    {' - '}
    {log.stock_name}
    {' - '}
    {log.reyon_code}
  </div>
  ))}
</div>

  {history.map((item, i) => (
    <div
      key={i}
      style={{
        padding: 8,
        borderBottom: '1px solid #ddd'
      }}
    >
      <span
  style={{
    fontWeight: 800,
    color:
      item.action === 'IN'
        ? '#065f46'
        : item.action === 'OUT'
        ? '#991b1b'
        : '#111827',
  }}
>
  {item.action}
</span>
{' - '}
{item.time} - {item.sku} - {item.name}
    </div>
  ))}
</div>
    </main>
  )
}
