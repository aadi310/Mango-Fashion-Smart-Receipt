"use client";

/**
 * Mango x RDEP — Smart receipt
 *
 * Concept: a poster on a light canvas. Logo + greeting, a sleek interactive rating card right at
 * the top, then the actual receipt as torn thermal paper (mono lines, dotted leaders, [+] / [−] toggles).
 * White cards with soft shadows pop off the canvas. After the receipt: profile, exchange, "Reach us"
 * and a store card (address always visible, one toggle shows / hides only the contact details).
 */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { JetBrains_Mono } from "next/font/google";

const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap" });
const USE_RECEIPT_MONO = true;
const monoClass = USE_RECEIPT_MONO ? mono.className : "tabular-nums";

const BRAND_STACK = `"MangoSans", Arial, "Helvetica Neue", Helvetica, sans-serif`;

const FONT_FACES = `
@font-face{font-family:"MangoSans";font-weight:400;font-style:normal;font-display:swap;src:url("/fonts/MangoSans%20Regular.ttf") format("truetype")}
@font-face{font-family:"MangoSans";font-weight:700;font-style:normal;font-display:swap;src:url("/fonts/MangoSans-Bold.ttf") format("truetype")}
.mg-root{font-family:${BRAND_STACK}}
.mg-display{font-family:${BRAND_STACK};font-weight:700}

/* Phone press feedback: every button and link dips slightly while touched */
.mg-root a,.mg-root button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.mg-root a,.mg-root button:not(:disabled){transition:transform .12s ease,background-color .2s ease,color .2s ease,border-color .2s ease}
.mg-root a:active,.mg-root button:not(:disabled):active{transform:scale(.97)}

/* Rating stars flash in a wave until the first tap */
@keyframes mg-star-flash{0%,100%{fill:var(--mg-wash);transform:scale(1)}45%{fill:var(--mg-brown);transform:scale(1.2)}}
.mg-star-flash{animation:mg-star-flash 1.6s ease-in-out infinite}

@media (prefers-reduced-motion:reduce){
  .mg-star-flash{animation:none}
  .mg-root a,.mg-root button:not(:disabled){transition:none}
  .mg-root a:active,.mg-root button:not(:disabled):active{transform:none}
}
`;

/* Brand tokens. */
const theme = {
  "--mg-brown": "#8B6F5E",
  "--mg-brown-dark": "#6E5445",
  "--mg-ink": "#1A1A1A",
  "--mg-canvas": "#F5F5F5",
  "--mg-page": "#EAEAEA",
  "--mg-wash": "#F8F8F8",
  "--mg-press": "#EBEBEB",
  "--mg-sand": "#D2BBAA",
  "--mg-line": "rgba(139,111,94,0.2)",
  "--mg-edge": "rgba(139,111,94,0.75)",
} as CSSProperties;

/* Assets + links */
const DEFAULT_MANGO_LOGO = "/images/design-mode/mango.png";
const DEFAULT_RDEP_LOGO = "/images/design-mode/RDEP-logo.png";
const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/mango/";
const DEFAULT_STORE_LOCATOR_URL = "https://shop.mango.com/in";

/* ------------------------------- types ------------------------------------------- */
export interface MangoItem {
  name: string;
  size: string;
  sku: string;
  hsn: string;
  qty: number;
  mrp: number;
  discount: number;
}

export interface MangoReceiptData {
  invoiceNo: string;
  date: string;
  customer: { name: string; mobile: string; email: string };
  items: MangoItem[];
  sgst: number;
  cgst: number;
  payment: { mode: string; ref: string };
  store: { name: string; address: string; email: string; phone: string; gstin: string; associate: string };
  registeredOffice: string;
  exchange: { days: number; points: string[] };
  callTo: string;
  emailTo: string;
}

export interface ProfileValues {
  name: string;
  email: string;
  gender: string;
  birthday: string;
  anniversary: string;
  offers: boolean;
}

export interface FeedbackValues {
  invoiceNo: string;
  overall: number;
  categories: { service: number; product: number; sizes: number; value: number };
  comment: string;
}

export interface MangoReceiptProps {
  data?: MangoReceiptData;
  receipts?: MangoReceiptData[];
  qrSrc?: string;
  logoSrc?: string;
  rdepLogoSrc?: string;
  instagramUrl?: string;
  storeLocatorUrl?: string;
  onDownload?: (receipt: MangoReceiptData) => void;
  onSendEmail?: (email: string, receipt: MangoReceiptData) => void;
  onSaveProfile?: (values: ProfileValues) => void;
  onSubmitFeedback?: (values: FeedbackValues) => void;
  onSelectReceipt?: (invoiceNo: string) => void;
}

type IconName =
  | "history" | "mail" | "download" | "phone" | "instagram" | "pin" | "store"
  | "close" | "check" | "arrow" | "chevron" | "user" | "receipt" | "tax" | "directions" | "call" | "qr";
type ModalId = "history" | "email" | "qr" | null;

interface HistoryRow {
  invoiceNo: string;
  date: string;
  storeName: string;
  amount: number;
  items: number;
  current: boolean;
}

/* ------------------------------- helpers ----------------------------------------- */
const inr = (n: number): string => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const trim = (n: number): string => String(Number(n.toFixed(2)));
const round2 = (n: number): number => Math.round(n * 100) / 100;
const netOf = (i: MangoItem): number => round2(i.mrp * i.qty - i.discount);
const emailOk = (s: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function totalsOf(r: MangoReceiptData) {
  const subtotal = round2(r.items.reduce((a, i) => a + i.mrp * i.qty, 0));
  const discount = round2(r.items.reduce((a, i) => a + i.discount, 0));
  return { subtotal, discount, total: round2(subtotal - discount), pieces: r.items.reduce((a, i) => a + i.qty, 0) };
}

function dateValue(d: string): number {
  const [dd, mm, yyyy] = d.split(" ")[0].split("-").map(Number);
  return Date.UTC(yyyy, (mm || 1) - 1, dd || 1);
}

function seeded(seed: string): () => number {
  let s = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    s ^= seed.charCodeAt(i);
    s = Math.imul(s, 16777619);
  }
  s = s || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/* ---------------------------- downloadable receipt ------------------------------- */
const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildReceiptHtml(r: MangoReceiptData, logoSrc: string, rdepLogoSrc: string): string {
  const abs = (p: string) => (/^(https?:|data:)/.test(p) ? p : `${window.location.origin}${encodeURI(p)}`);
  const t = totalsOf(r);
  const rows = r.items
    .map(
      (i) => `<tr>
      <td><div class="n">${esc(i.name)}</div><div class="s">Size ${esc(i.size)} &middot; SKU ${esc(i.sku)} &middot; HSN ${esc(i.hsn)}</div></td>
      <td class="r">${i.qty}</td><td class="r">${inr(i.mrp)}</td><td class="r">&minus;${inr(i.discount)}</td><td class="r b">${inr(netOf(i))}</td></tr>`,
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mango Receipt ${esc(r.invoiceNo)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,'Helvetica Neue',sans-serif;font-size:14px;color:#8B6F5E;background:#F5F5F5;max-width:760px;margin:0 auto;padding:24px}
.bar{display:flex;justify-content:flex-end;margin-bottom:16px}
.bar button{background:#1A1A1A;color:#fff;border:0;border-radius:10px;padding:10px 18px;font:700 13px Arial,sans-serif;cursor:pointer}
.sheet{background:#fff;border-radius:20px;padding:28px}
.head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:16px;border-bottom:3px solid #1A1A1A}
.head img{height:34px;width:auto}
h1{font-size:22px;color:#1A1A1A;text-transform:uppercase;letter-spacing:1px;margin-top:12px}
.meta{text-align:right;font-size:12px;line-height:1.8}
table{width:100%;border-collapse:collapse;margin-top:20px}
th{text-align:left;font-size:11px;letter-spacing:.8px;padding:8px;background:#F5F5F5;border-bottom:1px solid rgba(139,111,94,.3)}
td{padding:12px 8px;border-bottom:1px solid rgba(139,111,94,.3);vertical-align:top;font-size:13px}
.r{text-align:right}.b{font-weight:700;color:#1A1A1A}.n{text-transform:uppercase;font-weight:700;color:#1A1A1A}.s{font-size:11px;margin-top:3px}
.sum{margin:18px 0 0 auto;width:300px}
.row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px}
.total{display:flex;justify-content:space-between;align-items:baseline;border-top:3px solid #1A1A1A;margin-top:10px;padding-top:12px;color:#1A1A1A;font-weight:700}
.total strong{font-size:26px}
.pay{margin-top:18px;background:#1A1A1A;color:#fff;border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;font-size:14px}
.store{margin-top:24px;font-size:12px;line-height:1.7;border-top:1px solid rgba(139,111,94,.3);padding-top:14px}
.foot{margin-top:22px;text-align:center;font-size:12px}.foot img{height:20px;vertical-align:middle;margin-left:6px}
@media print{.bar{display:none}body{max-width:none;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{border-radius:0}}
</style></head><body>
<div class="bar"><button onclick="window.print()">Save as PDF</button></div>
<div class="sheet">
<div class="head"><div><img src="${esc(abs(logoSrc))}" alt="Mango" onerror="this.style.display='none'"><h1>Tax invoice</h1></div>
<div class="meta"><div><b>Invoice no:</b> ${esc(r.invoiceNo)}</div><div><b>Date:</b> ${esc(r.date)}</div><div><b>Customer:</b> ${esc(r.customer.name)}</div><div><b>Mobile:</b> ${esc(r.customer.mobile)}</div></div></div>
<table><thead><tr><th style="width:44%">ITEM</th><th class="r">QTY</th><th class="r">UNIT PRICE</th><th class="r">DISCOUNT</th><th class="r">NET AMOUNT</th></tr></thead><tbody>${rows}</tbody></table>
<div class="sum">
<div class="row"><span>Subtotal (MRP)</span><b>&#8377;${inr(t.subtotal)}</b></div>
<div class="row"><span>Discount</span><b>&minus;&#8377;${inr(t.discount)}</b></div>
<div class="row"><span>Includes SGST</span><b>&#8377;${inr(r.sgst)}</b></div>
<div class="row"><span>Includes CGST</span><b>&#8377;${inr(r.cgst)}</b></div>
<div class="total"><span>Total paid</span><strong>&#8377;${inr(t.total)}</strong></div></div>
<div class="pay"><span>Payment method &middot; ${esc(r.payment.mode)} &ndash; ${esc(r.payment.ref)}</span><b>&#8377;${inr(t.total)}</b></div>
<div class="store"><b>${esc(r.store.name)}</b><br>${esc(r.store.address)}<br>${esc(r.store.email)} &middot; ${esc(r.store.phone)}<br>GSTIN: ${esc(r.store.gstin)}<br>Registered office: ${esc(r.registeredOffice)}</div>
<div class="foot">Thank you for shopping at Mango<br><br>Powered by <img src="${esc(abs(rdepLogoSrc))}" alt="rdep" onerror="this.style.display='none'"></div>
</div></body></html>`;
}

function downloadReceipt(r: MangoReceiptData, logoSrc: string, rdepLogoSrc: string) {
  const blob = new Blob([buildReceiptHtml(r, logoSrc, rdepLogoSrc)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Mango_Receipt_${r.invoiceNo}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* -------------------------------- Sample Data ----------------------------------- */
const halfTax = (total: number): number => Math.floor(((total - total / 1.18) / 2) * 100) / 100;

const SAMPLE_COMMON = {
  customer: { name: "Sagar H P", mobile: "9620921294", email: "sagar.p@proenx.com" },
  store: {
    name: "Mango Store Ambience Mall",
    address: "C-36, Ambience Mall, Gurgaon, NH-8 122010, Gurugram, Haryana",
    email: "contact@mango.com",
    phone: "01244665318",
    gstin: "06AAOCR0097H1Z4",
    associate: "Rohit",
  },
  registeredOffice:
    "1/1, 4th Floor, Cabin 1, Vinayaka Towers, Gandhinagar, K. G. Road, Bangalore, Bangalore North, Karnataka, India, 560009",
  exchange: {
    days: 30,
    points: [
      "Items can be exchanged within 30 days of purchase with this receipt.",
      "Products must be unworn, unwashed and carry all original tags.",
      "Exchange is for the same or a higher value item; any price difference is payable.",
      "Items bought during the end of season sale, innerwear and accessories are not exchangeable.",
    ],
  },
  callTo: "+911244665318",
  emailTo: "contact@mango.com",
};

export const sampleMangoReceipts: MangoReceiptData[] = [
  {
    ...SAMPLE_COMMON,
    invoiceNo: "20260626000154",
    date: "14-07-2026 11:14:04",
    items: [{ name: "LINEN-COTTON BLEND STRIPE SHIRT", size: "M", sku: "27061231", hsn: "62032090", qty: 1, mrp: 4290, discount: 1716 }],
    sgst: halfTax(2574),
    cgst: halfTax(2574),
    payment: { mode: "CASH", ref: "REF98765" },
  },
  {
    ...SAMPLE_COMMON,
    invoiceNo: "20260526000112",
    date: "26-05-2026 18:41:22",
    store: {
      ...SAMPLE_COMMON.store,
      name: "Mango Junction Mall",
      address: "Junction Mall, City Center, Durgapur, WB",
    },
    items: [
      { name: "RELAXED FIT STRAIGHT JEANS", size: "32", sku: "17081052", hsn: "62034200", qty: 1, mrp: 5990, discount: 1200 },
      { name: "TEXTURED COTTON T-SHIRT", size: "L", sku: "27045518", hsn: "61091000", qty: 1, mrp: 2290, discount: 0 },
    ],
    sgst: halfTax(7080),
    cgst: halfTax(7080),
    payment: { mode: "CARD", ref: "REF40211" },
  },
  {
    ...SAMPLE_COMMON,
    invoiceNo: "20260203000047",
    date: "03-02-2026 14:09:50",
    store: {
      ...SAMPLE_COMMON.store,
      name: "Mango Quest Mall",
      address: "33, Syed Amir Ali Ave, Park Circus, Kolkata, WB",
    },
    items: [{ name: "BELTED MIDI DRESS", size: "S", sku: "37057903", hsn: "62044990", qty: 1, mrp: 7990, discount: 0 }],
    sgst: halfTax(7990),
    cgst: halfTax(7990),
    payment: { mode: "UPI", ref: "REF77310" },
  },
];

/* -------------------------------- icons ------------------------------------------ */
const STAR_PATH = "m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.2 2 9.3l6.9-1z";
const PATHS: Record<IconName, ReactNode> = {
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  store: (
    <>
      <path d="M3 9 4.5 4h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  receipt: (
    <>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </>
  ),
  tax: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" />
    </>
  ),
  directions: (
    <>
      <path d="M9 18l6-6-6-6" />
    </>
  ),
  call: (
    <>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 21h3" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m5 12 5 5 9-10" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
};

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

/* ------------------------- placeholder QR ---------------------------------------- */
function PlaceholderQR({ seed }: { seed: string }) {
  const N = 25;
  const cells = useMemo(() => {
    const rnd = seeded(seed);
    const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
    const out: [number, number][] = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rnd() > 0.5) out.push([x, y]);
    return out;
  }, [seed]);
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} fill="#1A1A1A" shapeRendering="crispEdges" role="img" aria-label="Receipt QR code" className="h-full w-full">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />
      ))}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}

/* --------------------------------- shared ---------------------------------------- */
const onPaper = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mg-ink)]";
const lift = "border border-black/5 shadow-[0_10px_28px_-14px_rgba(26,26,26,0.35)]";

const fieldInput =
  "w-full rounded-none border-0 border-b-2 border-[var(--mg-edge)] bg-transparent px-0 py-2.5 text-base text-[var(--mg-ink)] outline-none transition-colors [-webkit-appearance:none] [appearance:none] placeholder:text-[var(--mg-brown)] focus:border-[var(--mg-ink)]";
const fieldLabel = "mb-1 block text-[13px] text-[var(--mg-brown)]";
const solidBtn = `w-full rounded-xl bg-[var(--mg-ink)] py-4 text-[13px] font-bold uppercase tracking-[0.12em] text-white transition-colors active:bg-[var(--mg-brown)] [@media(hover:hover)]:hover:bg-[var(--mg-brown)] motion-reduce:transition-none ${onPaper}`;
const outlineBtn = `flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--mg-ink)] bg-white py-4 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--mg-ink)] transition-colors active:border-[var(--mg-ink)] [@media(hover:hover)]:hover:border-[var(--mg-ink)] active:bg-[var(--mg-ink)] [@media(hover:hover)]:hover:bg-[var(--mg-ink)] active:text-white [@media(hover:hover)]:hover:text-white motion-reduce:transition-none ${onPaper}`;

const DESIGN_W = 400;
const PHONE_MAX = 520;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useFitScale(): number {
  const [scale, setScale] = useState(1);
  useIsoLayoutEffect(() => {
    const update = () => {
      const w = document.documentElement.clientWidth;
      setScale(w <= PHONE_MAX ? w / DESIGN_W : 1);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return scale;
}
const zoomStyle = (scale: number): CSSProperties | undefined => (scale === 1 ? undefined : ({ zoom: scale } as CSSProperties));

function BrandImage({
  src, alt, width, height, className, fallbackClassName, priority = false,
}: {
  src: string; alt: string; width: number; height: number; className: string; fallbackClassName: string; priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={fallbackClassName}>{alt}</span>;
  return (
    <Image
      ref={(img: HTMLImageElement | null) => {
        if (img && img.complete && img.naturalWidth === 0) setFailed(true);
      }}
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function Leader({ label, value, strong = false, className = "" }: { label: ReactNode; value: ReactNode; strong?: boolean; className?: string }) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <dt className="flex min-w-0 flex-1 items-baseline gap-2 after:mb-[3px] after:h-0 after:min-w-3 after:flex-1 after:border-b after:border-dotted after:border-current after:opacity-40 after:content-['']">
        {label}
      </dt>
      <dd className={`shrink-0 text-right tabular-nums ${strong ? "font-bold text-[var(--mg-ink)]" : ""}`}>{value}</dd>
    </div>
  );
}

function Collapse({ open, id, children }: { open: boolean; id: string; children: ReactNode }) {
  return (
    <div
      id={id}
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,visibility] duration-300 motion-reduce:transition-none ${
        open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function ZigZag({ down = false }: { down?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg aria-hidden="true" className="block h-2.5 w-full">
      <defs>
        <pattern id={id} width="16" height="10" patternUnits="userSpaceOnUse">
          <path d={down ? "M0 0 L8 10 L16 0 Z" : "M0 10 L8 0 L16 10 Z"} fill="#fff" />
        </pattern>
      </defs>
      <rect width="100%" height="10" fill={`url(#${id})`} />
    </svg>
  );
}

function Heading({ children, sub, size = 22 }: { children: ReactNode; sub?: string; size?: number }) {
  return (
    <div>
      <h2 className="mg-display uppercase leading-[1.1] tracking-[0.05em] text-[var(--mg-ink)]" style={{ fontSize: size }}>
        {children}
      </h2>
      <span aria-hidden="true" className="mt-3 block h-1 w-10 rounded-full bg-[var(--mg-brown)]" />
      {sub && <p className="mt-3 text-[15px] leading-snug text-[var(--mg-brown)]">{sub}</p>}
    </div>
  );
}

/* Modal with brand aesthetic & matching accent colors */
function Modal({
  title,
  onClose,
  scale,
  children,
}: {
  title: string;
  onClose: () => void;
  scale: number;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      (previous as HTMLElement | null)?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A1A1A]/60 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="mg-root max-h-[88vh] w-full overflow-y-auto rounded-t-[32px] bg-white outline-none sm:w-[400px] sm:rounded-[32px]"
      >
        <div className="w-full sm:w-[400px]" style={zoomStyle(scale)}>
          <div className="p-6 text-[var(--mg-brown)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--mg-line)] pb-4">
              <div className="min-w-0">
                <h2 id={titleId} className="mg-display text-[20px] font-bold uppercase tracking-[0.05em] text-[var(--mg-ink)]">
                  {title}
                </h2>
                <span className="mt-2 block h-1 w-10 rounded-full bg-[var(--mg-brown)]" />
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--mg-wash)] text-[var(--mg-ink)] transition-colors active:bg-[var(--mg-press)] ${onPaper}`}
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ paper item row ----------------------------------- */
function PaperItem({ item, open, onToggle }: { item: MangoItem; open: boolean; onToggle: () => void }) {
  const panelId = useId();
  const m = monoClass;
  const net = netOf(item);
  const gross = item.mrp * item.qty;
  const pct = gross > 0 ? (item.discount / gross) * 100 : 0;
  return (
    <li className="border-b border-dashed border-black/40 py-3.5 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-x-2.5 rounded text-left ${onPaper}`}
      >
        <span aria-hidden="true" className={`${m} text-[13px] font-bold leading-snug text-[var(--mg-brown)]`}>
          [{open ? "−" : "+"}]
        </span>
        <span className="min-w-0">
          <span className={`${m} block text-[13px] font-semibold uppercase leading-snug text-[var(--mg-ink)]`}>{item.name}</span>
          <span className={`${m} mt-1 block text-xs text-[var(--mg-brown)]`}>
            SIZE {item.size} &nbsp; QTY {item.qty} &nbsp; MRP {item.mrp.toLocaleString("en-IN")}
          </span>
        </span>
        <span className={`${m} text-sm font-bold leading-snug tabular-nums text-[var(--mg-ink)]`}>{inr(net)}</span>
      </button>

      <Collapse open={open} id={panelId}>
        <div className={`${m} ml-8 mt-3 space-y-2.5 border-l-2 border-[var(--mg-brown)] pl-3 text-xs`}>
          <dl className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--mg-brown)]">SKU</dt>
            <dd className="text-[13px] font-bold tracking-wide text-[var(--mg-ink)]">{item.sku}</dd>
          </dl>

          <dl className="grid grid-cols-2 divide-x divide-black/15 rounded-md border border-black/15">
            {(
              [
                ["HSN", item.hsn],
                ["UoM", "Pcs"],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="min-w-0 px-1.5 py-1.5">
                <dt className="text-[var(--mg-brown)]">{k}</dt>
                <dd className="mt-0.5 break-words font-bold tabular-nums text-[var(--mg-ink)]">{v}</dd>
              </div>
            ))}
          </dl>

          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-[var(--mg-wash)] px-2.5 py-1.5 text-[var(--mg-brown-dark)]">
              <dt>Discount %</dt>
              <dd className="mt-0.5 text-[13px] font-bold tabular-nums">{trim(pct)}</dd>
            </div>
            <div className="rounded-md bg-[var(--mg-wash)] px-2.5 py-1.5 text-[var(--mg-brown-dark)]">
              <dt>Discount amount</dt>
              <dd className="mt-0.5 text-[13px] font-bold tabular-nums">{trim(item.discount)}</dd>
            </div>
          </dl>
        </div>
      </Collapse>
    </li>
  );
}

/* ------------------------------- sleek top rating card ---------------------------- */
const RATING_WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

function SleekRateCard({ data, onSubmit }: { data: MangoReceiptData; onSubmit?: (v: FeedbackValues) => void }) {
  const [overall, setOverall] = useState(0);
  const [hover, setHover] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [cats, setCats] = useState({ service: 0, product: 0, sizes: 0, value: 0 });
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const commentId = useId();
  const detailId = useId();
  const m = monoClass;
  const shown = hover || overall;

  const handleStarClick = (n: number) => {
    setOverall(n);
    setExpanded(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.({ invoiceNo: data.invoiceNo, overall, categories: cats, comment: comment.trim() });
    setSubmitted(true);
  };

  return (
    <section   aria-label="Rate your visit"   className={`relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 text-[var(--mg-brown)] shadow-[0_4px_16px_-8px_rgba(26,26,26,0.18)]`} >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--mg-wash)] rounded-full -mr-10 -mt-10 pointer-events-none opacity-60" />

      <div className="flex items-center justify-between gap-3">
  <div className="min-w-0">
    <span className="mg-display block text-[9px] uppercase tracking-[0.18em] text-[var(--mg-brown)]">
      Quick Feedback
    </span>

    <h2 className="mg-display mt-0.5 text-[16px] uppercase leading-tight tracking-[0.02em] text-[var(--mg-ink)]">
      How was your visit?
    </h2>
  </div>

  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--mg-line)] bg-[var(--mg-wash)] text-[var(--mg-brown)]">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d={STAR_PATH} />
    </svg>
  </span>
</div>

      {submitted ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-black/5 bg-[var(--mg-wash)] p-3" aria-live="polite">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--mg-ink)] text-white">
            <Icon name="check" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="mg-display text-[14px] uppercase tracking-wider text-[var(--mg-ink)]">Thank you for rating!</p>
            <p className="mt-0.5 text-[12px] text-[var(--mg-brown)]">
              You gave {overall} stars ({RATING_WORDS[overall - 1].toLowerCase()}).
            </p>
            <button
              type="button"
              onClick={() => { setSubmitted(false); setExpanded(false); setOverall(0); }}
              className={`${m} mt-1.5 text-[11px] font-bold text-[var(--mg-ink)] underline underline-offset-2`}
            >
              [ Edit rating ]
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center justify-between bg-[var(--mg-wash)] px-4 py-3.5 rounded-2xl border border-black/5">
            <div role="radiogroup" aria-label="Overall rating" className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={overall === n}
                  aria-label={`${n} ${n === 1 ? "star" : "stars"}, ${RATING_WORDS[n - 1]}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => handleStarClick(n)}
                  className={`grid h-9 w-9 place-items-center rounded-lg transition-transform active:scale-95 ${onPaper}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    className={`h-6 w-6 stroke-[var(--mg-brown)] transition-colors ${
                      n <= shown ? "fill-[var(--mg-brown)]" : "fill-white"
                    } ${!overall && !hover ? "mg-star-flash" : ""}`}
                    style={!overall && !hover ? { animationDelay: `${(n - 1) * 0.18}s` } : undefined}
                  >
                    <path d={STAR_PATH} />
                  </svg>
                </button>
              ))}
            </div>
            <div className="text-right pl-2">
              <p className="mg-display text-[11px] uppercase tracking-wide text-[var(--mg-ink)]">
                {overall ? RATING_WORDS[overall - 1] : "Tap to rate"}
              </p>
              <p className="text-[9px] font-medium text-[var(--mg-brown)]">
                {overall ? `${overall}/5 stars` : "Instant feedback"}
              </p>
            </div>
          </div>

          <Collapse open={expanded} id={detailId}>
            <form onSubmit={submit} noValidate className="mt-3 space-y-3 border-t border-[var(--mg-line)] pt-3">
              <div>
                <p className={`${m} text-[11px] uppercase tracking-wider text-[var(--mg-brown)] mb-2.5 font-bold`}>Rate specific categories</p>
                <div className="space-y-2">
                  {[
                    { key: "service", label: "Service quality" },
                    { key: "product", label: "Product offering" },
                    { key: "sizes", label: "Sizes availability" },
                    { key: "value", label: "Value for money" },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center justify-between bg-[var(--mg-wash)] px-3 py-2 rounded-xl border border-black/5">
                      <span className={`${m} text-[11px] uppercase font-semibold text-[var(--mg-ink)]`}>{c.label}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCats((p) => ({ ...p, [c.key]: star }))}
                            className="p-1"
                            aria-label={`${star} stars for ${c.label}`}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              className={`h-4 w-4 stroke-[var(--mg-brown)] ${
                                star <= cats[c.key as keyof typeof cats] ? "fill-[var(--mg-brown)]" : "fill-white"
                              }`}
                            >
                              <path d={STAR_PATH} />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor={commentId} className={`${fieldLabel} text-[11px] uppercase font-bold tracking-wider`}>
                  Any additional thoughts? (Optional)
                </label>
                <textarea
                  id={commentId}
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve..."
                  className={`${fieldInput} text-[13px] resize-none`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className={`${solidBtn} !py-3 text-[12px]`}>
                  Submit rating
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded-xl border border-black/10 bg-[var(--mg-wash)] px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[var(--mg-brown)] active:bg-[var(--mg-press)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Collapse>
        </div>
      )}
    </section>
  );
}

/* ------------------------------- profile ----------------------------------------- */
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

function Toggle({ checked, onChange, disabled = false, label }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-7 w-[52px] shrink-0 rounded-full border-2 transition-colors motion-reduce:transition-none ${
        checked ? "border-[var(--mg-brown)] bg-[var(--mg-brown)]" : "border-[var(--mg-edge)] bg-white"
      } ${disabled ? "opacity-70" : ""} ${onPaper}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-[3px] h-4 w-4 rounded-full transition-all motion-reduce:transition-none ${checked ? "left-[27px] bg-white" : "left-[3px] bg-[var(--mg-brown)]"}`}
      />
    </button>
  );
}

function ProfileCard({ data, onSave }: { data: MangoReceiptData; onSave?: (v: ProfileValues) => void }) {
  const [form, setForm] = useState<ProfileValues>({
    name: data.customer.name,
    email: data.customer.email,
    gender: "",
    birthday: "",
    anniversary: "",
    offers: false,
  });
  const [saved, setSaved] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const upd = <K extends keyof ProfileValues>(k: K, v: ProfileValues[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.email && !emailOk(form.email)) {
      setEmailErr("Enter a valid email address, like name@example.com.");
      return;
    }
    setEmailErr("");
    onSave?.(form);
    setSaved(true);
  };

  return (
    <section aria-label="Your profile" className={`rounded-3xl bg-white p-5 text-[var(--mg-brown)] ${lift}`}>
      <Heading sub="Save your details for faster service and personalised updates.">Your profile</Heading>
      <form onSubmit={submit} noValidate className="mt-6 space-y-6">
        <label className="block">
          <span className={fieldLabel}>Full name</span>
          <input className={fieldInput} value={form.name} onChange={(e) => upd("name", e.target.value)} autoComplete="name" />
        </label>

        <label className="block">
          <span className={fieldLabel}>Email address</span>
          <input
            type="email"
            className={fieldInput}
            value={form.email}
            onChange={(e) => {
              setEmailErr("");
              upd("email", e.target.value);
            }}
            autoComplete="email"
            aria-invalid={!!emailErr}
          />
          {emailErr && (
            <span role="alert" className="mt-1.5 block text-[13px] font-bold text-[var(--mg-ink)]">
              {emailErr}
            </span>
          )}
        </label>

        <div>
          <span className={fieldLabel}>Mobile number</span>
          <p className="text-base font-bold tabular-nums text-[var(--mg-ink)]">{data.customer.mobile}</p>
        </div>

        <fieldset>
          <legend className={`${fieldLabel} mb-2`}>Gender</legend>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => {
              const on = form.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() => upd("gender", on ? "" : g)}
                  className={`rounded-full border-2 px-4 py-2 text-[14px] transition-colors motion-reduce:transition-none ${onPaper} ${
                    on
                      ? "border-[var(--mg-ink)] bg-[var(--mg-ink)] text-white"
                      : "border-[var(--mg-edge)] bg-white text-[var(--mg-brown-dark)] active:border-[var(--mg-ink)] [@media(hover:hover)]:hover:border-[var(--mg-ink)]"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <label className="block min-w-0">
            <span className={fieldLabel}>Birthday</span>
            <input type="date" className={fieldInput} value={form.birthday} onChange={(e) => upd("birthday", e.target.value)} autoComplete="bday" />
            <span className="mt-1.5 block text-[13px]">For birthday offers</span>
          </label>
          <label className="block min-w-0">
            <span className={fieldLabel}>Anniversary</span>
            <input type="date" className={fieldInput} value={form.anniversary} onChange={(e) => upd("anniversary", e.target.value)} />
            <span className="mt-1.5 block text-[13px]">Optional</span>
          </label>
        </div>

        <fieldset>
          <legend className={`${fieldLabel} mb-1`}>Communication preferences</legend>
          <ul className="border-y-2 border-[var(--mg-ink)]">
            <li className="flex items-center justify-between gap-4 border-b border-dashed border-black/40 py-4">
              <div>
                <p className="text-[15px] font-bold text-[var(--mg-ink)]">Purchase and order updates</p>
                <p className="mt-0.5 text-[14px] leading-snug">Receipts and return confirmations. Always on.</p>
              </div>
              <Toggle checked disabled label="Purchase and order updates, always on" />
            </li>
            <li className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-[15px] font-bold text-[var(--mg-ink)]">New arrivals and offers</p>
                <p className="mt-0.5 text-[14px] leading-snug">Collections, member offers and seasonal edits.</p>
              </div>
              <Toggle checked={form.offers} onChange={(v) => upd("offers", v)} label="New arrivals and offers" />
            </li>
          </ul>
        </fieldset>

        <button type="submit" className={solidBtn}>
          Save details
        </button>
        <p aria-live="polite" className="flex min-h-5 items-center justify-center gap-1.5 text-center text-sm font-bold text-[var(--mg-ink)]">
          {saved && (
            <>
              <Icon name="check" className="h-4 w-4 text-[var(--mg-brown)]" /> Details saved
            </>
          )}
        </p>
        <p className="text-center text-[13px] leading-relaxed">
          Your information is used only for purchase communication and personalisation. We never share your data with third parties.
        </p>
      </form>
    </section>
  );
}

/* ------------------------------ receipt view ------------------------------------- */
interface ReceiptViewProps extends Omit<MangoReceiptProps, "data" | "receipts" | "onSelectReceipt"> {
  data: MangoReceiptData;
  history: HistoryRow[];
  onSelect: (invoiceNo: string) => void;
}

function ReceiptView({
  data,
  history,
  onSelect,
  qrSrc,
  logoSrc = DEFAULT_MANGO_LOGO,
  rdepLogoSrc = DEFAULT_RDEP_LOGO,
  instagramUrl = DEFAULT_INSTAGRAM_URL,
  storeLocatorUrl = DEFAULT_STORE_LOCATOR_URL,
  onDownload,
  onSendEmail,
  onSaveProfile,
  onSubmitFeedback,
}: ReceiptViewProps) {
  const [openItem, setOpenItem] = useState(-1);
  const [modal, setModal] = useState<ModalId>(null);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const closeModal = useCallback(() => setModal(null), []);
  const exchangeId = useId();
  const contactId = useId();
  const scale = useFitScale();
  const m = monoClass;

  const { store, exchange } = data;
  const t = useMemo(() => totalsOf(data), [data]);
  const firstName = data.customer.name.trim().split(/\s+/)[0] || data.customer.name;
  const nameSize = Math.min(30, Math.max(18, Math.floor(180 / (0.72 * (firstName.length + 1)))));
  const handleDownload = () => (onDownload ? onDownload(data) : downloadReceipt(data, logoSrc, rdepLogoSrc));

  return (
    <div
      style={theme}
      onTouchStart={() => {}}
      className="mg-root min-h-screen overflow-x-hidden bg-[var(--mg-page)] text-[var(--mg-brown)] antialiased [-webkit-text-size-adjust:100%] sm:py-8"
    >
      <style>{FONT_FACES}</style>

      <main
        style={zoomStyle(scale)}
        className="mx-auto w-[400px] overflow-hidden bg-[var(--mg-canvas)] pb-0 sm:rounded-3xl sm:shadow-[0_24px_60px_-24px_rgba(26,26,26,0.3)]"
      >
        {/* ---------- Compact hero: logo left, greeting right ---------- */}
        <header className="flex items-center justify-between gap-4 px-5 pb-5 pt-6">
          <BrandImage
            src={logoSrc}
            alt="MANGO"
            width={320}
            height={80}
            priority
            className="h-9 w-auto max-w-[46%] shrink-0 object-contain object-left"
            fallbackClassName="mg-display inline-block text-[26px] uppercase leading-none tracking-[0.12em] text-[var(--mg-ink)]"
          />
          <h1 className="min-w-0 text-right uppercase">
            <span className="mg-display block text-[12px] leading-none tracking-[0.2em] text-[var(--mg-brown-dark)]">Thank you</span>
            <span
              className="mg-display mt-1.5 block leading-[1.05] tracking-[0.02em] text-[var(--mg-ink)] [overflow-wrap:anywhere]"
              style={{ fontSize: nameSize }}
            >
              {firstName}
            </span>
          </h1>
        </header>

        {/* ---------- Compact Top Rating Card ---------- */}
<div className="mb-3 px-4">
  <SleekRateCard data={data} onSubmit={onSubmitFeedback} />
</div>

        {/* ---------- Total paid card summary with quick QR popup trigger ---------- */}
        <div className="px-4">
          <section aria-label="Total paid" className={`rounded-3xl bg-white p-5 text-[var(--mg-ink)] ${lift}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] text-[var(--mg-brown)]">Total paid</p>
                <p className="mg-display mt-1 text-[32px] leading-none tabular-nums">₹{inr(t.total)}</p>
              </div>
              <button
                type="button"
                onClick={() => setModal("qr")}
                aria-label="View QR code"
                className="flex items-center gap-2 rounded-2xl bg-[var(--mg-wash)] px-3.5 py-3 border border-black/5 active:bg-[var(--mg-press)] transition-colors"
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-black/10">
                  {qrSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrSrc} alt="Receipt QR code" className="h-full w-full object-contain" />
                  ) : (
                    <PlaceholderQR seed={data.invoiceNo} />
                  )}
                </div>
                <div className="text-left">
                  <span className="mg-display block text-[10px] uppercase tracking-wider text-[var(--mg-ink)]">QR Code</span>
                  <span className="text-[10px] text-[var(--mg-brown)] font-medium">Tap to view</span>
                </div>
              </button>
            </div>
            <dl className={`${m} mt-4 space-y-1.5 border-t border-dashed border-black/40 pt-3.5 text-xs text-[var(--mg-brown)]`}>
              <Leader label="Invoice no" value={data.invoiceNo} strong />
              <Leader label="Date" value={data.date} strong />
            </dl>
          </section>
        </div>

        {/* ---------- The receipt: thermal paper ---------- */}
        <section
          aria-label="Purchase summary"
          className="mx-3 mt-8 text-[var(--mg-brown)]"
          style={{ filter: "drop-shadow(0 12px 14px rgba(26,26,26,0.16))" }}
        >
          <ZigZag />
          <div className="bg-white px-5 pb-6 pt-4">
            <h2 className="mg-display text-[22px] uppercase leading-[1.1] tracking-[0.05em] text-[var(--mg-ink)]">Purchase summary</h2>
            <p className={`${m} mt-2 text-xs`}>
              {t.pieces} {t.pieces === 1 ? "item" : "items"}
            </p>

            <div className={`${m} mt-4 flex justify-between border-y-2 border-[var(--mg-ink)] py-2 text-xs font-semibold uppercase tracking-wide text-[var(--mg-ink)]`}>
              <span>Item name</span>
              <span>Net amount</span>
            </div>
            <ul aria-label="Items purchased">
              {data.items.map((item, i) => (
                <PaperItem key={`${item.sku}-${i}`} item={item} open={openItem === i} onToggle={() => setOpenItem(openItem === i ? -1 : i)} />
              ))}
            </ul>

            <dl className={`${m} space-y-2 border-t-2 border-[var(--mg-ink)] pt-3.5 text-sm`}>
              <Leader label="Subtotal (MRP)" value={`₹${inr(t.subtotal)}`} strong />
              <Leader label="Discount" value={`− ₹${inr(t.discount)}`} strong />
              <Leader label="SGST" value={`₹${inr(data.sgst)}`} strong />
              <Leader label="CGST" value={`₹${inr(data.cgst)}`} strong />
            </dl>

            <div className="mt-3.5 border-y-2 border-[var(--mg-ink)] py-3.5">
              <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
                <span className="mg-display text-[15px] uppercase leading-none tracking-[0.06em] text-[var(--mg-ink)]">Total paid</span>
                <span className="mg-display text-[30px] leading-none tabular-nums text-[var(--mg-brown)]">₹{inr(t.total)}</span>
              </div>
            </div>

            <h3 className="mg-display mt-5 text-[15px] uppercase leading-none tracking-[0.06em] text-[var(--mg-ink)]">Payment method</h3>
            <div className={`${m} mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--mg-ink)] px-4 py-3.5 text-white`}>
              <span className="text-sm">
                {data.payment.mode} &ndash; {data.payment.ref}
              </span>
              <span className="text-base font-bold tabular-nums">₹{inr(t.total)}</span>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {(
                [
                  { icon: "history", label: "History", onClick: () => setModal("history") },
                  { icon: "mail", label: "Email", onClick: () => setModal("email") },
                  { icon: "download", label: "Download", onClick: handleDownload },
                ] as { icon: IconName; label: string; onClick: () => void }[]
              ).map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 border-[var(--mg-ink)] px-1 py-3.5 text-center text-[11px] font-bold uppercase leading-tight tracking-[0.08em] text-[var(--mg-ink)] transition-colors active:bg-[var(--mg-ink)] [@media(hover:hover)]:hover:bg-[var(--mg-ink)] active:text-white [@media(hover:hover)]:hover:text-white motion-reduce:transition-none ${onPaper}`}
                >
                  <Icon name={a.icon} className="h-5 w-5" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <ZigZag down />
        </section>

        {/* ---------- After the receipt ---------- */}
        <div className="space-y-7 px-4 pt-8">
          <ProfileCard data={data} onSave={onSaveProfile} />

          {/* Exchange */}
          <section aria-label="Exchange" className={`rounded-3xl bg-white text-[var(--mg-brown)] ${lift}`}>
            <h2>
              <button
                type="button"
                onClick={() => setExchangeOpen((o) => !o)}
                aria-expanded={exchangeOpen}
                aria-controls={exchangeId}
                className={`flex w-full items-center justify-between gap-4 rounded-3xl p-5 text-left active:bg-[var(--mg-wash)] ${onPaper}`}
              >
                <span>
                  <span className="mg-display block text-[22px] uppercase leading-[1.1] tracking-[0.05em] text-[var(--mg-ink)]">Exchange</span>
                  <span className="mt-2 block text-[15px] font-normal">{exchange.days}-day exchange policy</span>
                </span>
                <span aria-hidden="true" className={`${m} text-sm font-bold text-[var(--mg-ink)]`}>
                  [{exchangeOpen ? "−" : "+"}]
                </span>
              </button>
            </h2>
            <Collapse open={exchangeOpen} id={exchangeId}>
              <ol className={`${m} list-decimal space-y-2.5 border-t border-dashed border-black/40 py-5 pl-10 pr-5 text-xs leading-relaxed`}>
                {exchange.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </Collapse>
          </section>

          {/* Reach us */}
          <section aria-label="Reach us">
            <h2 className="mg-display text-[22px] uppercase leading-[1.1] tracking-[0.05em] text-[var(--mg-ink)]">Reach us</h2>
            <p className="mt-2 text-[15px] text-[var(--mg-brown-dark)]">Get in touch or find us online.</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={`${outlineBtn} flex-col gap-1.5 !px-1 !py-3.5 !text-[11px]`}>
                <Icon name="instagram" className="h-[18px] w-[18px]" />
                Instagram
              </a>
              <a href={`tel:${data.callTo}`} className={`${outlineBtn} flex-col gap-1.5 !px-1 !py-3.5 !text-[11px]`}>
                <Icon name="phone" className="h-[18px] w-[18px]" />
                Call us
              </a>
              <a href={`mailto:${data.emailTo}`} className={`${outlineBtn} flex-col gap-1.5 !px-1 !py-3.5 !text-[11px]`}>
                <Icon name="mail" className="h-[18px] w-[18px]" />
                Email us
              </a>
            </div>

            <a
              href={storeLocatorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`group mt-3 flex items-center justify-between gap-4 rounded-3xl bg-[var(--mg-ink)] p-5 text-white shadow-[0_14px_28px_-14px_rgba(26,26,26,0.7)] transition-colors active:bg-white [@media(hover:hover)]:hover:bg-white active:text-[var(--mg-ink)] [@media(hover:hover)]:hover:text-[var(--mg-ink)] motion-reduce:transition-none`}
            >
              <span>
                <span className="mg-display block text-[18px] uppercase leading-[1.15] tracking-[0.05em]">Find a MANGO store</span>
                <span className="mt-2 block text-[14px] leading-snug">Locate your nearest store in India</span>
              </span>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[var(--mg-ink)] transition-colors group-active:bg-[var(--mg-ink)] [@media(hover:hover)]:group-hover:bg-[var(--mg-ink)] group-active:text-white [@media(hover:hover)]:group-hover:text-white motion-reduce:transition-none">
                <Icon name="arrow" className="h-5 w-5" />
              </span>
            </a>
          </section>

          {/* ---------- Store Card ---------- */}
          <section aria-label="Store" className={`rounded-3xl bg-white p-6 text-[var(--mg-ink)] ${lift}`}>
            <div className="flex items-center justify-between border-b border-[var(--mg-line)] pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--mg-ink)] text-white shadow-sm">
                  <Icon name="store" className="h-5 w-5" />
                </span>
                <div>
                  <p className="mg-display text-[10px] uppercase tracking-[0.2em] text-[var(--mg-brown)]">Purchased at</p>
                  <h2 className="mg-display text-[16px] uppercase leading-tight tracking-[0.04em] text-[var(--mg-ink)]">{store.name}</h2>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-[var(--mg-wash)] p-4 border border-black/5">
                <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mg-brown)]" />
                <p className="text-[13px] font-medium leading-relaxed text-[var(--mg-ink)]">{store.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name}, ${store.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--mg-wash)] py-3 text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--mg-ink)] border border-black/5 transition-colors active:bg-[var(--mg-press)]"
                >
                  <Icon name="directions" className="h-4 w-4 text-[var(--mg-brown)]" />
                  Directions
                </a>
                <a 
                  href={`tel:${store.phone}`} 
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--mg-wash)] py-3 text-[12px] font-bold uppercase tracking-[0.05em] text-[var(--mg-ink)] border border-black/5 transition-colors active:bg-[var(--mg-press)]"
                >
                  <Icon name="call" className="h-4 w-4 text-[var(--mg-brown)]" />
                  Call store
                </a>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--mg-line)]">
              <button
                type="button"
                onClick={() => setContactOpen((o) => !o)}
                aria-expanded={contactOpen}
                aria-controls={contactId}
                className={`flex w-full items-center justify-between gap-2 rounded-xl p-2 -mx-2 transition-colors active:bg-[var(--mg-wash)] ${onPaper}`}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--mg-ink)] text-white">
                    <Icon name="chevron" className={`h-3.5 w-3.5 transition-transform duration-300 ${contactOpen ? "rotate-180" : ""}`} />
                  </span>
                  <span className="mg-display text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--mg-ink)]">
                    {contactOpen ? "Hide contact & tax info" : "View contact & tax info"}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--mg-brown)] font-medium">
                  {contactOpen ? "Less" : "Details"}
                </span>
              </button>
            </div>

            <Collapse open={contactOpen} id={contactId}>
              <div className="mt-3 pt-3 border-t border-dashed border-[var(--mg-line)] space-y-2.5">
                <a href={`mailto:${store.email}`} className="flex items-center justify-between rounded-xl p-3 bg-[var(--mg-wash)] border border-black/5 active:bg-[var(--mg-press)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[var(--mg-brown)] shadow-sm">
                      <Icon name="mail" className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase text-[var(--mg-brown)] font-bold">Email support</p>
                      <p className={`${m} text-[12px] font-bold text-[var(--mg-ink)]`}>{store.email}</p>
                    </div>
                  </div>
                  <Icon name="arrow" className="h-3.5 w-3.5 text-[var(--mg-brown)]" />
                </a>

                <a href={`tel:${store.phone}`} className="flex items-center justify-between rounded-xl p-3 bg-[var(--mg-wash)] border border-black/5 active:bg-[var(--mg-press)]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[var(--mg-brown)] shadow-sm">
                      <Icon name="phone" className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase text-[var(--mg-brown)] font-bold">Store phone</p>
                      <p className={`${m} text-[12px] font-bold text-[var(--mg-ink)]`}>{store.phone}</p>
                    </div>
                  </div>
                  <Icon name="arrow" className="h-3.5 w-3.5 text-[var(--mg-brown)]" />
                </a>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-xl p-3 bg-[var(--mg-wash)] border border-black/5">
                    <div className="flex items-center gap-1.5 text-[var(--mg-brown)] mb-1">
                      <Icon name="user" className="h-3.5 w-3.5" />
                      <p className="text-[10px] uppercase font-bold">Associate</p>
                    </div>
                    <p className="mg-display text-[13px] text-[var(--mg-ink)]">{store.associate}</p>
                  </div>

                  <div className="rounded-xl p-3 bg-[var(--mg-wash)] border border-black/5">
                    <div className="flex items-center gap-1.5 text-[var(--mg-brown)] mb-1">
                      <Icon name="tax" className="h-3.5 w-3.5" />
                      <p className="text-[10px] uppercase font-bold">GSTIN</p>
                    </div>
                    <p className={`${m} text-[11px] font-bold truncate text-[var(--mg-ink)]`} title={store.gstin}>{store.gstin}</p>
                  </div>
                </div>
              </div>
            </Collapse>
          </section>

          {/* ---------- Light Closing Card ---------- */}
          <section className={`rounded-3xl bg-white p-6 text-[var(--mg-ink)] ${lift}`}>
            <div className="flex items-center justify-between">
              <BrandImage
                src={logoSrc}
                alt="MANGO"
                width={320}
                height={80}
                className="h-8 w-auto max-w-[55%] object-contain object-left"
                fallbackClassName="mg-display inline-block text-[24px] uppercase leading-none tracking-[0.12em] text-[var(--mg-ink)]"
              />
              <span className="rounded-full bg-[var(--mg-wash)] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--mg-brown)] border border-black/5">
                Official Receipt
              </span>
            </div>

            <div className="mt-6">
              <h2 className="mg-display text-[20px] uppercase leading-[1.1] tracking-[0.04em] text-[var(--mg-ink)]">
                Thank you
              </h2>
              <p className="mt-1 text-[14px] text-[var(--mg-brown)] font-medium">For shopping with us. See you in store soon.</p>
            </div>

            <div className="mt-6 rounded-2xl bg-[var(--mg-wash)] p-4 border border-black/5">
              <h3 className="mg-display text-[10px] uppercase tracking-[0.18em] text-[var(--mg-brown)]">Registered office</h3>
              <p className={`${m} mt-1.5 text-[11px] leading-relaxed text-[var(--mg-ink)]`}>{data.registeredOffice}</p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--mg-line)] pt-4">
              <p className={`${m} text-[11px] text-[var(--mg-brown)]`}>
                Invoice: <strong className="text-[var(--mg-ink)]">{data.invoiceNo}</strong>
              </p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className={`flex items-center gap-1.5 rounded-full bg-[var(--mg-ink)] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white active:bg-[var(--mg-brown)] ${onPaper}`}
              >
                Top <Icon name="arrow" className="h-3.5 w-3.5 -rotate-90" />
              </button>
            </div>
          </section>
        </div>

        {/* ---------- Footer: "Powered by" strip ---------- */}
        <footer className="mt-8 flex items-center justify-center gap-2.5 bg-white px-5 py-5 text-[13px] text-[var(--mg-brown)] border-t border-black/5">
          <span>Powered by</span>
          <BrandImage
            src={rdepLogoSrc}
            alt="rdep"
            width={240}
            height={80}
            className="h-7 w-auto"
            fallbackClassName="text-lg font-bold tracking-tight text-[var(--mg-ink)]"
          />
        </footer>
      </main>

      {/* ---------------------------- Transaction History Popup ---------------------------- */}
      {modal === "history" && (
        <Modal title="TRANSACTION HISTORY" onClose={closeModal} scale={scale}>
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-[var(--mg-wash)] p-4 border border-black/5">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[var(--mg-brown)] font-bold">Total receipts</p>
              <p className="mg-display text-[18px] text-[var(--mg-ink)]">{history.length} recorded</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-[var(--mg-brown)] font-bold">Active view</p>
              <p className={`${m} text-[12px] font-bold text-[var(--mg-ink)]`}>#{data.invoiceNo.slice(-4)}</p>
            </div>
          </div>

          <ol className="space-y-3">
            {history.map((h) => (
              <li key={h.invoiceNo}>
                <div className={`flex items-center justify-between gap-3 rounded-2xl p-4 transition-colors border ${
                  h.current 
                    ? "bg-[var(--mg-ink)] text-white border-[var(--mg-ink)] shadow-md" 
                    : "bg-[var(--mg-wash)] text-[var(--mg-ink)] border-black/5 hover:border-[var(--mg-brown)]"
                }`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`mg-display text-[13px] uppercase ${h.current ? "text-white" : "text-[var(--mg-ink)]"}`}>
                        No. {h.invoiceNo}
                      </span>
                      {h.current && (
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-[12px] truncate ${h.current ? "text-white/80" : "text-[var(--mg-brown)]"}`}>
                      {h.date} &middot; {h.storeName}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <span className={`${m} text-[15px] font-bold tabular-nums block ${h.current ? "text-white" : "text-[var(--mg-ink)]"}`}>
                        ₹{inr(h.amount)}
                      </span>
                      <span className={`text-[10px] block ${h.current ? "text-white/70" : "text-[var(--mg-brown)]"}`}>
                        {h.items} {h.items === 1 ? "pc" : "pcs"}
                      </span>
                    </div>

                    {!h.current && (
                      <button
                        type="button"
                        onClick={() => {
                          closeModal();
                          onSelect(h.invoiceNo);
                        }}
                        aria-label={`Open receipt ${h.invoiceNo}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[var(--mg-ink)] shadow-sm transition-transform active:scale-95 border border-black/10"
                      >
                        <Icon name="arrow" className="h-4 w-4 text-[var(--mg-brown)]" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Modal>
      )}

      {/* ---------------------------- QR Code Popup Modal ---------------------------- */}
      {modal === "qr" && (
        <Modal title="RECEIPT QR CODE" onClose={closeModal} scale={scale}>
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-48 h-48 rounded-2xl bg-white p-3 shadow-inner border border-black/10 flex items-center justify-center mb-4">
              {qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrSrc} alt="Receipt QR code" className="h-full w-full object-contain" />
              ) : (
                <PlaceholderQR seed={data.invoiceNo} />
              )}
            </div>
            <p className="mg-display text-[14px] uppercase text-[var(--mg-ink)] tracking-wider">Invoice #{data.invoiceNo}</p>
            <p className="mt-1 text-[13px] text-[var(--mg-brown)]">Scan this code at the store counter for instant returns or inquiries.</p>
          </div>
        </Modal>
      )}

      {/* ---------------------------- Email Modal ---------------------------- */}
      {modal === "email" && (
        <Modal title="Email this receipt" onClose={closeModal} scale={scale}>
          <form
            className="space-y-5"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!emailOk(email)) {
                setEmailErr("Enter a valid email address, like name@example.com.");
                return;
              }
              setEmailErr("");
              onSendEmail?.(email, data);
              setSentTo(email);
            }}
          >
            <label className="block">
              <span className={fieldLabel}>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setSentTo("");
                  setEmailErr("");
                  setEmail(e.target.value);
                }}
                className={fieldInput}
                autoComplete="email"
                aria-invalid={!!emailErr}
              />
              {emailErr && (
                <span role="alert" className="mt-1.5 block text-[13px] font-bold text-[var(--mg-ink)]">
                  {emailErr}
                </span>
              )}
            </label>
            <button type="submit" className={solidBtn}>
              Send receipt
            </button>
            <p aria-live="polite" className="flex min-h-5 items-center justify-center gap-1.5 text-sm font-bold text-[var(--mg-ink)]">
              {sentTo && (
                <>
                  <Icon name="check" className="h-4 w-4 text-[var(--mg-brown)]" /> Receipt sent to {sentTo}
                </>
              )}
            </p>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* --------------------------------- main ------------------------------------------ */
export default function MangoReceipt({ data, receipts, onSelectReceipt, ...rest }: MangoReceiptProps) {
  const list = useMemo(() => {
    const base = receipts ?? (data ? [data] : sampleMangoReceipts);
    const merged = data && !base.some((r) => r.invoiceNo === data.invoiceNo) ? [data, ...base] : base;
    return [...merged].sort((a, b) => dateValue(b.date) - dateValue(a.date));
  }, [data, receipts]);

  const [currentId, setCurrentId] = useState(data?.invoiceNo ?? list[0].invoiceNo);
  const current = list.find((r) => r.invoiceNo === currentId) ?? list[0];

  const history = useMemo<HistoryRow[]>(
    () =>
      list.map((r) => {
        const t = totalsOf(r);
        return {
          invoiceNo: r.invoiceNo,
          date: r.date.split(" ")[0],
          storeName: r.store.name.replace(/^Mango\s*/i, ""),
          amount: t.total,
          items: t.pieces,
          current: r.invoiceNo === current.invoiceNo,
        };
      }),
    [list, current.invoiceNo],
  );

  const select = useCallback(
    (invoiceNo: string) => {
      setCurrentId(invoiceNo);
      onSelectReceipt?.(invoiceNo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [onSelectReceipt],
  );

  return <ReceiptView key={current.invoiceNo} data={current} history={history} onSelect={select} {...rest} />;
}
