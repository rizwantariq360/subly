<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your Subly Expo application. The following changes were made:

- **`app.config.js`** — Created (converted from `app.json`) with PostHog extras (`posthogProjectToken`, `posthogHost`) sourced from environment variables via `process.env`.
- **`.env`** — PostHog project token and host written as `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST`.
- **`lib/posthog.ts`** — New PostHog client module configured via `expo-constants` extras. Autocaptures app lifecycle events. Gracefully disabled when the token is not set.
- **`app/_layout.tsx`** — Wrapped with `PostHogProvider` (autocapture enabled for touches). Manual screen tracking added via `useEffect` + `usePathname`.
- **`app/(auth)/sign-in.tsx`** — `user_signed_in` captured on successful authentication.
- **`app/(auth)/sign-up.tsx`** — `user_signed_up` captured and user identified (`posthog.identify`) with `signup_date` set on first signup.
- **`app/(tabs)/settings.tsx`** — `user_signed_out` captured and `posthog.reset()` called before sign-out.
- **`app/(auth)/forgot-password.tsx`** — `password_reset_requested` captured on email submission; `password_reset_completed` captured on successful password update.
- **`app/(tabs)/index.tsx`** — `subscription_card_expanded` captured (with `subscription_id` and `subscription_name`) on card tap; `subscription_add_tapped` captured on the + button.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully completes the sign-in flow | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User successfully completes account registration | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User presses sign out and their session is ended | `app/(tabs)/settings.tsx` |
| `password_reset_requested` | User submits their email to request a password reset code | `app/(auth)/forgot-password.tsx` |
| `password_reset_completed` | User successfully sets a new password after the reset flow | `app/(auth)/forgot-password.tsx` |
| `subscription_card_expanded` | User taps a subscription card to expand its details | `app/(tabs)/index.tsx` |
| `subscription_add_tapped` | User taps the + button to add a new subscription | `app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/410651/dashboard/1547287
- **Sign-up vs Sign-in (Daily trend)**: https://us.posthog.com/project/410651/insights/awJxhFw1
- **Auth conversion funnel**: https://us.posthog.com/project/410651/insights/5uoA7ITB
- **Password reset funnel**: https://us.posthog.com/project/410651/insights/p9g14aI6
- **Sign-out rate (churn signal)**: https://us.posthog.com/project/410651/insights/D2gWPatK
- **Subscription engagement**: https://us.posthog.com/project/410651/insights/CukkUsP4

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
