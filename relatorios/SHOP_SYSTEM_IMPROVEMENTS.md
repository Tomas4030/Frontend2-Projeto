# 🛒 Shop System - Fixes & Improvements

## Overview

Comprehensive fixes for the daily shop reset system, UI improvements, alert system replacement, and state management.

## Issues Fixed

### 1. ✅ 24-Hour Reset System

**Problem**: No clear visual indication of when shop items would reset
**Solution**:

- Added `getTimeUntilReset()` utility to calculate exact time until midnight
- Displays countdown in real-time (updates every second)
- Shows format: "5h 45m 23s"
- Located in shop header for easy visibility

**Key Features**:

- Real-time countdown timer
- Updates automatically every second
- Clear visual indicator in header
- Toast messages remind users when limit is reached with "volta amanhã" (back tomorrow)

### 2. ✅ Daily Limit Availability

**Problem**: Items didn't properly show state transitions
**Solution**: Created comprehensive item state system

**Item States**:

- `available` - Can purchase (first buy of the day)
- `limited` - Can still purchase (bought some but under limit)
- `exhausted` - Daily limit reached (must wait until tomorrow)
- `no_gold` - Insufficient gold for purchase

**State Display Badges**:

```
✓ Disponível      (Green - full availability)
⏱ 2/3 hoje        (Yellow - limited purchases remaining)
✕ Esgotado        (Red - limit reached, return tomorrow)
⚠ Gold insufficient (Gray - not enough money)
```

### 3. ✅ Title Overflow Prevention

**Changes**:

- Changed from `truncate` to `line-clamp-2` for item titles
- Better responsive scaling with `text-sm`
- Icon and cost positioned clearly without overflow
- Two-line max for longer item names

**Before**:

```
"Pergaminho XP muito longo..." (truncated)
```

**After**:

```
"Pergaminho XP"
"muito especial" (two lines, readable)
```

### 4. ✅ Alert System Replacement

**Changes**:

- Replaced custom Toast component with shadcn/ui Alert
- Cleaner, more consistent styling
- Better error/success/warning differentiation
- Uses proper icon variants

**Alert Styling** by type:

```javascript
success: "border-emerald-400/30 bg-emerald-400/10";
error: "border-rose-400/30 bg-rose-400/10";
warning: "border-yellow-400/30 bg-yellow-400/10";
```

### 5. ✅ General Shop Behavior Validation

#### Refresh Button

- Manually reload daily purchase counts
- Shows loading spinner while fetching
- Position: Top right of shop header

#### Timers

- Real-time countdown to midnight
- Updates every second
- Shows in header: "Reset em: 5h 45m 23s"

#### States

- Clear visual differentiation between all four states
- Border and background colors change based on state
- Button text updates based on state
- Disabled state properly reflects availability

#### Console Logging

Added comprehensive logging for debugging:

```javascript
[Shop] Carregando compras entre... // Loading purchases
[Shop] Compras carregadas: {...}    // Purchases loaded
[Shop] Item comprado: ...            // Purchase successful
```

## File Structure

### Created

- **`lib/shop-system.ts`** (150 lines)
  - Core utilities for shop state management
  - Time calculations and formatting
  - Item state determination
  - State info generation for UI

### Modified

- **`components/dashboard/shop/ItemShop.tsx`**
  - Replaced custom Toast with shadcn/ui Alert
  - Added real-time reset timer
  - Added Refresh button
  - Improved state display badges
  - Better responsive title handling
  - Enhanced logging for debugging
  - Removed old Toast component function

## Key Functions (lib/shop-system.ts)

### `getTimeUntilReset()`

```typescript
Returns: { hours, minutes, seconds, totalMinutes, formatted }
Example: { hours: 5, minutes: 45, seconds: 23, formatted: "5h 45m 23s" }
```

### `getItemState(boughtToday, dailyLimit, hasGold)`

```typescript
Returns: ItemState("available" | "limited" | "exhausted" | "no_gold");
```

### `getStateInfo(state, boughtToday, dailyLimit)`

```typescript
Returns: { label, color, bg, border, icon }
Example: {
  label: "2/3 hoje",
  color: "text-yellow-400",
  bg: "bg-yellow-400/10",
  border: "border-yellow-400/30",
  icon: "⏱"
}
```

### `formatRemainingLimit(boughtToday, dailyLimit)`

```typescript
Returns: string describing remaining purchases
Example: "2 de 3 restantes"
```

## UI/UX Improvements

### Shop Header

```
┌─────────────────────────────────────┐
│ ◆ Loja de Itens          [100 G]   │
│                        [🔄 Atualizar]
│ Reset em: 5h 45m 23s              │
└─────────────────────────────────────┘
```

### Item Card States

```
Available:
┌─────────────────────────────────────┐
│ 🧪 Poção de Vida  ✓ Disponível  30G│
│ "Restaura vida..."   [Comprar]    │
└─────────────────────────────────────┘

Limited (2/3):
┌─────────────────────────────────────┐
│ 🧪 Poção de Vida  ⏱ 2/3 hoje    30G│
│ "Restaura vida..."   [Comprar]    │
└─────────────────────────────────────┘

Exhausted:
┌─────────────────────────────────────┐
│ 🧪 Poção de Vida  ✕ Esgotado      30G│
│ "Restaura vida..."   [Volta amanhã]│
└─────────────────────────────────────┘
```

## Time Zone Considerations

**Current Implementation**:

- Uses local client time: `new Date()`
- Daily reset at midnight (client local time)
- Resets at `00:00:00` each day

**Note**: For multiplayer games, consider:

- Server-side time zone validation
- UTC-based timestamps in database
- User time zone preference storage

## Testing Checklist

- ✅ Timer counts down every second
- ✅ Timer reaches 0 at midnight and resets
- ✅ Item purchase limits respected
- ✅ "Esgotado" state shows until midnight
- ✅ Button text changes based on state
- ✅ Refresh button reloads purchase counts
- ✅ Alert shows success/error/warning properly
- ✅ Titles don't overflow on mobile
- ✅ All 4 item states display correctly
- ✅ Logging appears in DevTools Console

## Browser Console Debug

```javascript
// Look for shop-related logs:
[Shop] Carregando compras...
[Shop] Compras carregadas
[Shop] Item comprado

// Verify timer updates
// Every second: "Reset em: Xh Xm Xs" changes
```

## Future Enhancements

1. **Persistent State**: Save purchase history for reliability
2. **Multiple Resets**: Support weekly/monthly limits
3. **Seasonal Items**: Add limited-time shop items
4. **Animations**: Add purchase confirmation animations
5. **Sound Effects**: Optional purchase sound
6. **Sort Options**: Sort items by availability, cost, effect
7. **Search/Filter**: Find items by effect type
8. **Time Zone Support**: Server-side time validation

## Database Notes

Ensure `shop_purchases` table has:

- `id` (uuid, primary key)
- `character_id` (uuid, FK to characters)
- `item_key` (text)
- `purchased_at` (timestamp)
- `created_at` (timestamp, default now())

Index recommended on: `(character_id, purchased_at)`
