# MangaVerse — Mobile Apps & RevenueCat Integration Specification

**Version:** 1.0  
**Last Updated:** 2026-07-18  
**Status:** Implementation Specification  
**Related Docs:** Technical Blueprint, Tech Stack Roadmap, Project Briefing, ROADMAP

---

## 1. Overview

This document specifies how MangaVerse consumes the **RevenueCat SDK** end-to-end and how we ship native **mobile (iOS/Android)** and **desktop** builds. RevenueCat wraps StoreKit, Google Play Billing, the Amazon Appstore, the Samsung Galaxy Store, and **RevenueCat Billing (web, Stripe-backed)** so we manage subscriptions, entitlements, and paywalls from one backend without maintaining IAP infrastructure.

### 1.1 What RevenueCat Provides Us

- A single source of truth for subscription status across iOS, Android, web, and desktop (same `appUserID`).
- Server-side receipt validation (Apple/Google/Amazon) and **Test Store** for instant dev testing.
- Remotely-configurable **Paywalls**, **Offerings**, **Entitlements**, **Experiments**, and **Targeting**.
- Web monetization via **RevenueCat Billing** (Stripe gateway) — avoids 15–30% app-store fees on web.
- **Offline Entitlements** (SDK grants entitlements locally if RevenueCat servers are down).
- **AI Toolkit** (MCP Server + skills) so coding agents can provision projects/products/entitlements.

### 1.2 Platform Decision

We build the mobile + desktop clients with **React Native + Expo** (single TypeScript codebase) and use:

- `react-native-purchases` (core SDK) — minimum version **9.5.4** for Test Store; current target **latest**.
- `react-native-purchases-ui` (RevenueCatUI Paywalls) — required for native paywall components.
- `react-native-purchases-store-galaxy` — optional, for Samsung Galaxy Store.
- Expo **development builds** (`expo-dev-client`) — required because native IAP modules cannot run in Expo Go.

> Note: RevenueCat also ships native SDKs (iOS/Swift, Android/Kotlin, Flutter, KMP, Capacitor, Unity, Cordova). We standardize on React Native/Expo to share code with the existing web client.

---

## 2. RevenueCat Dashboard Configuration

All configuration is done in the **RevenueCat dashboard** (https://app.revenuecat.com) under a single **Project** that contains all MangaVerse apps.

### 2.1 Project & Apps

- One RevenueCat **Project** per environment family (`MangaVerse Production`, `MangaVerse Staging`).
- **Apps** inside the project:
  - `MangaVerse iOS` (App Store) → Apple API key
  - `MangaVerse Android` (Google Play) → Google API key
  - `MangaVerse Amazon` (Amazon Appstore) → Amazon API key (optional)
  - `MangaVerse Galaxy` (Samsung Galaxy) → Galaxy API key (optional)
  - `MangaVerse Web` (RevenueCat Billing app) → Web Billing API key
- **API keys** are public (safe in client). Found under **Project Settings → API keys → App specific keys**.
  - **Test Store API key** (separate) used only in debug builds.
  - **Platform API keys** used in release builds.

### 2.2 Products

Products are created in each store (App Store Connect, Google Play Console, etc.) then imported into RevenueCat. For web, products are created directly in **RevenueCat Billing**.

MangaVerse product catalog:

| Product ID (logical) | Store Duration | Type           | Unlocks                                 |
| -------------------- | -------------- | -------------- | --------------------------------------- |
| `pro_monthly`        | Monthly        | Subscription   | `pro` entitlement                       |
| `pro_yearly`         | Annual         | Subscription   | `pro` entitlement                       |
| `studio_monthly`     | Monthly        | Subscription   | `studio` entitlement                    |
| `studio_yearly`      | Annual         | Subscription   | `studio` entitlement                    |
| `pro_lifetime`       | One-time       | Non-consumable | `pro` entitlement (forever)             |
| `ai_credits_100`     | Consumable     | Consumable     | None (credits added by backend webhook) |
| `animation_pack_10`  | Consumable     | Consumable     | None (credits added by backend webhook) |

### 2.3 Entitlements

Entitlements represent access levels; they are **scoped to the project** and shared across all apps.

- `pro` → unlocks premium reader, unlimited AI generations, higher animation tiers.
- `studio` → unlocks Studio (team features, API access, character library sharing).
- Lifetime/non-consumable purchases attached to `pro` grant it **forever**.
- Consumables (`ai_credits_100`, `animation_pack_10`) are **NOT** attached to entitlements — backend credits them via webhook (see §8).

Rule: **a single product can unlock multiple entitlements; multiple products can unlock the same entitlement.** Always attach new products or users won't get access.

### 2.4 Offerings & Packages

- **Offering** = collection of products shown together on a paywall (e.g., `default`, `winback`, `promo_summer`).
- **Package** = equivalent products across platforms grouped by duration (`$rc_monthly`, `$rc_annual`, custom `lifetime`, `credits_100`).
- The **Default Offering** is returned as `current` in the SDK — we always reference `current` (never hardcode IDs) so we can swap offers from the dashboard via **Targeting** and **Experiments**.
- Packages display order set in dashboard reflects `getOfferings()` order.

### 2.5 Paywalls (RevenueCatUI)

- Each Offering is paired with a **Paywall** built in the dashboard (templates or from scratch, or generated via the **AI Editor**).
- Minimum SDK versions for Paywalls: iOS 5.27.1+, Android 8.19.2+, React Native 8.11.3+, Capacitor 10.3.3+, Flutter 8.10.1+.
- Platform support: iOS 15+, Android 7 (API 24)+, Mac Catalyst 15+, macOS 12+, **Web via Web Purchase Links**. Not supported: watchOS, tvOS, visionOS, Cordova.
- Features used:
  - **Custom variables** (`{{ custom.variable_name }}`) — e.g., `player_name`, `trial_days`, `discount_pct`. Keys must start with a letter, only letters/numbers/underscore.
  - **Custom fonts** — uploaded to RevenueCat; font filename must match app resources.
  - **Preferred locale** — override device language per paywall.
  - **Exit offers** — secondary offer shown when user dismisses without purchasing (config dashboard-only; works with `presentPaywall`/`presentPaywallIfNeeded`/`PaywallDialog`/`PaywallActivity`, NOT with manually-embedded view APIs).
  - **`paywall_component_interacted`** analytics events (tabs, packages, purchase buttons) emitted when paywall analytics integrations enabled.
- **Web Paywalls** max width 968px.

---

## 3. SDK Installation & Configuration (React Native / Expo)

### 3.1 Install

```bash
# Core + UI (Paywalls, Customer Center, etc.)
npx expo install react-native-purchases react-native-purchases-ui

# Optional Galaxy Store support
npm install --save react-native-purchases-store-galaxy
```

### 3.2 Android requirements

- `minSdk` 23 (Android 6.0 / API 23), `compileSdk` 34+.
- `AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="com.android.vending.BILLING" />
  <activity
      android:name="com.your.Activity"
      android:launchMode="standard" /> <!-- or singleTop; avoids cancelled purchases during bank-app verification -->
  ```
- If using `react-native-purchases-ui` with R8 errors, force R8 `8.1.44` in project-level `build.gradle`.

### 3.3 iOS requirements

- iOS deployment target ≥ 13.4.
- Enable **In-App Purchase** capability (`Project Target → Capabilities → In-App Purchase`).

### 3.4 Initialize SDK (once, at app launch)

```typescript
// App.tsx
import { Platform, useEffect } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { GALAXY_BILLING_MODE } from 'react-native-purchases-store-galaxy';

const API_KEYS = {
  ios: process.env.REVENUECAT_IOS_KEY!, // platform key (Test Store key in debug)
  android: process.env.REVENUECAT_ANDROID_KEY!,
  web: process.env.REVENUECAT_WEB_KEY!,
};

export default function App() {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === 'web') {
      Purchases.configure({ apiKey: API_KEYS.web });
    } else if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.ios });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.android });
      // Amazon: Purchases.configure({ apiKey: API_KEYS.amazon, useAmazon: true });
      // Galaxy:  Purchases.configure({ apiKey: API_KEYS.galaxy, store: 'GALAXY', galaxyBillingMode: GALAXY_BILLING_MODE.TEST });
    }
  }, []);
}
```

Key rules:

- Configure **once**; access the shared instance thereafter.
- Use **public** API keys only.
- **Never** ship a Test Store key in release builds (use build config / env to swap).
- For users in **Mainland China, Russia, Myanmar** set `Purchases.setProxyURL('https://api.rc-backup.com/')` before configure.
- For China, optionally `Purchases.overridePreferredUILocale('zh-CN')`.

### 3.5 Identifying Users

We call `Purchases.logIn(appUserId)` after our own auth succeeds (the MangaVerse `user.id`), and `Purchases.logOut()` on sign-out. This links RevenueCat customer to our user across platforms. If not logged in, RevenueCat assigns an anonymous `$RCAnonymousID`.

```typescript
import Purchases from 'react-native-purchases';

export async function identifyRevenueCat(userId: string) {
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    // handle error
  }
}

export async function clearRevenueCat() {
  await Purchases.logOut();
}
```

Aliasing: if two `appUserID`s restore from the same store account, RevenueCat aliases them.

---

## 4. Paywall Presentation (React Native)

### 4.1 Present paywall (current offering)

```typescript
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export async function presentPaywall(): Promise<boolean> {
  const result = await RevenueCatUI.presentPaywall();
  // or: await RevenueCatUI.presentPaywall({ offering });
  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
    case PAYWALL_RESULT.RESTORED:
      return true;
    default:
      return false;
  }
}
```

### 4.2 Present only if needed (gated by entitlement)

```typescript
export async function presentPaywallIfNeeded(entitlementId = 'pro') {
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: entitlementId,
    // offering (optional)
  });
  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
}
```

### 4.3 Embedded `<RevenueCatUI.Paywall>` (flexible placement)

```tsx
import RevenueCatUI, { CustomVariableValue } from 'react-native-purchases-ui';

function PaywallScreen() {
  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        options={{
          customVariables: {
            player_name: CustomVariableValue.string('Artist'),
            trial_days: CustomVariableValue.number(7),
            is_premium: CustomVariableValue.boolean(false),
          },
        }}
        onPurchaseStarted={() => {
          /* analytics */
        }}
        onPurchaseCompleted={({ customerInfo }) => grantAccess(customerInfo)}
        onPurchaseError={(e) => {
          /* log */
        }}
        onPurchaseCancelled={() => {}}
        onRestoreStarted={() => {}}
        onRestoreCompleted={({ customerInfo }) => grantAccess(customerInfo)}
        onDismiss={() => navigation.pop()}
      />
    </View>
  );
}
```

### 4.4 Restoring purchases

Every screen with a paywall includes a **Restore** button → `Purchases.restorePurchases()`. Required by Apple. Paywalls include it by default.

---

## 5. Subscription Status & Entitlement Gating

### 5.1 Fetch CustomerInfo

```typescript
import Purchases from 'react-native-purchases';

export async function hasEntitlement(id: 'pro' | 'studio'): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return typeof info.entitlements.active[id] !== 'undefined';
  } catch {
    return false;
  }
}
```

### 5.2 React to updates

```typescript
Purchases.addCustomerInfoUpdateListener((info) => {
  const isPro = !!info.entitlements.active['pro'];
  useEntitlementStore.setState({ isPro, isStudio: !!info.entitlements.active['studio'] });
});
```

- Updates are **not** pushed; they fire after `getCustomerInfo()`, purchases, restores on the device.
- SDK caches `CustomerInfo`; refreshed if older than **5 minutes** when `getCustomerInfo()`/purchase/restore called. Users keep access offline.
- Cache: call `getCustomerInfo()` whenever accessing premium content.

### 5.3 CustomerInfo / EntitlementInfo fields we use

- `entitlements.active` — map of active entitlements (our gate).
- `entitlements.all[id].isActive`, `.willRenew`, `.periodType` (trial/promo/intro/normal), `.latestPurchaseDate`, `.expirationDate`, `.store`, `.isSandbox`, `.unsubscribeDetectedAt`, `.billingIssueDetectedAt`, `.ownershipType` (iOS family sharing), `.productPlanIdentifier` (Google).
- `activeSubscriptions`, `allPurchasedProductIdentifiers`, `latestExpirationDate`, `managementURL` (deep-link to store subscription management), `nonSubscriptionTransactions`.

### 5.4 Offline Entitlements

If RevenueCat servers are unreachable at purchase time, the SDK grants entitlements locally from cached product→entitlement mappings, then syncs when back online. Not supported for one-time (consumable/non-consumable) purchases. Cross-platform recognition unavailable while offline.

### 5.5 Refunds

RevenueCat detects refunds automatically and updates `CustomerInfo` entitlement status — no app code needed.

---

## 6. Backend Integration (REST API + Webhooks)

### 6.1 REST API (server-side status)

```
GET https://api.revenuecat.com/v1/subscribers/{app_user_id}
Authorization: Bearer REVENUECAT_SECRET_API_KEY
```

Our API (`apps/api`) calls this to reconcile a user's plan in our `users.subscription` table (source of truth for feature flags / credit allowance).

### 6.2 Webhooks (credits for consumables)

We subscribe to RevenueCat **webhooks** (dashboard → Integrations) to:

- On `INITIAL_PURCHASE` / `RENEWAL` / `UNCANCELLATION` for subscriptions → set `subscription.tier` + `credits`.
- On `PRODUCT_PURCHASE` (consumable `ai_credits_100`, `animation_pack_10`) → increment `subscription.credits.aiGenerations` / `animations`.
- On `CANCELLATION` / `EXPIRATION` / `REFUND` → downgrade tier / revoke credits as policy dictates.

Webhook handler must verify the RevenueCat signature header.

### 6.3 Proxy / Validation

Our API never trusts the client for entitlement — it re-checks `getCustomerInfo` server-side (via REST) for privileged actions (e.g., generating animations beyond free quota).

---

## 7. RevenueCat Web (Billing Engine)

We use **RevenueCat Billing** (Stripe gateway) for web/desktop purchases (Expo web, Tauri desktop). Benefits: avoid app-store fees, sell before app install, win-back campaigns, A/B test flows.

### 7.1 Billing engines available

- **RevenueCat Billing** (Stripe gateway, we are merchant of record) — recommended.
- **Stripe Billing** (import existing Stripe catalog).
- **Paddle Billing** (Paddle merchant of record).

### 7.2 Integration paths we use

- **Web SDK** (`purchases-js`) — in our logged-in web/desktop app.
  ```typescript
  const purchases = Purchases.configure({ apiKey: WEB_BILLING_PUBLIC_API_KEY, appUserId });
  const offerings = await purchases.getOfferings();
  const result = await purchases.presentPaywall({
    htmlTarget: document.getElementById('paywall'),
    offering: offerings.current,
  });
  ```
- **Web Purchase Links** — hosted no-code checkout for email/social/landing campaigns.
- **Web Purchase Button** — from in-app paywall → browser checkout (app-to-web); uses `webPurchaseButton` in paywall config.
- **Redemption Links** — let anonymous web buyers redeem in-app via deep link.
- **Web Funnels** — multi-step onboarding/upsell flows.

### 7.3 Web SDK limitations

- Requires a **RevenueCat Billing app**; native iOS/Android IAP not processed on web.
- `getProducts`, `purchaseProduct`, `restorePurchases` are **unsupported** on web.
- Use the **same `appUserId`** across web + mobile for unified entitlements.
- Entitlements shared across platforms; web products configured separately in dashboard.

### 7.4 Compliance note (U.S. ruling)

iOS developers may link to web checkout for U.S. users without Apple fees. For non-U.S. users, Apple still requires IAP — only show web/external links to eligible U.S. users or risk rejection.

### 7.5 Fees (RevenueCat Billing, US)

- RevenueCat: no extra fee.
- Stripe: 2.9% + 30¢ per txn; optional Stripe Tax 50¢ in tax-registered regions.

---

## 8. MangaVerse Monetization Model (mapped to RevenueCat)

| Tier    | Entitlement       | Products                                    | Price (example)                    |
| ------- | ----------------- | ------------------------------------------- | ---------------------------------- |
| Free    | none              | —                                           | $0 (limited AI/credits)            |
| Pro     | `pro`             | `pro_monthly`, `pro_yearly`, `pro_lifetime` | $9.99/mo, $79.99/yr, $199 lifetime |
| Studio  | `studio`          | `studio_monthly`, `studio_yearly`           | $29.99/mo, $249/yr                 |
| Credits | none (consumable) | `ai_credits_100`, `animation_pack_10`       | $4.99, $9.99                       |

Transactional fees (platform): 5% NFT manga sales, 2% character trades, 1% tips — handled in blockchain layer, separate from RevenueCat subscriptions.

---

## 9. AI Toolkit (agent-driven setup)

The **RevenueCat AI Toolkit** (`github.com/RevenueCat/ai-toolkit`) packages the **MCP Server** + skills for Claude Code, OpenAI Codex, Cursor, Gemini CLI, VS Code, or via `npx skills add RevenueCat/ai-toolkit`. Uses OAuth against the RevenueCat account. Lets agents:

- Configure projects, products, entitlements, offerings.
- Create/manage apps across iOS/Android/web.
- Read revenue data, funnel analytics, experiment results.
- Monitor project config status.

We use this during scaffolding to provision the MangaVerse RevenueCat project from the coding agent.

---

## 10. Mobile Build & Ship Pipeline (Expo / EAS)

### 10.1 Dev builds

```bash
npx create-expo-app@latest MangaVerseMobile
cd MangaVerseMobile
npx expo install expo-dev-client
npx expo install react-native-purchases react-native-purchases-ui
npm install -g eas-cli && eas login && eas init
eas build:configure
# iOS simulator
eas build --platform ios --profile ios-simulator
# Android device/emulator
eas build --platform android --profile development
npx expo start
```

`eas.json` includes `ios-simulator` profile (extends `development`, `ios.simulator: true`).

### 10.2 Store submission

- **iOS**: App Store Connect app + products; enable IAP; upload via `eas submit`.
- **Android**: Google Play Console app + products; `eas submit --platform android`.
- **Amazon**: `.pem` public key added; `useAmazon: true`.
- **Galaxy**: physical Galaxy device for test purchases; `GALAXY_BILLING_MODE.TEST` in dev, `PRODUCTION` in submit.

### 10.3 Preview API Mode (Expo Go)

`react-native-purchases` auto-detects Expo Go and uses JS mock APIs (Preview API Mode) so subscription UI can be prototyped without a dev build. Real purchases require a dev build.

---

## 11. Testing

### 11.1 Test Store (instant, no real stores)

- Use **Test Store API key** in debug builds.
- Test Store purchases behave like real subscriptions, validate server-side, no real money.
- Min SDK: React Native 9.5.4+.

### 11.2 Sandbox

- iOS StoreKit sandbox / Google Play License testers.
- Galaxy: physical device only.

### 11.3 Debugging

- `Purchases.setLogLevel(LOG_LEVEL.VERBOSE)` in dev.
- Empty `offerings`/products almost always a dashboard config issue (verify entitlements→products→offering).

---

## 12. Security & Compliance

- Public API keys only in client; secret key server-side only.
- Verify webhook signatures.
- Never ship Test Store key to production.
- Proxy URL for restricted regions.
- Prefer server-side re-validation for entitlement-gated privileged actions.

---

_Document Version: 1.0 — Last Updated: July 18, 2026_
