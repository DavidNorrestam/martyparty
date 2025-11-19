# Interactive Preprocessing Visual Guide

## User Flow

```
┌─────────────────────────────────────────────────────────┐
│                    HOME PAGE                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [Förbehandla växtdata] <-- Click this link    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              STEP 1: FILE SELECTION                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  plants.json                  [✓ Preprocessed]  │   │
│  │  10 plants                                       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  plants_week6.json            [ Not processed]  │ <─ Click
│  │  10 plants                                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│             STEP 2: PLANT SELECTION                     │
│  [Select All] [Deselect All]                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [✓] Acer palmatum                               │   │
│  │     Japansk lönn                                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [ ] Corylus avellana 'Contorta'                 │ <─ Deselect
│  │     Ormhassel                                    │      for manual
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [✓] Malus toringo var. sargentii                │   │
│  │     Bukettapel                                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Selected for auto-processing: 9 / 10                   │
│  Manual curation needed: 1                              │
│                                                          │
│  [Continue to Image Selection]                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│             STEP 3: IMAGE SELECTION                     │
│  Select Images for Corylus avellana 'Contorta'         │
│  Ormhassel • Plant 1 of 1                              │
│                                                          │
│  Selected: 3 / minimum 10                               │
│  [███░░░░░░░] 30%                                      │
│                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ [✓]  │ │      │ │ [✓]  │ │      │  <─ Click images │
│  │ img  │ │ img  │ │ img  │ │ img  │     to select    │
│  │ src1 │ │ src2 │ │ src3 │ │ src4 │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │      │ │ [✓]  │ │      │ │      │                  │
│  │ img  │ │ img  │ │ img  │ │ img  │                  │
│  │ src5 │ │ src6 │ │ src7 │ │ src8 │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                          │
│  [Start Processing] (enabled when ≥ 10 selected)       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              STEP 4: PROCESSING                         │
│  Processing Plants...                                   │
│  Starting preprocessing...                              │
│                                                          │
│  [██████████] 100%                                     │
│                                                          │
│  ⏳ (spinner animation)                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              STEP 5: COMPLETE                           │
│  ✓ Preprocessing Complete!                             │
│  Successfully preprocessed plants_week6.json            │
│                                                          │
│  Auto-processed plants: 9                               │
│  Manually curated plants: 1                             │
│                                                          │
│  [Process Another File]                                 │
└─────────────────────────────────────────────────────────┘
```

## Image Selection UI Details

The image selection step mimics Google Images:

```
┌───────────────────────────────────────────────────────────┐
│  Select Images for Corylus avellana 'Contorta'          │
│  Ormhassel • Plant 1 of 1                               │
│                                                           │
│  Selected: 12 / minimum 10  ✓                           │
│  [██████████] 100%                                      │
│                                                           │
│  Image Grid (4 columns on desktop, responsive)          │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   ┌────────────┐│  │   ┌────────────┐│              │
│  │   │            ││  │   │     ✓      ││ <- Checkmark │
│  │   │   Image    ││  │   │   Image    ││    when      │
│  │   │            ││  │   │            ││    selected   │
│  │   └────────────┘│  │   └────────────┘│              │
│  │  example.com    │  │  botanical.org  │ <- Source    │
│  └─────────────────┘  └─────────────────┘    link      │
│                                                           │
│  Features:                                               │
│  - Click image to select/deselect                       │
│  - Click source link to verify (opens in new tab)       │
│  - Hover effects for better UX                          │
│  - Selected images have colored border                   │
│                                                           │
│  [Next Plant] (if more manual plants)                   │
│  or                                                      │
│  [Start Processing] (if last manual plant)              │
└───────────────────────────────────────────────────────────┘
```

## Key UI Features

### Responsive Design
- Desktop: 4-column grid
- Tablet: 3-column grid
- Mobile: 2-column grid

### Visual Feedback
- ✓ Checkmarks on selected images
- Color-coded borders (primary color when selected)
- Progress bar showing selection status
- Hover effects for better interactivity

### Accessibility
- Proper semantic HTML (buttons, labels)
- ARIA attributes
- Keyboard navigation support
- Screen reader friendly

### Data Quality
- Minimum 10 images required
- Source links for verification
- Filters out small images (< 100x100px)
- Deduplicates results

## API Integration

```
Frontend                API Endpoints              External APIs
┌────────┐             ┌──────────┐              ┌─────────────┐
│        │ GET files   │          │              │   WFO API   │
│ /pre   │─────────────▶│ /api/    │──────────────▶│             │
│ process│             │ preprocess│              └─────────────┘
│        │◀─────────────│          │
│        │ List files  └──────────┘              ┌─────────────┐
│        │                                        │ iNaturalist │
│        │ GET images  ┌──────────┐              │    API      │
│        │─────────────▶│ /api/    │──────────────▶│             │
│        │             │ google-  │              └─────────────┘
│        │◀─────────────│ images   │
│        │ Image URLs  └──────────┘              ┌─────────────┐
│        │                                        │  Google     │
│        │             ┌──────────┐              │  Images     │
│        │ POST data   │          │              │             │
│        │─────────────▶│ /api/    │──────────────▶│             │
│        │             │ preprocess│              └─────────────┘
│        │◀─────────────│          │
│        │ Success     └──────────┘
└────────┘
```

## File Structure

```
/root/martyparty/
├── src/
│   ├── routes/
│   │   ├── preprocess/
│   │   │   └── +page.svelte          <- Main UI component
│   │   └── api/
│   │       ├── preprocess/
│   │       │   └── +server.ts        <- Processing endpoint
│   │       └── google-images/
│   │           └── +server.ts        <- Image search endpoint
│   └── lib/
│       └── preprocess-utils.ts       <- Shared utilities
├── static/
│   ├── plants*.json                  <- Input files
│   └── preprocessed/
│       └── plants*.json              <- Output files
└── docs/
    └── interactive-preprocessing.md  <- Documentation
```
