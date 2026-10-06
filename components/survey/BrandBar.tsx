import Image from 'next/image'

export default function BrandBar() {
  return (
    <header className="topbar">
      <div className="brand">
        <Image src="/Logo/YFC.webp" alt="YFC" width={300} height={233} className="brand-logo brand-logo-yfc" priority />
        <span className="brand-text">
          YFC-BonEagle
          <br />
          International Inc.
        </span>
      </div>

      <div className="brand brand-product">
        <span className="brand-text brand-text-right">
          <strong>Lightera</strong>
          <br />
          Passive Optical LAN
        </span>
        <Image src="/Logo/Lightera.webp" alt="Lightera" width={200} height={200} className="brand-logo brand-logo-lightera" priority />
      </div>
    </header>
  )
}