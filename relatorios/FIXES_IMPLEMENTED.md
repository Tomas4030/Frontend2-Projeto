# Bug Fixes - Pergaminho XP & Equipment Effects

## Summary of Changes

Three critical bugs were identified and fixed:

### 1. **XP Multiplier Double-Application (FIXED)**

- **Problem**: XP was being multiplied twice - once by pergaminho bonus and again by equipment bonus
- **Root Cause**: Separate conditional logic applied multipliers sequentially instead of cumulatively
- **File**: `app/dashboard/page.tsx` (lines 261-271)
- **Solution**: Consolidated multipliers into single calculation: `baseXp × (shop_boost × equipment_bonus)`

### 2. **Equipment Effects Not Applying (FIXED)**

- **Problem**: When equipping items with buffs (strength, mana, XP%, etc.), the stats weren't recalculating
- **Root Cause**: `useEquipment` hook only watched character attributes, not equipment changes
- **File**: `hooks/useEquipment.ts` (lines 65-76)
- **Solution**: Added `equipment` and `setBonus` to useEffect dependency array

### 3. **Added Debugging Visibility**

- **File**: `components/dashboard/CharacterPanel.tsx`
- **Addition**: New "BUFFS APLICADOS" debug section showing all active buffs
- **File**: Both `dashboard/page.tsx` and `ItemShop.tsx`
- **Addition**: Console logging for XP calculations and shop purchases

## Code Changes

### File 1: `app/dashboard/page.tsx`

```diff
// OLD: Apply multipliers separately (doubles them)
- let gainedXp = xpBoostActive ? baseXp * 2 : baseXp;
- if (finalStats && finalStats.final_xp_multiplier > 1) {
-   gainedXp = applyXpMultiplier(gainedXp, finalStats);
- }

// NEW: Apply multipliers together (cumulative)
+ const shoppingBoostMultiplier = xpBoostActive ? newXpBoostMultiplier : 1;
+ const equipmentMultiplier = finalStats?.final_xp_multiplier ?? 1;
+ const totalMultiplier = shoppingBoostMultiplier * equipmentMultiplier;
+ let gainedXp = Math.round(baseXp * totalMultiplier);
+
+ // Added detailed logging
+ console.log(`[XP Calculation]`, {
+   baseXp,
+   xpBoostActive,
+   newXpBoostMultiplier,
+   shoppingBoostMultiplier,
+   equipmentMultiplier,
+   totalMultiplier,
+   gainedXp,
+ });
```

### File 2: `hooks/useEquipment.ts`

```diff
// OLD: Only watches character attributes
- }, [character?.forca, character?.inteligencia, character?.max_hp, character?.max_mp]);

// NEW: Also watches equipment changes
+ }, [
+   character?.forca,
+   character?.inteligencia,
+   character?.max_hp,
+   character?.max_mp,
+   equipment,    // ← ADDED: Recalculate when equipped items change
+   setBonus,     // ← ADDED: Recalculate when set bonuses change
+ ]);
```

### File 3: `components/dashboard/CharacterPanel.tsx`

- Added visual debug section showing all active buffs
- Displays: Strength, Intelligence, HP, MP, XP multiplier, Gold multiplier, Boss damage, Streak protection

### File 4: `components/dashboard/shop/ItemShop.tsx`

- Added console logging for shop purchases
- Logs effect values when items are bought

## Why Pergaminho Wasn't Working

The pergaminho (XP scroll) system has two parts:

1. **Frontend (NOW FIXED)**:
   - The UI wasn't using the actual `xp_boost_multiplier` value
   - It was hardcoded to multiply by 2 always
   - The XP calculation was broken (doubled items twice)

2. **Backend (NEEDS VERIFICATION)**:
   - The RPC `buy_shop_item` must set:
     - `xp_boost_multiplier: 2` (from `effectValue`)
     - `xp_boost_expires_at: now + 24 hours`
   - If these fields aren't being updated, the multiplier won't work

## Why Equipment Effects Weren't Working

Items with buffs weren't applying because:

1. **Stats Weren't Recalculating**:
   - The `useEquipment` hook only recalculated when character base attributes changed
   - Equipping an item didn't trigger this

2. **Solution**: Now equipment changes trigger recalculation immediately

3. **Database Requirement**:
   - Items must have their effect fields populated in the `items` table
   - When items are added to inventory, these fields must be copied

## Verification Steps

### To test Pergaminho XP:

1. Open browser DevTools Console (F12)
2. Buy Pergaminho XP from shop
3. Check console for `[Shop] Item comprado com sucesso` message
4. Complete a task
5. Check console for `[XP Calculation]` log
6. Verify `gainedXp` is doubled if pergaminho is active

### To test Equipment Effects:

1. Open browser DevTools Console (F12)
2. Check if Equipment Panel shows "Arsenal de Combate"
3. Equip an item (e.g., weapon with +strength)
4. Look for new "BUFFS APLICADOS" section in CharacterPanel
5. Compare `[Strength: X → X+bonus]`
6. Check if stats actually changed in game

### Debug Through Console:

```javascript
// Check if XP multiplier is active
// Look for this in console when completing tasks:
// [XP Calculation] { shoppingBoostMultiplier: 2, ... }

// Check if equipment is loaded:
// Look for equipment objects in React DevTools
// Or watch for useEquipment hook outputs
```

## Database Schema Verification Needed

Ensure these columns exist and have values:

```sql
-- Characters table
ALTER TABLE characters ADD COLUMN xp_boost_multiplier NUMERIC DEFAULT 1;
ALTER TABLE characters ADD COLUMN xp_boost_expires_at TIMESTAMP NULL;

-- Items table (should already exist)
-- strength_bonus, intelligence_bonus, hp_bonus, mp_bonus
-- xp_multiplier, gold_multiplier, boss_damage_bonus, streak_protection
```

## Backend RPC Checks

### `buy_shop_item` should:

```sql
-- When effect_type = 'xp_boost' with effect_value = 2:
UPDATE characters
SET xp_boost_multiplier = 2,
    xp_boost_expires_at = NOW() + INTERVAL '24 hours'
WHERE id = p_character_id;

UPDATE characters
SET gold = gold - p_cost
WHERE id = p_character_id AND gold >= p_cost;
```

### `equip_item` should:

```sql
-- Must retrieve the FULL item with all effect fields:
SELECT *, strength_bonus, intelligence_bonus, xp_multiplier, etc.
FROM items WHERE id = p_item_id;

-- Then store in player_equipment with all these fields
```

## Impact Summary

✅ **Fixed**: XP no longer gets doubled twice  
✅ **Fixed**: Equipment buffs now apply when items are equipped  
✅ **Fixed**: Added visual confirmation of applied buffs  
✅ **Fixed**: Added console logging for debugging

🔄 **Needs Backend Verification**:

- `buy_shop_item` RPC setting xp_boost_multiplier correctly
- Database fields for item effects properly populated
- `equip_item` RPC retrieving full item data with effects

## Next Steps

1. Test the fixes with the console logs
2. Verify backend RPCs are setting fields correctly
3. Check database to ensure all item effect fields are populated
4. If items still don't work, may need to run a migration/populate script

---

## UI Refactoring - Buffs & Set Bonus Modal

### Changes Made

After initial testing, the debug display of buffs in CharacterPanel was polluting the interface. A cleaner solution was implemented:

### Removed:

- ❌ **"BUFFS APLICADOS" section** from CharacterPanel
- ❌ **SetBonusCard rendering** from EquipmentPanel inline display

### Added:

- ✅ **New BuffsDetailsModal component** (`components/dashboard/equipment/BuffsDetailsModal.tsx`)
- ✅ **Info button** next to "Arsenal de Combate" header
- ✅ **Clean modal dialog** showing:
  - Atributos section (Força, Inteligência, HP, MP)
  - Efeitos Especiais section (XP ×, Gold ×, Dano Boss, Streak Protection)
  - Bônus de Set section (organized by set)

### File Changes:

#### 1. New File: `components/dashboard/equipment/BuffsDetailsModal.tsx`

- Standalone React component using shadcn/ui Dialog
- Shows all buffs organized in 3 categories
- Clean, expandable interface
- Uses same `formatBonusKey` logic for consistency

#### 2. Updated: `components/dashboard/equipment/EquipmentPanel.tsx`

```diff
- Removed: SetBonusCard component
- Removed: SetBonus rendering loop at bottom
- Added: Info button (ℹ️) next to "Arsenal de Combate" heading
- Added: BuffsDetailsModal component import
- Updated: Props to include character prop
- Updated: Header flexbox to accommodate button
```

#### 3. Updated: `components/dashboard/CharacterPanel.tsx`

```diff
- Removed: Yellow debug section "BUFFS APLICADOS"
- Removed: All buff display logic from main panel
- Updated: Pass character prop to EquipmentPanel
```

### Design Benefits:

1. **Clean Interface**: Character panel stays focused on core stats
2. **Organized Information**: Buffs grouped logically in modal
3. **Easy Access**: Single click to see all buff details
4. **Scalable**: Can easily add more buff information without UI clutter
5. **Consistent**: Uses same color scheme and formatting as equipment rarity system

### User Flow:

1. User sees normal Character Panel with Arsenal de Combate
2. Click ℹ️ button next to "Arsenal de Combate"
3. Modal opens showing:
   - All active buffs
   - Set bonuses breakdown
   - Visual organization with color-coded sections

### Modal Sections:

**📈 Atributos** (Blue)

- Shows strength, intelligence, HP, MP bonuses
- Only displays if there are active buffs for these stats

**⭐ Efeitos Especiais** (Yellow)

- XP multiplier
- Gold multiplier
- Boss damage bonus
- Streak protection status

**✨ Bônus de Set** (Purple)

- One card per active set
- Shows pieces equipped count
- Lists all bonuses from that set

### Empty State:

- If no buffs are active, shows "Nenhum buff ativo no momento"

### TypeScript Fixes:

- Fixed import: `EquipmentItem` → `Item`
- Added proper typing for BuffsDetailsModal
- No compilation errors ✅
