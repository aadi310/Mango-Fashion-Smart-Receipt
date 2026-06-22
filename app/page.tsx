"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronRight,
  Crown,
  Heart,
  LayoutGrid,
  Headset,
  Check,
  Lock,
  ArrowRight,
  ArrowUpRight,
  Gift,
  Trophy,
  Ticket,
  Zap,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  History,
  Instagram,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Star,
  User2,
  ThumbsUp,
  Share2,
  Facebook,
  Sparkles,
  MapPin,
  ShoppingBagIcon,
  Utensils,
  Package,
  Receipt as ReceiptIcon,
} from "lucide-react"

interface Receipt {
  id: string
  date: string
  time: string
  associate: string
  branch?: string

  items: Array<{
    id: number
    name: string

    // Fashion-specific details
    color?: string
    size?: string
    material?: string

    // Product information
    category?: string
    itemCode?: string

    // Pricing
    price: number
    quantity: number
    baseAmount?: number
    tax?: number
    discount?: number

    // Optional merchandising fields
    description?: string
  }>

  subtotal: number
  tax: number
  total: number
}
export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showTerms, setShowTerms] = useState(true)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<number[]>([])
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: string[] }>({})
  const [currentReceiptId, setCurrentReceiptId] = useState("current")
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
  const [showReferModal, setShowReferModal] = useState(false)
  const [showStoreLocation, setShowStoreLocation] = useState(false)
  const receiptContainerRef = useRef<HTMLDivElement>(null)
const [selectedTags, setSelectedTags] = useState<string[]>([])
const [couponToast, setCouponToast] = useState(false)
  const [itemFeedback, setItemFeedback] = useState({})
const [expandedItemFeedback, setExpandedItemFeedback] = useState([])
  const [feedback, setFeedback] = useState({
    service: 0,
    quality: 0,
    style: 0,
    pricing: 0,
    store: 0,
    comments: "",
  })
  const [profile, setProfile] = useState({
    mobile: "",
    name: "",
    email: "",
    gender: "",
    promoOptIn: false,
  })
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState("")

  const copyCoupon = (code: string) => {
  navigator.clipboard.writeText(code)

  setCouponToast(true)

  setTimeout(() => {
    setCouponToast(false)
  }, 2000)
}

  const toggleItemFeedback = (id) => {
  setExpandedItemFeedback((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
  )
}

  const setItemRating = (itemId, rating) => {
  setItemFeedback((prev) => ({
    ...prev,
    [itemId]: {
      ...prev[itemId],
      rating,
    },
  }))
}

  const toggleItemTag = (itemId, tag) => {
  setItemFeedback((prev) => {
    const currentTags = prev[itemId]?.tags || []

    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]

    return {
      ...prev,
      [itemId]: {
        ...prev[itemId],
        tags: newTags,
      },
    }
  })
}

  const customerName = "Vikas"

  // Carousel refs and APIs
  const [promoApi, setPromoApi] = useState<CarouselApi>()
  const feedbackButtonRef = useRef<HTMLButtonElement>(null)
  const historyButtonRef = useRef<HTMLButtonElement>(null)
  const referButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-play effect for promo carousel
  useEffect(() => {
    if (!promoApi) return
    const interval = setInterval(() => {
      promoApi.scrollNext()
    }, 4000)
    return () => clearInterval(interval)
  }, [promoApi])

  useEffect(() => {
  setItemFeedback({})
  setExpandedItemFeedback([])
}, [currentReceiptId])

  // Simple auto-height for WordPress iframe
  useEffect(() => {
    const postHeight = () => {
      const marker = document.getElementById("height-marker")
      if (marker && window.parent) {
        const rect = marker.getBoundingClientRect()
        const newHeight = Math.ceil(rect.top + rect.height + window.scrollY)
        window.parent.postMessage({ frameHeight: newHeight }, "*")
      }
    }

    // Run on load
    postHeight()

    // Observe changes to the DOM
    const ro = new ResizeObserver(postHeight)
    ro.observe(document.body)

    // Re-run on resize
    window.addEventListener("resize", postHeight)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", postHeight)
    }
  }, [])

  // Update current slide when carousel changes
  useEffect(() => {
    if (!promoApi) return
    promoApi.on("select", () => {
      setCurrentSlide(promoApi.selectedScrollSnap())
    })
  }, [promoApi])

const receipts = {
  current: {
    id: "MNG-BR7891XQ12",
    date: "05-04-2026",
    time: "19:22:18",
    associate: "Priya Mehta",
    branch: "Phoenix Mall, BLR",
    items: [
      {
        id: 0,
        name: "Long Satin Dress",
        color: "Burnt Orange",
        size: "M",
        material: "Silk Mix Satin",
        fit: "Fitted",
        price: 11990,
        discount: 1199,
        quantity: 1,
        category: "Women > Dresses",
        itemCode: "27034440",
        baseAmount: 10161.02,
        tax: 1828.98,
      },
      {
        id: 1,
        name: "Boat-Neck Ruched Dress",
        color: "Red",
        size: "M",
        material: "Woven Fabric",
        fit: "Regular Fit",
        price: 5990,
        discount: 0,
        quantity: 1,
        category: "Women > Dresses",
        itemCode: "27014089",
        baseAmount: 5076.27,
        tax: 913.73,
      },
      {
        id: 2,
        name: "Satin Dress with Gathered V-Neckline",
        color: "Orange",
        size: "S",
        material: "Satin",
        fit: "Regular Fit",
        price: 7990,
        discount: 0,
        quantity: 1,
        category: "Women > Dresses",
        itemCode: "27009090",
        baseAmount: 6771.19,
        tax: 1218.81,
      },
    ],
    // MRP total: 25970 — discount: 1199 = 24771
    subtotal: 20977.54, // 22008.48 - (1199 × 10161.02/11990) ≈ keep GST same, reduce base
    tax: 3961.52,       // GST unchanged
    discount: 1199,
    total: 24771,       // 25970 - 1199
  },

  hist1: {
    id: "MNG-IN6719YT92",
    date: "20-03-2026",
    time: "14:22:18",
    associate: "Anjali Kapoor",
    branch: "Indiranagar, BLR",
    items: [
      {
        id: 0,
        name: "Slim Fit T-Shirt 180gsm",
        color: "Dark Green",
        size: "M",
        material: "100% Organic Cotton",
        fit: "Slim Fit",
        price: 1290,
        discount: 0,
        quantity: 1,
        category: "Men > T-Shirts",
        itemCode: "37011432",
        baseAmount: 1093.22,
        tax: 196.78,
      },
      {
        id: 1,
        name: "Henley Linen-Blend T-Shirt",
        color: "Navy",
        size: "L",
        material: "Linen Blend",
        fit: "Slim Fit",
        price: 4290,
        discount: 429,
        quantity: 1,
        category: "Men > T-Shirts",
        itemCode: "27035965",
        baseAmount: 3635.59,
        tax: 654.41,
      },
      {
        id: 2,
        name: "Moby Straight-Fit Dark-Wash Jeans",
        color: "Dark Blue",
        size: "42",
        material: "Denim",
        fit: "Straight Fit",
        price: 4990,
        discount: 0,
        quantity: 1,
        category: "Men > Jeans",
        itemCode: "27041249",
        baseAmount: 4228.81,
        tax: 761.19,
      },
    ],
    // MRP total: 10570 — discount: 429 = 10141
    subtotal: 8528.62,  // unchanged
    tax: 1612.38,       // GST unchanged
    discount: 429,
    total: 10141,       // 10570 - 429
  },

  hist2: {
    id: "MNG-KM5590LP33",
    date: "15-02-2026",
    time: "12:45:33",
    associate: "Rohit Nair",
    branch: "Koramangala, BLR",
    items: [
      {
        id: 0,
        name: "Floral Linen-Blend Dress",
        color: "Pink",
        size: "10 Years",
        material: "Linen Blend",
        fit: "A-Line",
        price: 3590,
        discount: 0,
        quantity: 1,
        category: "Kids > Girls",
        itemCode: "27076746",
        baseAmount: 3042.37,
        tax: 547.63,
      },
      {
        id: 1,
        name: "Long Printed Jumpsuit",
        color: "Pink",
        size: "11 Years",
        material: "Printed Fabric",
        fit: "Regular Fit",
        price: 3890,
        discount: 0,
        quantity: 1,
        category: "Kids > Girls",
        itemCode: "27086748",
        baseAmount: 3296.61,
        tax: 593.39,
      },
      {
        id: 2,
        name: "Tropical Print Dress",
        color: "Green",
        size: "9 Years",
        material: "Cotton Blend",
        fit: "Regular Fit",
        price: 3290,
        discount: 0,
        quantity: 1,
        category: "Kids > Girls",
        itemCode: "27027948",
        baseAmount: 2788.14,
        tax: 501.86,
      },
    ],
    // No discounts
    subtotal: 9127.12,
    tax: 1642.88,
    discount: 0,
    total: 10770,
  },
}
const currentReceipt = receipts[currentReceiptId]

const totalSlides = 2

const transactionHistory = [
  {
    id: "current",
    date: "05-04-2026",
    branch: "MANGO",
    amount: currentReceiptId === "current"
      ? receipts.current.total
      : 24771,
  },
  {
    id: "hist1",
    date: "20-03-2026",
    branch: "MANGO",
    amount: 10141,
  },
  {
    id: "hist2",
    date: "15-02-2026",
    branch: "MANGO",
    amount: 10770,
  },
]
  
  const toggleProductExpansion = (productId: number) => {
    setExpandedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleProfileUpdate = () => {
    setProfileUpdateSuccess(true)
    setTimeout(() => setProfileUpdateSuccess(false), 3000)
  }

  const getModalPositionRelativeToContainer = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!buttonRef.current || !receiptContainerRef.current) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    }

    const button = buttonRef.current
    const container = receiptContainerRef.current

    const buttonRect = button.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    // Calculate position relative to container
    const relativeTop = buttonRect.top - containerRect.top
    const relativeLeft = buttonRect.left - containerRect.left

    // Modal dimensions (approximate)
    const modalWidth = Math.min(400, containerRect.width - 32)
    const modalHeight = 400

    // Calculate ideal top position (above button, with offset)
    let top = Math.max(16, relativeTop - modalHeight - 8)

    // If modal would go off top, place it below button
    if (top < 16) {
      top = relativeTop + buttonRect.height + 8
    }

    // If still too high, center it vertically
    if (top + modalHeight > containerRect.height) {
      top = Math.max(16, (containerRect.height - modalHeight) / 2)
    }

    // Calculate ideal left position (centered on button)
    let left = relativeLeft + buttonRect.width / 2 - modalWidth / 2

    // Keep modal within horizontal bounds
    left = Math.max(16, Math.min(left, containerRect.width - modalWidth - 16))

    return {
      position: "absolute" as const,
      top: `${top}px`,
      left: `${left}px`,
      width: `${modalWidth}px`,
      maxHeight: "85vh",
    }
  }

  const handleFeedbackModalOpen = () => {
    setShowFeedbackModal(true)
  }

  const handleTransactionHistoryOpen = () => {
    setShowTransactionHistory(true)
  }

  const handleReferModalOpen = () => {
    setShowReferModal(true)
  }

  const handleFeedbackSubmit = () => {
    setFeedbackSubmitted(true)
    setShowFeedbackModal(false)
    setTimeout(() => setFeedbackSubmitted(false), 5000)
  }

  const handleShare = () => {
    handleReferModalOpen()
  }

  const handleEmailReceipt = () => {
    window.open(`mailto:?subject=Receipt from Mango Bangalore&body=Receipt ID: ${currentReceipt.id}`)
  }

  const handleDownloadReceipt = () => {
    const receiptContent = `
  <!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>MANGO Official Digital Receipt</title>

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:'Poppins',sans-serif;
    background:#ffffff;
    color:#1A1A1A;
    width:800px;
    margin:0 auto;
    padding:40px;
}

/* Header */

.receipt-header{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    padding-bottom:24px;
    border-bottom:1px solid #E8E8E8;
    margin-bottom:30px;
}

.logo{
    font-size:42px;
    letter-spacing:6px;
    font-weight:500;
    margin-bottom:12px;
}

.store-info{
    font-size:12px;
    line-height:1.8;
    color:#6F6F6F;
}

.store-info strong{
    color:#1A1A1A;
    font-weight:600;
}

.bill-info{
    text-align:right;
}

.bill-label{
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:2px;
    color:#8B6F5E;
    margin-bottom:3px;
}

.bill-value{
    font-size:13px;
    color:#1A1A1A;
    margin-bottom:12px;
    font-weight:500;
}

/* Customer */

.customer-section{
    background:#F8F8F8;
    border:1px solid #ECECEC;
    border-radius:18px;
    padding:20px;
    margin-bottom:30px;
}

.customer-title{
    font-size:11px;
    text-transform:uppercase;
    letter-spacing:2px;
    color:#8B6F5E;
    margin-bottom:8px;
}

.customer-name{
    font-size:22px;
    font-weight:400;
    color:#1A1A1A;
}

.customer-status{
    font-size:12px;
    color:#8B6F5E;
    margin-top:6px;
}

/* Table */

.items-table{
    width:100%;
    border-collapse:collapse;
    margin-bottom:30px;
}

.items-table th{
    text-align:left;
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:2px;
    color:#8B6F5E;
    padding-bottom:12px;
    border-bottom:1px solid #E8E8E8;
    font-weight:500;
}

.items-table td{
    padding:18px 0;
    border-bottom:1px solid #F0F0F0;
    vertical-align:top;
}

.item-name{
    font-size:14px;
    color:#1A1A1A;
    font-weight:500;
    margin-bottom:6px;
}

.item-meta{
    font-size:11px;
    color:#8B6F5E;
    line-height:1.8;
}

.qty{
    text-align:center;
    font-size:13px;
}

.price{
    text-align:right;
    font-size:14px;
    font-weight:500;
}

/* Totals */

.totals{
    margin-top:20px;
    border-top:1px solid #E8E8E8;
    padding-top:20px;
}

.total-row{
    display:flex;
    justify-content:space-between;
    margin-bottom:12px;
    font-size:13px;
}

.total-row span:first-child{
    color:#8B6F5E;
}

.grand-total{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-top:20px;
    padding-top:20px;
    border-top:1px solid #E8E8E8;
}

.grand-total-label{
    font-size:12px;
    text-transform:uppercase;
    letter-spacing:2px;
    color:#8B6F5E;
}

.grand-total-value{
    font-size:32px;
    font-weight:300;
    color:#1A1A1A;
}

/* Payment */

.payment-box{
    background:#1A1A1A;
    border-radius:20px;
    padding:18px 22px;
    margin-top:30px;
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.payment-label{
    font-size:10px;
    text-transform:uppercase;
    letter-spacing:2px;
    color:#C8A882;
    margin-bottom:6px;
}

.payment-method{
    color:white;
    font-size:14px;
}

.payment-amount{
    color:white;
    font-size:20px;
    font-weight:500;
}

/* Footer */

.footer{
    margin-top:50px;
    padding-top:30px;
    border-top:1px solid #ECECEC;
    text-align:center;
}

.footer-title{
    font-size:18px;
    color:#1A1A1A;
    margin-bottom:10px;
}

.footer-text{
    color:#8B6F5E;
    font-size:12px;
    line-height:1.8;
}

.powered{
    margin-top:25px;
    font-size:10px;
    letter-spacing:3px;
    color:#BBBBBB;
}

@media print{

    body{
        width:100%;
        padding:20px;
        -webkit-print-color-adjust:exact;
    }

}

</style>
</head>

<body>

<div class="receipt-header">

    <div>

        <div class="logo">MANGO</div>

        <div class="store-info">
            <strong>MANGO UB City</strong><br>
            UB City Mall<br>
            24 Vittal Mallya Road<br>
            Ashok Nagar<br>
            Bengaluru, Karnataka 560001
        </div>

    </div>

    <div class="bill-info">

        <div class="bill-label">Receipt ID</div>
        <div class="bill-value">#MNG-BR7891XQ12</div>

        <div class="bill-label">Date</div>
        <div class="bill-value">05 April 2026</div>

        <div class="bill-label">Store Associate</div>
        <div class="bill-value">Priya Mehta</div>

    </div>

</div>

<div class="customer-section">

    <div class="customer-title">
        Customer
    </div>

    <div class="customer-name">
        Vikas
    </div>

    <div class="customer-status">
        Verified Purchase
    </div>

</div>

<table class="items-table">

    <thead>

        <tr>
            <th style="width:55%">Product</th>
            <th style="width:15%">Qty</th>
            <th style="width:30%; text-align:right;">Amount</th>
        </tr>

    </thead>

    <tbody>

        <tr>

            <td>

                <div class="item-name">
                    Long Satin Dress
                </div>

                <div class="item-meta">
                    Colour: Burnt Orange<br>
                    Size: M<br>
                    Fit: Fitted<br>
                    Material: Silk Mix Satin
                </div>

            </td>

            <td class="qty">1</td>

            <td class="price">
                ₹11,990
            </td>

        </tr>

        <tr>

            <td>

                <div class="item-name">
                    Boat-Neck Ruched Dress
                </div>

                <div class="item-meta">
                    Colour: Red<br>
                    Size: M<br>
                    Fit: Regular Fit<br>
                    Material: Woven Fabric
                </div>

            </td>

            <td class="qty">1</td>

            <td class="price">
                ₹5,990
            </td>

        </tr>

        <tr>

            <td>

                <div class="item-name">
                    Satin Dress with Gathered V-Neckline
                </div>

                <div class="item-meta">
                    Colour: Orange<br>
                    Size: S<br>
                    Fit: Regular Fit<br>
                    Material: Satin
                </div>

            </td>

            <td class="qty">1</td>

            <td class="price">
                ₹7,990
            </td>

        </tr>

    </tbody>

</table>

<div class="totals">

    <div class="total-row">
        <span>Subtotal</span>
        <span>₹22,008.48</span>
    </div>

    <div class="total-row">
        <span>GST</span>
        <span>₹3,961.52</span>
    </div>

    <div class="total-row">
        <span>Total Units</span>
        <span>3</span>
    </div>

    <div class="grand-total">

        <div class="grand-total-label">
            Total Paid
        </div>

        <div class="grand-total-value">
            ₹25,970
        </div>

    </div>

</div>

<div class="payment-box">

    <div>

        <div class="payment-label">
            Payment Method
        </div>

        <div class="payment-method">
            Card •••• 4532
        </div>

    </div>

    <div class="payment-amount">
        ₹25,970
    </div>

</div>

<div class="footer">

    <div class="footer-title">
        Thank You For Shopping With MANGO
    </div>

    <div class="footer-text">
        Explore new arrivals, seasonal collections and timeless wardrobe essentials at<br>
        shop.mango.com/in/en
    </div>

    <div class="powered">
        POWERED BY RDEP
    </div>

</div>

</body>
</html>
`

    const blob = new Blob([receiptContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "Mango_Receipt_S001.html"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleWhatsApp = () => {
    window.open("https://wa.me/+919620921294", "_blank")
  }

  const handleCall = () => {
    window.open("tel:+919620921294", "_blank")
  }

  const handleEmail = () => {
    window.open("mailto:sagar.p@proenx.com", "_blank")
  }

  const handleSocialLink = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div
        id="receipt-root"
        ref={receiptContainerRef}
        className="w-full max-w-md mx-auto bg-white shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col w-full gap-3 pb-4 px-3">

         {/* MANGO Premium Fashion Header */}
<div className="bg-white rounded-3xl shadow-xl border border-[#ECECEC] mt-4 mx-4 overflow-hidden">

  {/* Logo + Amount in one row */}
  <div className="px-5 pt-4 pb-3 bg-white flex items-center justify-between">

    <div>
      <img
        src="/images/design-mode/mango.png"
        alt="MANGO"
        className="h-6 w-auto object-contain"
      />
      <p className="mt-1.5 text-[9px] uppercase tracking-[0.22em] text-[#8B6F5E] font-medium">
        Thank you, {customerName}
      </p>
    </div>

    <div className="text-right">
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#8B6F5E] font-medium">
        Total Paid
      </div>
      <div className="text-[22px] leading-none font-light tracking-[-0.03em] text-[#000000] tabular-nums mt-1">
        ₹{currentReceipt.total.toLocaleString("en-IN")}
      </div>
    </div>

  </div>

  {/* Slim metadata strip */}
  <div className="px-5 py-2.5 bg-[#F8F8F8] border-t border-[#ECECEC] flex items-center justify-between">

    <div className="flex items-center gap-3 text-[10px] text-[#8B6F5E]">
      <span className="font-medium text-[#1A1A1A]">#{currentReceipt.id.slice(-8)}</span>
      <span className="text-[#C8A882]">•</span>
      <span>{currentReceipt.date}</span>
      <span className="text-[#C8A882]">•</span>
      <span>{currentReceipt.time}</span>
    </div>

    <div className="bg-[#C8A882] text-black text-[9px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
      Paid
    </div>

  </div>

</div>
          
         {/* MANGO Purchase Details Section */}
<div className="bg-white rounded-3xl shadow-xl border border-[#ECECEC] mt-3 mx-4 p-4">

  {/* Header */}
  <div className="flex items-center justify-between mb-3">

    <h3 className="text-[13px] font-medium uppercase tracking-[0.18em] flex items-center text-[#1A1A1A]">
      <Package className="mr-2 h-4 w-4 text-[#C8A882]" />
      Purchase Summary
    </h3>

    <span className="text-[10px] font-medium bg-[#F5F5F5] text-[#8B6F5E] border border-[#E7E7E7] px-3 py-1 rounded-full uppercase tracking-[0.12em]">
      {currentReceipt.items.length} Items
    </span>

  </div>

  {/* Items */}
  <div className="space-y-2">

    {currentReceipt.items.map((product) => (

      <div
        key={product.id}
        className="bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl p-3 transition-all duration-200"
      >

        {/* Product Header */}
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => toggleProductExpansion(product.id)}
        >

          <div className="flex items-start flex-1">

            <ChevronRight
              className={`h-4 w-4 mt-0.5 mr-2 text-[#8B6F5E] transition-transform duration-200 flex-shrink-0 ${
                expandedProducts.includes(product.id) ? "rotate-90" : ""
              }`}
            />

            <div>

              <div className="font-medium text-[13px] text-[#1A1A1A] tracking-[-0.01em] leading-snug">
                {product.name}
              </div>

              <div className="text-[10px] text-[#8B6F5E] uppercase tracking-[0.10em] mt-0.5 flex items-center gap-1.5">
                <span>Size {product.size}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-[#DDDDDD]">•</span>
                    <span className="text-[#B05E2F]">
                      −₹{product.discount.toLocaleString("en-IN")} off
                    </span>
                  </>
                )}
              </div>

            </div>

          </div>

          <div className="text-right ml-3 flex-shrink-0">

            <div className="text-[10px] uppercase tracking-[0.12em] text-[#8B6F5E]">
              Qty {product.quantity}
            </div>

            {product.discount > 0 ? (
              <div className="mt-0.5">
                <div className="text-[11px] text-[#AAAAAA] line-through leading-none">
                  ₹{product.price.toLocaleString("en-IN")}
                </div>
                <div className="font-semibold text-[13px] text-[#1A1A1A] leading-snug">
                  ₹{(product.price - product.discount).toLocaleString("en-IN")}
                </div>
              </div>
            ) : (
              <div className="font-semibold text-[13px] text-[#1A1A1A] mt-0.5">
                ₹{product.price.toLocaleString("en-IN")}
              </div>
            )}

          </div>

        </div>

        {/* Expanded Product Details */}
        {expandedProducts.includes(product.id) && (

          <div className="mt-3 pt-3 border-t border-[#E5E5E5]">

            <div className="grid grid-cols-2 gap-y-3">

              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-[#8B6F5E]">
                  Reference
                </div>
                <div className="text-[11px] text-[#1A1A1A] mt-0.5">
                  {product.itemCode}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[9px] uppercase tracking-[0.15em] text-[#8B6F5E]">
                  Colour
                </div>
                <div className="text-[11px] text-[#1A1A1A] mt-0.5">
                  {product.color}
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-[#8B6F5E]">
                  Fit
                </div>
                <div className="text-[11px] text-[#1A1A1A] mt-0.5">
                  {product.fit}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[9px] uppercase tracking-[0.15em] text-[#8B6F5E]">
                  Material
                </div>
                <div className="text-[11px] text-[#1A1A1A] mt-0.5">
                  {product.material}
                </div>
              </div>

            </div>

          </div>

        )}

        {/* Inline Product Rating */}
        <div className="mt-3 flex items-center gap-3">

          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#8B6F5E]">
            Rate
          </span>

          <div className="flex items-center gap-1">

            {[1, 2, 3, 4, 5].map((star) => (

              <button
                key={star}
                onClick={() => {
                  setItemRating(product.id, star)
                  if (!expandedItemFeedback.includes(product.id)) {
                    toggleItemFeedback(product.id)
                  }
                }}
                className="transition-transform hover:scale-110"
              >

                <Star
                  className={`h-4 w-4 transition-all duration-200 ${
                    star <= (itemFeedback[product.id]?.rating || 0)
                      ? "fill-[#C8A882] text-[#C8A882]"
                      : "text-[#D8D8D8] hover:text-[#C8A882]"
                  }`}
                />

              </button>

            ))}

          </div>

        </div>

        {/* Review Panel */}
        {expandedItemFeedback.includes(product.id) && (

          <div className="mt-3 bg-white rounded-2xl border border-[#ECECEC] p-3">

            <div className="flex flex-wrap gap-2 justify-center">

              {["Comfort", "Fit", "Style", "Quality"].map((tag) => {

                const isActive = itemFeedback[product.id]?.tags?.includes(tag)

                return (

                  <button
                    key={tag}
                    onClick={() => toggleItemTag(product.id, tag)}
                    className={`text-[10px] uppercase tracking-[0.08em] px-3 py-1.5 rounded-full border transition-colors ${
                      isActive
                        ? "bg-[#C8A882] border-[#C8A882] text-black"
                        : "border-[#E5E5E5] text-[#8B6F5E] hover:bg-[#F8F8F8]"
                    }`}
                  >
                    {tag}
                  </button>

                )

              })}

            </div>

          </div>

        )}

      </div>

    ))}

  </div>

  {/* Totals */}
  <div className="mt-4 pt-4 border-t border-[#ECECEC] space-y-2">

    <div className="flex justify-between text-[11px] uppercase tracking-[0.08em] text-[#8B6F5E]">
      <span>Subtotal (MRP)</span>
      <span className="text-[#1A1A1A]">
        ₹{currentReceipt.items.reduce((acc, i) => acc + i.price * i.quantity, 0).toLocaleString("en-IN")}
      </span>
    </div>

    {currentReceipt.discount > 0 && (
      <div className="flex justify-between text-[11px] uppercase tracking-[0.08em] text-[#B05E2F]">
        <span>Discount</span>
        <span>−₹{currentReceipt.discount.toLocaleString("en-IN")}</span>
      </div>
    )}

    <div className="flex justify-between text-[11px] uppercase tracking-[0.08em] text-[#8B6F5E]">
      <span>GST</span>
      <span className="text-[#1A1A1A]">
        ₹{currentReceipt.tax.toLocaleString("en-IN")}
      </span>
    </div>

    <div className="flex justify-between items-end pt-3 border-t border-[#E5E5E5]">

      <span className="text-[13px] uppercase tracking-[0.12em] text-[#8B6F5E]">
        Total Paid
      </span>

      <span className="text-[24px] leading-none font-light tracking-[-0.02em] text-[#000000]">
        ₹{currentReceipt.total.toLocaleString("en-IN")}
      </span>

    </div>

  </div>

  {/* Payment */}
  <div className="mt-4">

    <div className="bg-[#1A1A1A] rounded-2xl p-4 flex items-center justify-between">

      <div className="flex items-center">

        <div className="w-10 h-10 bg-[#C8A882]/15 rounded-xl flex items-center justify-center mr-3">
          <CreditCard className="w-5 h-5 text-[#C8A882]" />
        </div>

        <div>

          <div className="text-[10px] uppercase tracking-[0.12em] text-[#C8A882]">
            Payment Method
          </div>

          <div className="text-sm text-white mt-1">
            Card •••• 4532
          </div>

        </div>

      </div>

      <div className="text-right">

        <div className="text-[18px] font-medium text-white">
          ₹{currentReceipt.total.toLocaleString("en-IN")}
        </div>

      </div>

    </div>

  </div>

</div>
          
          {/* MANGO Feedback Section */}
<div className="bg-white rounded-3xl border border-[#ECECEC] shadow-xl mx-4 mt-6 p-5">

  {feedbackSubmitted ? (

    <div className="text-center py-8 bg-[#FAFAFA] rounded-2xl border border-[#ECECEC]">

      <div className="w-14 h-14 bg-[#C8A882]/15 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-6 h-6 text-[#8B6F5E]" />
      </div>

      <div className="text-[16px] font-medium text-[#1A1A1A]">
        Thank You
      </div>

      <div className="text-[11px] text-[#8B6F5E] mt-2 max-w-[240px] mx-auto leading-relaxed">
        Your feedback helps us create a better experience at every MANGO store.
      </div>

      {/* Google Review CTA — post submit */}
      <button
        onClick={() =>
          window.open(
            "https://search.google.com/local/writereview?placeid=PLACE_ID_HERE",
            "_blank"
          )
        }
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#ECECEC] rounded-full text-[11px] text-[#1A1A1A] hover:border-[#C8A882] transition-all shadow-sm"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Also leave a Google Review
      </button>

    </div>

  ) : (

    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center">

        <div className="w-10 h-10 rounded-xl bg-[#C8A882]/15 flex items-center justify-center mr-3">
          <MessageSquare className="h-4 w-4 text-[#8B6F5E]" />
        </div>

        <div>
          <h3 className="text-[14px] font-medium text-[#1A1A1A]">
            Rate Your Visit
          </h3>
          <p className="text-[11px] text-[#8B6F5E] mt-0.5">
            How was your experience at MANGO {currentReceipt.branch}?
          </p>
        </div>

      </div>

      {/* Rating */}
      <div className="flex justify-center gap-4 py-1">

        {[1, 2, 3, 4, 5].map((star) => (

          <button
            key={star}
            onClick={() => {
              setRating(star)
              setSelectedTags([])
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= rating
                  ? "fill-[#C8A882] text-[#C8A882]"
                  : "text-[#D8D8D8]"
              }`}
            />
          </button>

        ))}

      </div>

      {/* Feedback Chips */}
      {rating > 0 && (

        <div className="space-y-2">

          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E]">
            {rating >= 4 ? "What stood out most?" : "How can we improve?"}
          </div>

          <div className="flex flex-wrap gap-2">

            {(rating >= 4
              ? ["Style", "Fit", "Fabric Quality", "Store Experience", "Collection", "Easy Checkout"]
              : ["Sizing", "Availability", "Checkout Time", "Product Quality", "Store Support", "Pricing"]
            ).map((item) => (

              <button
                key={item}
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(item)
                      ? prev.filter((tag) => tag !== item)
                      : [...prev, item]
                  )
                }
                className={`text-[11px] px-3 py-1.5 rounded-full border transition-all ${
                  selectedTags.includes(item)
                    ? "bg-[#C8A882] border-[#C8A882] text-black"
                    : "bg-[#F8F8F8] border-[#ECECEC] text-[#8B6F5E]"
                }`}
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      )}

      {/* Comment Box */}
      <div>

        <label className="block text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-2">
          Additional Comments
        </label>

        <textarea
          rows={3}
          placeholder="Tell us about your experience..."
          className="w-full p-3 text-sm bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl focus:bg-white focus:border-[#C8A882] outline-none resize-none transition-all text-[#1A1A1A] placeholder:text-[#B5B5B5]"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />

      </div>

      {/* Submit */}
      <button
        className={`w-full h-11 rounded-2xl text-[12px] uppercase tracking-[0.18em] transition-all ${
          rating
            ? "bg-[#1A1A1A] text-white hover:bg-black"
            : "bg-[#F5F5F5] text-[#B5B5B5] cursor-not-allowed"
        }`}
        onClick={handleFeedbackSubmit}
        disabled={!rating}
      >
        {rating ? "Submit Feedback" : "Select a Rating"}
      </button>

      {/* Google Review nudge — shown only when rating is 4 or 5 */}
      {rating >= 4 && (
        <button
          onClick={() =>
            window.open(
              "https://search.google.com/local/writereview?placeid=PLACE_ID_HERE",
              "_blank"
            )
          }
          className="w-full h-11 rounded-2xl border border-[#ECECEC] bg-[#F8F8F8] text-[11px] text-[#1A1A1A] flex items-center justify-center gap-2 hover:border-[#C8A882] transition-all"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Leave a Google Review for this store
        </button>
      )}

      <p className="text-center text-[10px] text-[#8B6F5E]">
        Your feedback helps us refine every collection and in-store experience.
      </p>

    </div>

  )}

</div>
          
{/* MANGO Editorial Carousel */}
<div className="bg-white rounded-3xl overflow-hidden mx-4 mt-6 relative shadow-xl border border-[#ECECEC]">

  <Carousel
    className="w-full"
    setApi={setPromoApi}
    opts={{
      loop: true,
    }}
  >

    <CarouselContent>

      {/* Banner 1 - Kids World Cup Collection */}
      <CarouselItem>

        <div className="relative w-full aspect-[5/3]">

          <a
            href="https://shop.mango.com/in/en/i/kids/boys/world-cup-collection/c948a54e"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >

            <Image
              src="/images/design-mode/mango-banner-1.png"
              alt="MANGO Kids World Cup Collection"
              fill
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />

          </a>

          <div className="absolute bottom-6 left-6">

            <a
              href="https://shop.mango.com/in/en/i/kids/boys/world-cup-collection/c948a54e"
              target="_blank"
              rel="noopener noreferrer"
            >

              <button className="bg-white/95 backdrop-blur text-[#1A1A1A] text-[11px] px-5 py-2 rounded-full border border-white/50 hover:bg-white transition-all">
                Explore Collection
              </button>

            </a>

          </div>

        </div>

      </CarouselItem>

      {/* Banner 2 - Total White */}
      <CarouselItem>

        <div className="relative w-full aspect-[5/3]">

          <a
            href="https://shop.mango.com/in/en/i/women/total-white/f1e2d25c"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >

            <Image
              src="/images/design-mode/mango-banner-2.png"
              alt="MANGO Total White"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />

          </a>

          <div className="absolute bottom-6 left-6">

            <a
              href="https://shop.mango.com/in/en/i/women/total-white/f1e2d25c"
              target="_blank"
              rel="noopener noreferrer"
            >

              <button className="bg-white/95 backdrop-blur text-[#1A1A1A] text-[11px] px-5 py-2 rounded-full border border-white/50 hover:bg-white transition-all">
                Shop The Edit
              </button>

            </a>

          </div>

        </div>

      </CarouselItem>

      {/* Banner 3 - Suit Guide */}
      <CarouselItem>

        <div className="relative w-full aspect-[5/3]">

          <a
            href="https://shop.mango.com/in/en/i/men/suit-guide/5162340e"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full"
          >

            <Image
              src="/images/design-mode/mango-banner-3.png"
              alt="MANGO Suit Guide"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />

          </a>

          <div className="absolute bottom-6 left-6">

            <a
              href="https://shop.mango.com/in/en/i/men/suit-guide/5162340e"
              target="_blank"
              rel="noopener noreferrer"
            >

              <button className="bg-white/95 backdrop-blur text-[#1A1A1A] text-[11px] px-5 py-2 rounded-full border border-white/50 hover:bg-white transition-all">
                View Guide
              </button>

            </a>

          </div>

        </div>

      </CarouselItem>

    </CarouselContent>

    {/* Mango Style Indicators */}
    <div className="absolute bottom-4 right-5 flex gap-2 z-10">

      {[0, 1, 2].map((index) => (

        <button
          key={index}
          onClick={() => promoApi?.scrollTo(index)}
          className={`transition-all duration-300 rounded-full ${
            currentSlide === index
              ? "w-8 h-2 bg-[#C8A882]"
              : "w-2 h-2 bg-white/60"
          }`}
        />

      ))}

    </div>

  </Carousel>

</div>
          
       {/* Profile & Preferences */}
<div className="bg-white rounded-3xl shadow-xl border border-[#ECECEC] mx-4 mt-6 p-5">

  {profileUpdateSuccess ? (

    <div className="text-center py-8 bg-[#FAFAFA] rounded-2xl border border-[#ECECEC]">

      <div className="w-14 h-14 bg-[#C8A882]/15 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-6 h-6 text-[#8B6F5E]" />
      </div>

      <div className="text-[16px] font-medium text-[#1A1A1A]">
        Details Saved
      </div>

      <div className="text-[11px] text-[#8B6F5E] mt-2 max-w-[240px] mx-auto leading-relaxed">
        Your profile and communication preferences have been updated.
      </div>

    </div>

  ) : (

    <>

      {/* Header */}
      <div className="flex items-start mb-5">

        <div className="w-10 h-10 rounded-xl bg-[#C8A882]/15 flex items-center justify-center mr-3 flex-shrink-0">
          <User2 className="h-4 w-4 text-[#8B6F5E]" />
        </div>

        <div>
          <h3 className="text-[14px] font-medium text-[#1A1A1A]">
            Your Profile
          </h3>
          <p className="text-[11px] text-[#8B6F5E] mt-0.5 leading-relaxed">
            Save your details for faster service and personalised updates.
          </p>
        </div>

      </div>

      {/* Form */}
      <div className="space-y-3">

        <div>
          <label className="block text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={profile.name}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full h-11 px-4 text-sm bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl focus:outline-none focus:border-[#C8A882] focus:bg-white transition-all placeholder:text-[#B8B8B8]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@email.com"
            value={profile.email}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full h-11 px-4 text-sm bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl focus:outline-none focus:border-[#C8A882] focus:bg-white transition-all placeholder:text-[#B8B8B8]"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-1.5">
            Mobile Number
          </label>
          <input
            type="tel"
            placeholder="+91"
            value={profile.mobile}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, mobile: e.target.value }))
            }
            className="w-full h-11 px-4 text-sm bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl focus:outline-none focus:border-[#C8A882] focus:bg-white transition-all placeholder:text-[#B8B8B8]"
          />
        </div>

      </div>

      {/* Communication Preferences */}
      <div className="mt-5 pt-4 border-t border-[#ECECEC]">

        <div className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-3">
          Communication Preferences
        </div>

        <div className="space-y-2">

          {/* Transactional — always on, locked */}
          <div className="flex items-center justify-between bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl px-4 py-3">

            <div className="flex-1 mr-3">
              <div className="text-[12px] font-medium text-[#1A1A1A]">
                Purchase & Order Updates
              </div>
              <div className="text-[10px] text-[#8B6F5E] mt-0.5">
                Receipts and return confirmations. Always on.
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="w-9 h-5 bg-[#C8A882] rounded-full flex items-center justify-end px-0.5 opacity-60 cursor-not-allowed">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

          </div>

          {/* Promotional opt-in */}
          <div
            className="flex items-center justify-between bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl px-4 py-3 cursor-pointer"
            onClick={() =>
              setProfile((prev) => ({
                ...prev,
                promoOptIn: !prev.promoOptIn,
              }))
            }
          >

            <div className="flex-1 mr-3">
              <div className="text-[12px] font-medium text-[#1A1A1A]">
                New Arrivals & Offers
              </div>
              <div className="text-[10px] text-[#8B6F5E] mt-0.5">
                Collections, member offers and seasonal edits.
              </div>
            </div>

            <div className="flex-shrink-0">
              <div
                className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all duration-200 ${
                  profile.promoOptIn
                    ? "bg-[#C8A882] justify-end"
                    : "bg-[#E0E0E0] justify-start"
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* CTA */}
      <button
        className="w-full mt-5 h-11 bg-[#1A1A1A] text-white rounded-2xl text-[12px] uppercase tracking-[0.18em] hover:bg-black transition-all"
        onClick={handleProfileUpdate}
      >
        Save Details
      </button>

      <div className="text-[10px] text-[#8B6F5E] text-center mt-3 leading-relaxed">
        Your information is used only for purchase communication and personalisation.
        We never share your data with third parties.
      </div>

    </>

  )}

</div>
          
      {/* MANGO Club Status */}
<div className="bg-white rounded-3xl shadow-xl border border-[#ECECEC] mt-6 mx-4 p-6">

  {/* Header */}
  <div className="flex items-center justify-between mb-6">

    <div className="flex items-center">

      <div className="w-10 h-10 bg-[#C8A882]/15 rounded-xl flex items-center justify-center mr-3">
        <Crown className="h-5 w-5 text-[#8B6F5E]" />
      </div>

      <div>
        <h3 className="text-[15px] font-medium text-[#1A1A1A]">
          MANGO Club
        </h3>

        <p className="text-[11px] text-[#8B6F5E] mt-1">
          Member benefits and exclusive fashion access
        </p>
      </div>

    </div>

    <div>
      <span className="bg-[#C8A882] text-black text-[10px] uppercase tracking-[0.12em] px-3 py-1 rounded-full">
        Premium
      </span>
    </div>

  </div>

  {/* Membership Overview */}

  <div className="grid grid-cols-2 gap-3 mb-6">

    <div className="bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl p-4">

      <div className="text-[10px] uppercase tracking-[0.12em] text-[#8B6F5E] mb-2">
        Annual Spend
      </div>

      <div className="text-[24px] font-light text-[#1A1A1A]">
        ₹18,420
      </div>

    </div>

    <div className="bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl p-4">

      <div className="text-[10px] uppercase tracking-[0.12em] text-[#8B6F5E] mb-2">
        Purchases
      </div>

      <div className="text-[24px] font-light text-[#1A1A1A]">
        12
      </div>

    </div>

  </div>

  {/* Tier Progress */}

  <div className="bg-[#1A1A1A] rounded-2xl p-5 mb-6">

    <div className="flex justify-between items-center mb-4">

      <div>

        <div className="text-[10px] uppercase tracking-[0.15em] text-[#C8A882]">
          Current Tier
        </div>

        <div className="text-white text-lg font-medium mt-1">
          Premium Member
        </div>

      </div>

      <div className="text-right">

        <div className="text-white text-sm">
          ₹18,420 / ₹25,000
        </div>

      </div>

    </div>

    <div className="h-2 bg-white/10 rounded-full overflow-hidden">

      <div
        className="h-full bg-[#C8A882] rounded-full"
        style={{ width: "74%" }}
      />

    </div>

    <div className="mt-3 text-[11px] text-white/70 leading-relaxed">
      Spend another <span className="text-white">₹6,580</span> to unlock
      Signature status and receive priority access to selected collections.
    </div>

  </div>

  {/* Tiers */}

  <div className="mb-6">

    <div className="text-[11px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-4">
      Membership Levels
    </div>

    <div className="space-y-3">

      <div className="flex items-center justify-between p-3 rounded-xl border border-[#ECECEC] bg-[#FAFAFA]">

        <div>
          <div className="text-sm text-[#1A1A1A]">
            Essential
          </div>
          <div className="text-[11px] text-[#8B6F5E]">
            Welcome benefits
          </div>
        </div>

        <Check className="h-4 w-4 text-[#C8A882]" />

      </div>

      <div className="flex items-center justify-between p-3 rounded-xl border border-[#C8A882] bg-[#C8A882]/10">

        <div>
          <div className="text-sm text-[#1A1A1A] font-medium">
            Premium
          </div>
          <div className="text-[11px] text-[#8B6F5E]">
            Current Membership
          </div>
        </div>

        <Crown className="h-4 w-4 text-[#8B6F5E]" />

      </div>

      <div className="flex items-center justify-between p-3 rounded-xl border border-[#ECECEC]">

        <div>
          <div className="text-sm text-[#1A1A1A]">
            Signature
          </div>
          <div className="text-[11px] text-[#8B6F5E]">
            Exclusive access tier
          </div>
        </div>

        <Lock className="h-4 w-4 text-[#BDBDBD]" />

      </div>

    </div>

  </div>

  {/* Active Benefits */}

  <div>

    <div className="text-[11px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-4">
      Active Benefits
    </div>

    <div className="grid grid-cols-2 gap-3">

      <div className="bg-[#F8F8F8] rounded-xl p-3 border border-[#ECECEC] text-[12px] text-[#1A1A1A]">
        Early Collection Access
      </div>

      <div className="bg-[#F8F8F8] rounded-xl p-3 border border-[#ECECEC] text-[12px] text-[#1A1A1A]">
        Priority Sale Access
      </div>

      <div className="bg-[#F8F8F8] rounded-xl p-3 border border-[#ECECEC] text-[12px] text-[#1A1A1A]">
        Personalised Picks
      </div>

      <div className="bg-[#F8F8F8] rounded-xl p-3 border border-[#ECECEC] text-[12px] text-[#1A1A1A]">
        Express Checkout
      </div>

    </div>

  </div>

</div>
          
{/* Discover More From MANGO */}
<div className="bg-white rounded-3xl shadow-xl border border-[#ECECEC] mx-4 mt-6 p-6">

  {/* Header */}
  <div className="flex items-center mb-6">

    <div className="w-10 h-10 rounded-xl bg-[#C8A882]/15 flex items-center justify-center mr-4">
      <LayoutGrid className="h-5 w-5 text-[#8B6F5E]" />
    </div>

    <div>
      <h3 className="text-[15px] font-medium text-[#1A1A1A]">
        Discover More
      </h3>

      <p className="text-[11px] text-[#8B6F5E] mt-1">
        Explore curated collections from MANGO
      </p>
    </div>

  </div>

  {/* Categories */}
  <div className="grid grid-cols-2 gap-4">

    {/* Dresses */}
    <a
      href="https://shop.mango.com/in/en/c/women/dresses-and-jumpsuits/e6bb8705"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-[#F8F8F8]">

        <div className="relative aspect-[539/754]">

          <Image
            src="/images/design-mode/Dress.png"
            alt="Women's Dresses"
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />

        </div>

        <div className="p-4 border-t border-[#ECECEC]">

          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-1">
            Women
          </div>

          <div className="text-[14px] text-[#1A1A1A]">
            Dresses
          </div>

        </div>

      </div>
    </a>

    {/* Bags */}
    <a
      href="https://shop.mango.com/in/en/c/women/bags/8dff98e6"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-[#F8F8F8]">

        <div className="relative aspect-[539/754]">

          <Image
            src="/images/design-mode/bag.png"
            alt="Women's Bags"
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />

        </div>

        <div className="p-4 border-t border-[#ECECEC]">

          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-1">
            Women
          </div>

          <div className="text-[14px] text-[#1A1A1A]">
            Bags
          </div>

        </div>

      </div>
    </a>

    {/* Teen Trousers */}
    <a
      href="https://shop.mango.com/in/en/c/teen/teena/trousers/ab68c0bd"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-[#F8F8F8]">

        <div className="relative aspect-[539/754]">

          <Image
            src="/images/design-mode/trouser.png"
            alt="Teen Trousers"
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />

        </div>

        <div className="p-4 border-t border-[#ECECEC]">

          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-1">
            Teen
          </div>

          <div className="text-[14px] text-[#1A1A1A]">
            Trousers
          </div>

        </div>

      </div>
    </a>

    {/* Blazers */}
    <a
      href="https://shop.mango.com/in/en/c/men/blazers/34c56468"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-[#F8F8F8]">

        <div className="relative aspect-[539/754]">

          <Image
            src="/images/design-mode/blazer.png"
            alt="Men's Blazers"
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />

        </div>

        <div className="p-4 border-t border-[#ECECEC]">

          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-1">
            Men
          </div>

          <div className="text-[14px] text-[#1A1A1A]">
            Blazers
          </div>

        </div>

      </div>
    </a>

  </div>

  {/* Main CTA */}

  <div className="mt-8 pt-6 border-t border-[#ECECEC]">

    <a
      href="https://shop.mango.com/in/en"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between w-full h-14 px-5 bg-[#1A1A1A] text-white rounded-2xl transition-all duration-300 hover:bg-black"
    >

      <span className="text-[12px] uppercase tracking-[0.18em]">
        Explore Mango
      </span>

      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />

    </a>

  </div>

  <p className="text-[10px] text-center text-[#8B6F5E] mt-4 leading-relaxed">
    Discover new arrivals, seasonal collections and timeless wardrobe essentials.
  </p>

</div>
          
         {/* Receipt Actions */}
<div className="bg-white rounded-3xl border border-[#ECECEC] shadow-xl mx-4 mt-6 p-6">

  <div className="mb-5">
    <h3 className="text-[15px] font-medium text-[#1A1A1A]">
      Receipt Services
    </h3>

    <p className="text-[11px] text-[#8B6F5E] mt-1">
      Access and manage your purchase documents.
    </p>
  </div>

  <div className="grid grid-cols-3 gap-4">

    {/* History */}
    <button
      ref={historyButtonRef}
      onClick={handleTransactionHistoryOpen}
      className="group flex flex-col items-center justify-center bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl py-4 transition-all hover:border-[#C8A882] active:scale-[0.97]"
    >

      <div className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center mb-3">
        <History className="h-5 w-5 text-[#8B6F5E]" />
      </div>

      <span className="text-[11px] text-[#1A1A1A]">
        History
      </span>

    </button>

    {/* Email */}
    <button
      onClick={handleEmailReceipt}
      className="group flex flex-col items-center justify-center bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl py-4 transition-all hover:border-[#C8A882] active:scale-[0.97]"
    >

      <div className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center mb-3">
        <Mail className="h-5 w-5 text-[#8B6F5E]" />
      </div>

      <span className="text-[11px] text-[#1A1A1A]">
        Email
      </span>

    </button>

    {/* Download */}
    <button
      onClick={handleDownloadReceipt}
      className="group flex flex-col items-center justify-center bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl py-4 transition-all hover:border-[#C8A882] active:scale-[0.97]"
    >

      <div className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center mb-3">
        <Download className="h-5 w-5 text-[#8B6F5E]" />
      </div>

      <span className="text-[11px] text-[#1A1A1A]">
        Download
      </span>

    </button>

  </div>

</div>

{/* Customer Care */}
<div className="bg-white rounded-3xl border border-[#ECECEC] shadow-xl mx-4 mt-6 p-6">

  {/* Header */}
  <div className="flex items-center mb-6">

    <div className="w-10 h-10 rounded-xl bg-[#C8A882]/15 flex items-center justify-center mr-4">
      <Headset className="h-5 w-5 text-[#8B6F5E]" />
    </div>

    <div>

      <h3 className="text-[15px] font-medium text-[#1A1A1A]">
        Customer Care
      </h3>

      <p className="text-[11px] text-[#8B6F5E] mt-1">
        Assistance for orders, returns and product enquiries.
      </p>

    </div>

  </div>

  {/* Contact Options */}
  <div className="grid grid-cols-3 gap-4">

    {/* WhatsApp */}
    <button
      onClick={handleWhatsApp}
      className="flex flex-col items-center justify-center bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl py-4 transition-all hover:border-[#C8A882] active:scale-[0.97]"
    >

      <MessageSquare className="h-5 w-5 text-[#8B6F5E] mb-3" />

      <span className="text-[11px] text-[#1A1A1A]">
        WhatsApp
      </span>

    </button>

    {/* Call */}
    <button
      onClick={handleCall}
      className="flex flex-col items-center justify-center bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl py-4 transition-all hover:border-[#C8A882] active:scale-[0.97]"
    >

      <Phone className="h-5 w-5 text-[#8B6F5E] mb-3" />

      <span className="text-[11px] text-[#1A1A1A]">
        Call
      </span>

    </button>

    {/* Email */}
    <button
      onClick={handleEmail}
      className="flex flex-col items-center justify-center bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl py-4 transition-all hover:border-[#C8A882] active:scale-[0.97]"
    >

      <Mail className="h-5 w-5 text-[#8B6F5E] mb-3" />

      <span className="text-[11px] text-[#1A1A1A]">
        Email
      </span>

    </button>

  </div>

  {/* Footer Note */}

  <div className="mt-6 pt-5 border-t border-[#ECECEC] text-center">

    <p className="text-[10px] text-[#8B6F5E] leading-relaxed">
      Need help with sizing, returns or your recent order? Our team is here to assist.
    </p>

  </div>

</div>
          
      {/* Social Media & Store Information */}
<div className="bg-white rounded-3xl border border-[#ECECEC] shadow-xl mx-4 mt-6 p-5 mb-8">

  {/* Header */}
  <div className="flex items-center mb-5">

    <div className="w-10 h-10 rounded-xl bg-[#C8A882]/15 flex items-center justify-center mr-3">
      <Share2 className="h-5 w-5 text-[#8B6F5E]" />
    </div>

    <div>
      <h3 className="text-[14px] font-medium text-[#1A1A1A]">
        Follow MANGO
      </h3>
      <p className="text-[11px] text-[#8B6F5E] mt-0.5">
        Discover new collections and fashion inspiration.
      </p>
    </div>

  </div>

  {/* Social Links */}
  <div className="flex justify-center space-x-6 mb-6">

    <button
      onClick={() => handleSocialLink("https://www.instagram.com/mango/?hl=en")}
      className="flex flex-col items-center group"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F8F8F8] border border-[#ECECEC] flex items-center justify-center mb-1.5 transition-all group-hover:border-[#C8A882]">
        <Instagram className="h-5 w-5 text-[#8B6F5E]" />
      </div>
      <span className="text-[10px] text-[#8B6F5E]">Instagram</span>
    </button>

    <button
      onClick={() => handleSocialLink("https://www.facebook.com/mango.com/")}
      className="flex flex-col items-center group"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F8F8F8] border border-[#ECECEC] flex items-center justify-center mb-1.5 transition-all group-hover:border-[#C8A882]">
        <Facebook className="h-5 w-5 text-[#8B6F5E]" />
      </div>
      <span className="text-[10px] text-[#8B6F5E]">Facebook</span>
    </button>

    <button
      onClick={() => handleSocialLink("https://shop.mango.com/in/en")}
      className="flex flex-col items-center group"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F8F8F8] border border-[#ECECEC] flex items-center justify-center mb-1.5 transition-all group-hover:border-[#C8A882]">
        <ExternalLink className="h-5 w-5 text-[#8B6F5E]" />
      </div>
      <span className="text-[10px] text-[#8B6F5E]">Website</span>
    </button>

  </div>

  {/* Customer Support */}
  <div className="bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl p-4 mb-3">

    <div className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E] mb-3">
      Customer Support
    </div>

    <div className="grid grid-cols-3 gap-2">

      <button
        onClick={handleCall}
        className="flex flex-col items-center justify-center bg-white border border-[#ECECEC] rounded-xl py-3 hover:border-[#C8A882] transition-all"
      >
        <Phone className="h-4 w-4 text-[#8B6F5E] mb-1.5" />
        <span className="text-[10px] text-[#1A1A1A]">Call</span>
      </button>

      <button
        onClick={handleEmail}
        className="flex flex-col items-center justify-center bg-white border border-[#ECECEC] rounded-xl py-3 hover:border-[#C8A882] transition-all"
      >
        <Mail className="h-4 w-4 text-[#8B6F5E] mb-1.5" />
        <span className="text-[10px] text-[#1A1A1A]">Email</span>
      </button>

      <button
        onClick={() => handleSocialLink("https://www.instagram.com/mango/?hl=en")}
        className="flex flex-col items-center justify-center bg-white border border-[#ECECEC] rounded-xl py-3 hover:border-[#C8A882] transition-all"
      >
        <Instagram className="h-4 w-4 text-[#8B6F5E] mb-1.5" />
        <span className="text-[10px] text-[#1A1A1A]">Instagram</span>
      </button>

    </div>

    <p className="text-[10px] text-[#8B6F5E] text-center mt-3 leading-relaxed">
      Available Mon–Fri, 9am to 8:30pm
    </p>

  </div>

  {/* Store Locator */}
  <div className="mb-3">

    
  href="https://shop.mango.com/in/en/stores"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-between w-full bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl px-4 py-3.5 hover:border-[#C8A882] transition-all group">

      <div className="flex items-center">
        <div className="w-8 h-8 rounded-xl bg-white border border-[#ECECEC] flex items-center justify-center mr-3">
          <MapPin className="h-4 w-4 text-[#C8A882]" />
        </div>
        <div>
          <div className="text-[12px] font-medium text-[#1A1A1A]">
            Find a MANGO Store
          </div>
          <div className="text-[10px] text-[#8B6F5E] mt-0.5">
            Locate your nearest store in India
          </div>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 text-[#8B6F5E] group-hover:translate-x-0.5 transition-transform" />

    </a>

  </div>

  {/* Store Information — current store */}
  <div className="bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl p-4 mb-3">

    <button
      onClick={() => setShowStoreLocation(!showStoreLocation)}
      className="w-full flex items-center justify-between"
    >

      <div className="flex items-center">
        <MapPin className="h-4 w-4 mr-2 text-[#C8A882]" />
        <span className="text-[12px] font-medium text-[#1A1A1A]">
          {currentReceipt.branch}
        </span>
      </div>

      <span className="text-[10px] text-[#8B6F5E]">
        {showStoreLocation ? "▲" : "▼"}
      </span>

    </button>

    {showStoreLocation && (

      <div className="mt-3 pt-3 border-t border-[#E5E5E5] text-center">

        <div className="space-y-0.5 text-[12px] text-[#1A1A1A]">
          <p className="font-medium">MANGO Store</p>
          <p>UB City</p>
          <p>24 Vittal Mallya Road</p>
          <p>Ashok Nagar</p>
          <p>Bengaluru, Karnataka 560001</p>
        </div>

        <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B6F5E]">
            Store Associate
          </p>
          <p className="text-[12px] text-[#1A1A1A] mt-1">
            {currentReceipt.associate}
          </p>
        </div>

      </div>

    )}

  </div>

  {/* Returns & Exchange Policy — open by default */}
  <div className="mb-3">

    <button
      className="w-full flex items-center justify-between bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl px-4 py-3.5 hover:border-[#C8A882] transition-all"
      onClick={() => setShowTerms(!showTerms)}
    >

      <div className="flex items-center">
        <div className="w-8 h-8 rounded-xl bg-white border border-[#ECECEC] flex items-center justify-center mr-3">
          <FileText className="h-4 w-4 text-[#8B6F5E]" />
        </div>
        <span className="text-[12px] font-medium text-[#1A1A1A]">
          Returns & Exchange Policy
        </span>
      </div>

      <span className="text-[10px] text-[#8B6F5E]">
        {showTerms ? "▲" : "▼"}
      </span>

    </button>

    {showTerms && (

      <div className="mt-2 bg-[#FAFAFA] border border-[#ECECEC] rounded-2xl p-4 text-[11px] text-[#8B6F5E] leading-relaxed space-y-2.5">

        <p className="font-medium text-[#1A1A1A] text-[12px]">
          In-Store Exchanges & Returns
        </p>

        <p>
          • You have <span className="text-[#1A1A1A] font-medium">30 days</span> from the date of purchase to exchange items at any MANGO store in India. Bring this receipt (digital or printed) along with the items.
        </p>

        <p>
          • For hygiene reasons, <span className="text-[#1A1A1A]">swimwear, lingerie, underwear and earrings</span> cannot be exchanged or returned.
        </p>

        <p>
          • Personalised or altered items cannot be exchanged or returned.
        </p>

        <p>
          • Fragrances, candles and cosmetics must be returned in original sealed packaging.
        </p>

        <p>
          • Gift cards are non-exchangeable and non-returnable.
        </p>

        
          href="https://shop.mango.com/in/en/help/returns/store-returns"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#C8A882] mt-3 hover:underline"
        >
          Full returns policy
          <ArrowUpRight className="h-3 w-3" />
        </a>

      </div>

    )}

  </div>

  {/* Powered by */}
  <div className="text-center mt-5 pt-5 border-t border-[#ECECEC]">

    <div className="flex items-center justify-center space-x-2">

      <span className="text-[10px] uppercase tracking-[0.15em] text-[#8B6F5E]">
        Powered by
      </span>

      
        href="https://www.rdep.io"
        target="_blank"
        rel="noopener noreferrer"
        className="opacity-80 hover:opacity-100 transition-opacity"
      >
        <Image
          src="/images/design-mode/RDEP%20cropped.png"
          alt="RDEP"
          width={55}
          height={14}
          className="object-contain"
        />
      </a>

    </div>

  </div>

</div>
          <div id="height-marker" style={{ height: "1px" }} />
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div
            style={getModalPositionRelativeToContainer(feedbackButtonRef)}
            className="bg-white rounded-lg w-full overflow-hidden shadow-xl z-[9999] max-w-sm"
          >
            <div className="flex justify-between items-center p-4 border-b bg-blue-700 text-white">
              <h3 className="text-lg font-semibold">How was your shopping experience?</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white"
                onClick={() => setShowFeedbackModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </Button>
            </div>

            <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
              {[
                { key: "service", label: "Service Quality" },
                { key: "quality", label: "Product Quality" },
                { key: "style", label: "Shoe Style/Design" },
                { key: "pricing", label: "Value for Money" },
                { key: "store", label: "Store Ambiance" },
              ].map((category) => (
                <div key={category.key} className="flex items-center justify-between">
                  <span className="text-sm">{category.label}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          setFeedback((prev) => ({
                            ...prev,
                            [category.key as keyof typeof feedback]: star,
                          }))
                        }
                      >
                        <Star
                          className={`h-5 w-5 ${
                            feedback[category.key as keyof typeof feedback] >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              <Textarea
                placeholder="Please share your feedback about your purchase (optional)"
                className="mt-2"
                value={feedback.comments}
                onChange={(e) => setFeedback((prev) => ({ ...prev, comments: e.target.value }))}
              />
            </div>

            <div className="p-4 border-t">
              <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white" onClick={handleFeedbackSubmit}>
                Submit Feedback
              </Button>
            </div>
          </div>
        )}

  {/* Transaction History Modal */}
{showTransactionHistory && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">

    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setShowTransactionHistory(false)}
    />

    {/* Modal */}
    <div className="relative bg-white rounded-3xl w-full max-w-sm mx-4 shadow-2xl border border-[#ECECEC] overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-[#ECECEC]">

        <div className="flex items-center">

          <div className="w-10 h-10 rounded-xl bg-[#C8A882]/15 flex items-center justify-center mr-3">
            <History className="h-5 w-5 text-[#8B6F5E]" />
          </div>

          <div>

            <h3 className="text-[15px] font-medium text-[#1A1A1A]">
              Purchase History
            </h3>

            <p className="text-[11px] text-[#8B6F5E] mt-0.5">
              View previous purchases
            </p>

          </div>

        </div>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F8F8F8]"
          onClick={() => setShowTransactionHistory(false)}
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4 text-[#8B6F5E]"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>

        </button>

      </div>

      {/* Purchase List */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-3">

        {transactionHistory.map((transaction) => (

          <button
            key={transaction.id}
            onClick={() => {
              setCurrentReceiptId(transaction.id)
              setShowTransactionHistory(false)
              window.scrollTo({ top: 0, behavior: "smooth" })
            }}
            className="w-full flex items-center p-4 bg-[#F8F8F8] border border-[#ECECEC] rounded-2xl hover:border-[#C8A882] transition-all"
          >

            <div className="w-11 h-11 rounded-xl bg-white border border-[#ECECEC] flex items-center justify-center mr-4 flex-shrink-0">

              <FileText className="h-5 w-5 text-[#8B6F5E]" />

            </div>

            <div className="flex-grow text-left">

              <div className="text-[14px] font-medium text-[#1A1A1A]">
                MANGO
              </div>

              <div className="text-[11px] text-[#8B6F5E] mt-1">
                {transaction.date}
              </div>

            </div>

            <div className="text-right">

              <div className="text-[15px] font-medium text-[#1A1A1A]">
                ₹{transaction.amount.toLocaleString("en-IN")}
              </div>

            </div>

          </button>

        ))}

      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#ECECEC] bg-[#FAFAFA]">

        <p className="text-[10px] text-center text-[#8B6F5E]">
          Select a purchase to view the full receipt.
        </p>

      </div>

    </div>

  </div>
)}
        {/* Refer & Earn Modal */}
        {showReferModal && (
          <div
            style={getModalPositionRelativeToContainer(referButtonRef)}
            className="bg-white rounded-lg w-full overflow-hidden shadow-xl z-[9999] max-w-sm"
          >
            <div className="flex justify-between items-center p-4 border-b bg-blue-700 text-white">
              <h3 className="text-lg font-semibold flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Refer & Earn
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-600"
                onClick={() => setShowReferModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-8 w-8 text-blue-700" />
                </div>
                <h4 className="text-lg font-semibold text-blue-700 mb-2">Share & Earn RM50!</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Refer friends to Skechers and both of you get RM50 off your next purchase!
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs font-medium text-blue-800 mb-1">Your Referral Code</div>
                <div className="text-lg font-bold text-blue-700 text-center">SKECH{customerName.toUpperCase()}50</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Try Skechers! Use code SKECH${customerName.toUpperCase()}50 for RM50 off!`,
                    )
                    setShowReferModal(false)
                  }}
                >
                  Copy Code
                </Button>
                <Button
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={() => {
                    window.open(
                      `https://wa.me/60362032728?text=Try Skechers Malaysia! Use my code SKECH${customerName.toUpperCase()}50 for RM50 off your next purchase!`,
                    )
                    setShowReferModal(false)
                  }}
                >
                  Share Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
