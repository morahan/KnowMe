# PRODUCT.md — KnowMe

## What it is
A private journal for people changing a habit (alcohol, cannabis, gambling, nicotine, or their own). You log the moments a craving shows up. KnowMe shows you your own patterns. **It never tells you what to do.**

> Know thyself. The data is yours, the conclusions are yours.

## Who it's for
Self-directed adults who want to understand their habits without being lectured, labeled, or tracked by a company. Not a replacement for treatment or for people.

## Principles
1. **Reflect, don't prescribe.** The app shows patterns and asks questions. It never gives orders.
2. **Private by default.** Everything lives on the device. Only anonymous summaries ever leave it, and only when the user taps "Reflect."
3. **Ten seconds or less.** Logging a moment must be fast enough to do mid-craving.
4. **No shame.** No streak-breaking drama, no red failure states, no "relapse" language.
5. **Your words first.** The user's own reasons and helpers are the most powerful content in the app. Show them back.

## MVP scope (build only this)
| Feature | What it does |
|---|---|
| Setup | Pick what you're tracking. Write 1–8 reasons why. Skippable. |
| Log a moment | Intensity 1–10, context, feelings, rode it out / used, what helped, optional note. |
| Today | Days since last "used" per habit, today's moments, the **I'm in it** button. |
| I'm in it | Your reasons, your top 3 helpers, a 20-minute timer with paced breathing, then "Where's it at now?" |
| Patterns | Local charts: intensity over time, cravings by hour, top contexts/feelings, what helps. One plain sentence under each. |
| Reflect | Llama writes a short weekly mirror from an anonymous summary. Ends with one open question. |
| Me | Edit habits and reasons, Get support, privacy note, demo-data switch. |

## Explicitly out of scope
Accounts, cloud sync, payments, notifications, social features, the GuideMe chat coach, wearables, streak badges, gamification.

## Data model
- `habits(id, name, kind, created_at)`
- `reasons(id, habit_id, text, sort_order)` — `habit_id` null means universal (applies to every habit); a habit id means that reason belongs to that habit only. Per-habit reasons are optional and only offered when tracking 2+ habits.
- `moments(id, habit_id, created_at, intensity, context, feelings[], outcome, helpers[], note)`
  - `context`: car | home | social | work | other
  - `outcome`: rode_it_out | used
  - `feelings`: bored, celebrating, lonely, restless, stressed, tired, other
  - `helpers`: call someone, food, game, music, shower, tea, walk, other

## The demo story (3 minutes)
1. Open the app: calm, almost empty.
2. "I'm in it": your reasons appear, the breath circle starts.
3. Log the moment in under 10 seconds.
4. Patterns: "Most of your cravings land between 7 and 10pm."
5. Reflect: Llama mirrors the week back and asks one question.
6. Safety: type a crisis phrase, the 988 card appears first.

## Success = the judge says
"That's the calmest app I've seen today, and it actually understood me."
