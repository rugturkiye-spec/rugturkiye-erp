'use client'

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [message, setMessage] = useState('')

  async function searchBarcode(value: string) {
    console.log('GELEN:', value)
console.log('TEMIZ:', value.trim())
    setBarcode(value)
    setProduct(null)
    setMessage('')

    const clean = value.trim()

    if (clean.length < 5) return

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', clean)
      .maybeSingle()
      console.log('DATA:', data)
console.log('ERROR:', error)

    if (error) {
      setMessage('Hata: ' + error.message)
      return
    }

    if (!data) {
      setMessage('Ürün bulunamadı')
      return
    }

 setProduct(data)
  }

  return (
    <main style={{ padding: 40 }}>
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

      {message && <p>{message}</p>}

      {product && (
        <div style={{ marginTop: 20 }}>
          <h2>📦 Ürün Bilgileri</h2>
          <div
  style={{
    width: 180,
    height: 180,
    border: '2px dashed #ccc',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    color: '#777'
  }}
>
  Fotoğraf Yok
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
  <p><b>Reyon:</b> {product.reyon_code}</p>
  <p><b>Ölçü:</b> {product.length_cm} x {product.width_cm} cm</p>
  <p><b>M2:</b> {product.m2}</p>
  <p><b>Fotoğraf:</b> {product.photo_status}</p>
  <p><b>Yükleme:</b> {product.upload_status}</p>
</div>
        </div>
      )}
    </main>
  )
}
