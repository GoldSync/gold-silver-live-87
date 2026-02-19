
# Real-Time Gold & Silver Price App

## Overview
A premium, Apple/Notion/Airbnb-inspired web app displaying live gold and silver prices across multiple product types, with USD and QAR (fixed 3.64 rate) pricing. Clean typography, generous whitespace, and a dark/light mode toggle.

## Design & Theme
- **Premium minimal UI** inspired by Apple + Notion + Airbnb: large clean typography, smooth animations, generous spacing, rounded cards with subtle shadows
- **Dark/Light toggle** in the header — dark mode uses rich dark backgrounds with warm gold accents; light mode uses crisp whites with subtle gold highlights
- **No charts or graphs** — just beautifully presented price cards

## Pages & Layout

### Header
- App logo/name (e.g. "Gold Pulse")
- Dark/Light mode toggle
- Last updated timestamp with a subtle pulse indicator showing live status
- Gold spot price and Silver spot price displayed prominently

### Price Sections (card grid layout)

**1. Gold Jewelry (per gram by karat)**
- 18K, 21K, 22K, 24K — each showing price per gram in USD and QAR

**2. Gold Bars**
- 1g, 5g, 10g, 1oz (31.1g), 100g, 1kg — each with USD and QAR price

**3. Gold Coins**
- 1/4 oz, 1/2 oz, 1 oz — each with USD and QAR price

**4. Silver Bars**
- 1 oz, 100g, 1 kg — each with USD and QAR price

Each card shows the product weight, USD price, and QAR price side by side.

## Data Source
- Free metals price API (e.g. MetalpriceAPI or GoldAPI free tier) fetched periodically (every 60 seconds)
- Prices auto-refresh with a visible countdown/indicator
- Fixed USD → QAR conversion at 3.64

## Features
- Auto-refresh prices every 60 seconds with visual indicator
- Price change indicator (up/down arrow with green/red) compared to previous fetch
- Smooth number animations when prices update
- Fully responsive — works beautifully on mobile and desktop
- Currency display: both USD and QAR shown for every product
