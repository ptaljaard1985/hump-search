# Model comparison — Sonnet 4.6 vs Sonnet 5 vs Haiku 4.5

**Run:** 18 August 2026 · **Index:** 216 items · **Queries:** the 5 most recent real member searches
**Cost of this test run:** $2.30 (15 calls)

Each model received the exact production prompt from `src/lib/search.ts` — same system prompt, same full 216-item content list, `max_tokens: 1200`.

## Parameter differences (not a choice — forced by the API)

| Model | `temperature: 0` | Thinking | Notes |
|---|---|---|---|
| Sonnet 4.6 | accepted | n/a | Exactly what runs in production today |
| Sonnet 5 | **rejected — HTTP 400** | on by default, disabled for this test | ``temperature` is deprecated for this model.` |
| Haiku 4.5 | accepted | n/a | Drop-in for the current call |

Sonnet 5 cannot honour the "all Claude calls use `temperature: 0`" rule in `spec.md`. Verified with a live probe, not assumed.

## Summary

| Query | Model | Items returned | Output tokens | Truncated? | Latency | Cost |
|---|---|---:|---:|---|---:|---:|
| `what to expect` | Sonnet 4.6 (incumbent) | 19 | 1200 | **YES** | 34.8s | $0.2027 |
| `what to expect` | Sonnet 5 (latest) | 13 | 1200 | **YES** | 14.7s | $0.1988 |
| `what to expect` | Haiku 4.5 (latest) | 0 | 207 | no | 5.0s | $0.0626 |
| `cashflow` | Sonnet 4.6 (incumbent) | 18 | 1200 | **YES** | 27.8s | $0.2027 |
| `cashflow` | Sonnet 5 (latest) | 11 | 1029 | no | 12.8s | $0.1971 |
| `cashflow` | Haiku 4.5 (latest) | 0 | 221 | no | 4.7s | $0.0627 |
| `wall of worry` | Sonnet 4.6 (incumbent) | 17 | 1200 | **YES** | 28.1s | $0.2027 |
| `wall of worry` | Sonnet 5 (latest) | 8 | 790 | no | 11.4s | $0.1947 |
| `wall of worry` | Haiku 4.5 (latest) | 16 | 1200 | **YES** | 14.1s | $0.0676 |
| `scoreboard` | Sonnet 4.6 (incumbent) | 6 | 519 | no | 13.2s | $0.1925 |
| `scoreboard` | Sonnet 5 (latest) | 3 | 382 | no | 7.1s | $0.1906 |
| `scoreboard` | Haiku 4.5 (latest) | 1 | 180 | no | 4.3s | $0.0625 |
| `explaining risk` | Sonnet 4.6 (incumbent) | 15 | 1200 | **YES** | 28.4s | $0.2027 |
| `explaining risk` | Sonnet 5 (latest) | 9 | 1041 | no | 13.2s | $0.1972 |
| `explaining risk` | Haiku 4.5 (latest) | 16 | 1200 | **YES** | 15.7s | $0.0676 |

### Aggregate

| Model | Truncated | Avg items | Near-empty answers | Avg latency | Avg cost | Cost/month at 36 searches |
|---|---:|---:|---:|---:|---:|---:|
| Sonnet 4.6 (incumbent) | 4/5 | 15.0 | 0/5 | 26.5s | $0.2007 | $7.19 |
| Sonnet 5 (latest) | 1/5 | 8.8 | 0/5 | 11.9s | $0.1957 | $7.01 |
| Haiku 4.5 (latest) | 2/5 | 6.6 | 3/5 | 8.8s | $0.0646 | $2.31 |

> Sonnet 5 shows intro pricing ($2/$10 per MTok, ends 31 Aug 2026). From 1 September it reverts to $3/$15, which on its 93,408-token prompt is **$0.29/search** — 45% more than Sonnet 4.6 today.

---

## Full outputs

---

# Query: `what to expect`

## Sonnet 4.6 (incumbent)

*19 items · 1200 output tokens · 34.8s · $0.2027 · stop_reason: `max_tokens` — **response cut off mid-sentence***

```markdown
Here's what we have on setting expectations with clients — a broad theme that touches on onboarding, market behaviour, planning processes, and the adviser-client relationship.

## Client Articles

### [Our First 12 Months](https://www.humansundermanagement.com/our-first-12-months)
A foundational onboarding piece that directly addresses what new clients should expect in their first year, including how to think about portfolio values and market volatility from the outset.

---

### [Financial Planning is a Process, Not an Event](https://www.humansundermanagement.com/process-not-event)
Helps clients understand that financial planning is iterative and ongoing, setting realistic expectations about the advisory relationship from the very first meeting.

---

### [The Permanent Challenge of Temporary Declines](https://www.humansundermanagement.com/the-permanent-challenge-of-temporary-declines)
Sets clear expectations about market volatility being normal and recurring, rather than something exceptional to fear or react to.

---

### [Volatility: The Investor's Forgotten Friend](https://www.humansundermanagement.com/volatility-forgotten-friend)
Reframes market corrections as a predictable feature of investing, helping clients know what to expect rather than being caught off guard when calm periods end.

---

### [Two Steps Forward, One Step Back](https://www.humansundermanagement.com/two-steps-forward-one-step-back)
Uses historical context and the "bear in the wild" analogy to help clients understand that setbacks are a normal part of the investment journey.

---

### [The Mirage of Certainty](https://www.humansundermanagement.com/the-mirage-of-certainty)
Prepares clients for the reality that uncertainty never goes away, helping them stop waiting for the "right time" and instead commit to their long-term plan.

---

### [The Importance of a Margin of Safety](https://www.humansundermanagement.com/margin-of-safety)
Sets realistic expectations around investment returns, inflation, and retirement planning assumptions, helping clients understand why conservative projections are prudent rather than pessimistic.

---

### [Persevering Through the Early Years of Wealth Creation](https://www.humansundermanagement.com/early-years)
Ideal for newer investors who need honest expectations about how slowly wealth builds in the early years before compounding accelerates.

---

### [Do You Deserve the Returns?](https://www.humansundermanagement.com/deserve-returns)
Explains what clients should expect to experience emotionally as investors, and what behaviours are required to actually capture the returns their portfolio is designed to deliver.

---

### [A Different Conversation About Risk](https://www.humansundermanagement.com/risk-conversation)
Moves beyond tick-box risk profiling to set genuine expectations about how markets behave and how clients are likely to feel when they fall.

---

## Adviser Documents

### [Our First 12 Months](https://www.humansundermanagement.com/our-first-12-months)
A ready-to-share document for new client onboarding that proactively addresses the most common first-year anxieties before they become problems.

---

### [Welcome Meeting Agenda](https://www.humansundermanagement.com/welcome-meeting-agenda)
A structured agenda for the first formal meeting after a client commits, covering market volatility expectations, portfolio monitoring habits, and what the ongoing relationship will look like.

---

### [A Letter of Appreciation](https://www.humansundermanagement.com/appreciation)
Sent after initial planning work is complete, this letter reinforces what clients should expect going forward — including inevitable market declines — while the relationship is still fresh and strong.

---

### [Yellow & Red Cards That Could End Our Professional Relationship](https://www.humansundermanagement.com/yellow-red-cards)
Sets clear expectations about the behaviours required from clients for the relationship to work well, helping advisers establish professional boundaries from the outset.

---

### [How Long Should I Invest This Money For?](https://www.humansundermanagement.com/how-long-should-i-invest-this-money-for)
Directly answers one of the most common new client questions, using real calendar year returns to make volatility tangible and set honest expectations about investment timeframes.

---

### [A Different Conversation About Risk](https://www.humansundermanagement.com/risk-conversation)
A document to use after proper risk education, reinforcing that risk is the gap between expectations and experience — and that preparation matters more than questionnaire scores.

---

## Infographics

### [Annual Declines](https://www.humansundermanagement.com/premium-visuals)
Shows clients that significant intra-year market declines are a regular occurrence, helping set expectations that volatility is normal rather than alarming.

---

### [The Random Path To Average Returns](https://www.humansundermanagement.com/premium-visuals)
Illustrates how wildly annual returns vary, setting honest expectations that the path to long-term wealth is rarely smooth or predictable.

---

### [Choose Your Outcome
```

## Sonnet 5 (latest)

*13 items · 1200 output tokens · 14.7s · $0.1988 · stop_reason: `max_tokens` — **response cut off mid-sentence***

```markdown
Here's what we found on setting expectations and preparing clients for what lies ahead — whether that's onboarding, market volatility, or major life transitions.

## Client Articles

### [Your Most Important Investment Decision](https://www.humansundermanagement.com/your-most-important-investment-decision)

Perfect for setting expectations around the fundamental choice between equities and bonds, helping clients understand what really drives long-term returns before they get distracted by noise.

### [The Mirage of Certainty](https://www.humansundermanagement.com/the-mirage-of-certainty)

Ideal for clients waiting for "the right time" or more certainty before committing to a plan, reframing uncertainty as permanent rather than a temporary obstacle to expect and prepare for.

### [How Long Should I Invest This Money For?](https://www.humansundermanagement.com/how-long-should-i-invest-this-money-for)

Directly addresses one of the most common client questions about timeframes and what volatility to expect along the way, using real calendar year data to make it tangible.

### [The Permanent Challenge of Temporary Declines](https://www.humansundermanagement.com/the-permanent-challenge-of-temporary-declines)

Sets realistic expectations about the frequency and normality of market declines, helping clients understand what "normal" investing actually looks like.

### [Longevity: The Underappreciated Retirement Risk](https://www.humansundermanagement.com/longevity-risk)

Perfect for helping retirees understand what to expect from a multi-decade retirement, reframing the real risk as running out of money rather than short-term volatility.

### [Your Most Important Transition](https://www.humansundermanagement.com/your-most-important-transition)

Helps clients understand what to expect emotionally and practically as they approach retirement, beyond just the financial numbers.

## Adviser Documents

### [Our First 12 Months](https://www.humansundermanagement.com/our-first-12-months)

A foundational onboarding document that sets clear expectations for the first year of the adviser-client relationship, addressing mental accounting and market volatility upfront.

### [Welcome Meeting Agenda](https://www.humansundermanagement.com/welcome-meeting-agenda)

A comprehensive first-meeting agenda that sets expectations for everything from market declines to communication frequency right at the start of the relationship.

### [Time Out of The Markets When Moving Assets](https://www.humansundermanagement.com/time-out-of-the-markets-when-moving-assets)

Helps set expectations for clients transferring assets, explaining what to expect during the transition period and why temporary cash positions are normal.

### [A Different Conversation About Risk](https://www.humansundermanagement.com/risk-conversation)

Moves beyond tick-box risk profiling to properly prepare clients for what market risk actually feels like, not just what a questionnaire score suggests.

### [Investment Policy Statement](https://www.humansundermanagement.com/videos-guides-sequences#guides)

Establishes clear expectations about investment philosophy and the different types of risk clients should anticipate from the very first meeting.

## PDF Guides

### [What We Believe](http://humansundermanagement.com/videos-guides-sequences#guides)

Sets out the adviser's investment philosophy clearly, helping clients know what to expect from the relationship and the approach to markets.

### [Successful Investing in Pictures](http://humansundermanagement.com/videos-guides-sequences#guides)

A visual guide covering seven core principles that helps clients understand what to expect from markets and their
```

## Haiku 4.5 (latest)

*0 items · 207 output tokens · 5.0s · $0.0626 · stop_reason: `end_turn`*

```markdown
Here's what we have on understanding what to expect from your financial planning and investments.

I've searched through our content library, but I'm not finding strong matches for a general "what to expect" query. Your search is quite broad, and the best recommendations would depend on what specifically you're looking to understand.

Could you help me narrow this down? For example, are you looking for:

- **What to expect from a financial adviser** (our service, process, or relationship)
- **What to expect from your investments** (market behaviour, volatility, returns)
- **What to expect from financial planning** (the planning process, timelines, outcomes)
- **What to expect in retirement** (income, spending, longevity)
- **What to expect during market downturns** (how markets behave, what to do)

Once you clarify what aspect interests you most, I can point you toward the most relevant content from our library.
```

---

# Query: `cashflow`

## Sonnet 4.6 (incumbent)

*18 items · 1200 output tokens · 27.8s · $0.2027 · stop_reason: `max_tokens` — **response cut off mid-sentence***

```markdown
Here's what we have on cashflow — it's a broad topic, so I've surfaced the most relevant content across planning, spending, retirement transitions, and client conversations.

---

## Client Articles

### [Making The Transition from Saving to Spending](https://www.humansundermanagement.com/saving-spending)

Addresses the psychological shift from accumulation to spending in retirement — directly relevant to cashflow planning conversations with clients who struggle to draw down their wealth purposefully.

---

### [You Stop. Your Money Shouldn't.](https://www.humansundermanagement.com/retirement-money)

Explores how retirees should think about maintaining growth investments alongside accessible cash reserves, introducing the practical concept of keeping 1–3 years of expenses in cash — a core cashflow planning principle.

---

### [Understanding Your Financial Levers](https://www.humansundermanagement.com/your-financial-levers)

Reframes financial planning around seven controllable factors including expenses, income, and retirement timelines — ideal for cashflow conversations where clients need to see what they can actually influence.

---

### [Know Your Numbers](https://www.humansundermanagement.com/know-your-numbers)

Introduces six key metrics including a "wealth window" (months to financial independence) and income shortfall — a structured framework for helping clients track cashflow progress towards retirement.

---

### [The Importance of a Margin of Safety](https://www.humansundermanagement.com/margin-of-safety)

Tackles overconfident planning assumptions around returns, inflation, and retirement spending — essential reading for clients whose cashflow projections may be built on unrealistic foundations.

---

### [Longevity: The Underappreciated Retirement Risk](https://www.humansundermanagement.com/longevity-risk)

Helps clients understand that their money may need to last 30+ years, reframing cashflow planning as a long-term challenge rather than a short-term income problem.

---

### [You Will Likely Run Out Of Money](https://www.humansundermanagement.com/you-will-likely-run-out-of-money)

A direct, no-nonsense piece for clients withdrawing too much in retirement, introducing the 4% rule and practical withdrawal rate concepts — ideal for difficult cashflow conversations.

---

### [What's The Money For?](https://www.humansundermanagement.com/money-why)

Encourages clients to anchor investment decisions to purpose and timeframe — a useful starting point for any cashflow planning conversation where goals lack clarity.

---

### [Getting Organised: The First Step Towards Financial Clarity](https://www.humansundermanagement.com/organised)

Addresses financial disorganisation and the paralysis it creates, helping clients understand why getting a clear picture of their cashflow is the foundation for good planning.

---

### [Your Financial Prescription](https://www.humansundermanagement.com/financial-prescription)

Uses a medical analogy to walk clients through a three-stage financial health framework — stopping the bleeding, stabilising, and recovering — which maps naturally onto cashflow planning conversations.

---

### [The Uncomfortable Number](https://www.humansundermanagement.com/uncomfortable-number)

Introduces the concept of saving at a level that creates a slight pinch — directly relevant to cashflow conversations about contribution rates and balancing present spending with future security.

---

### [How to Think About a Pay Increase](https://www.humansundermanagement.com/pay-increase)

Addresses lifestyle inflation and the behavioural trap of spending every pay rise — a practical cashflow conversation starter for working clients at annual review.

---

## Adviser Documents

### [Why We Focus on Total Returns](https://www.humansundermanagement.com/why-we-focus-on-total-returns)

Helps advisers explain flexible withdrawal strategies to clients who mistakenly believe they need dividend income to fund retirement cashflow — particularly useful for pre-retirees.

---

### [What's The Money For?](https://www.humansundermanagement.com/whats-the-money-for)

A letter for wealthy retirees who have more than enough but struggle to spend — ideal when cashflow planning reveals a client is living well below their means despite a healthy financial position.

---

### [It's Time To Nudge Up Your Contributions](https://www.humansundermanagement.com/nedge-contributions)

A direct template for addressing clients who haven't increased contributions in line with inflation — essential for keeping cashflow projections on track during annual reviews.

---

### [You Will Likely Run Out Of Money](https://www.humansundermanagement.com/you-will-likely-run-out-of-money)

A frank document for retirees drawing down too quickly, introducing withdrawal rate frameworks and backup options — useful when cashflow modelling reveals a sustainability problem.

---

## Infographics

### [Planning For A Longer Future](https://www.humansundermanagement.com/premium-visuals)

Powerfully illustrates that at least one partner in a couple is likely to live much longer than expected — a compelling visual for cashflow planning conversations about retirement income longevity.

---

### [The Lon
```

## Sonnet 5 (latest)

*11 items · 1029 output tokens · 12.8s · $0.1971 · stop_reason: `end_turn`*

```markdown
Here's what we have on cashflow planning and helping clients navigate their income, spending, and long-term financial organisation.

## Client Articles

### [Making The Transition from Saving to Spending](https://www.humansundermanagement.com/saving-spending)
Perfect for clients struggling with the psychological shift from accumulation to drawing an income, particularly newly retired clients who need permission to spend confidently.

### [You Stop. Your Money Shouldn't.](https://www.humansundermanagement.com/retirement-money)
Addresses the cashflow challenge of structuring a retirement portfolio, including the practical approach of keeping 1-3 years of expenses in cash alongside growth investments.

### [Know Your Numbers](https://www.humansundermanagement.com/know-your-numbers)
A practical framework covering six key financial metrics, including income shortfall and wealth window, ideal for clients wanting to track their cashflow progress systematically.

### [What's The Money For?](https://www.humansundermanagement.com/money-why)
Helps clients reconnect with the purpose behind their cashflow and investment decisions rather than getting distracted by market noise.

### [Getting Organised: The First Step Towards Financial Clarity](https://www.humansundermanagement.com/organised)
Addresses the common challenge of disorganised finances and unclear cash flow, ideal for clients feeling overwhelmed before any planning can begin.

### [Longevity: The Underappreciated Retirement Risk](https://www.humansundermanagement.com/longevity-risk)
Useful for clients who need to understand why their cashflow must be planned over a potentially 30-year retirement horizon rather than shorter timeframes.

## Adviser Documents

### [You Will Likely Run Out Of Money](https://www.humansundermanagement.com/you-will-likely-run-out-of-money)
A direct tool for addressing unsustainable retirement spending, introducing the 4% (or 3%) withdrawal rule to help clients understand sustainable cashflow.

### [How Long Should I Invest This Money For?](https://www.humansundermanagement.com/how-long-should-i-invest-this-money-for)
Useful for clients asking about investment timeframes for lump sums, helping set expectations around cashflow needs versus market volatility.

## Infographics

### [What Will Your Money Buy You?](https://www.humansundermanagement.com/premium-visuals)
Makes inflation's impact on future spending power tangible, useful for cashflow conversations about retirement income needs versus today's expenses.

### [Financial Health Prescription](https://www.humansundermanagement.com/premium-visuals)
A visual framework covering debt management, emergency funds, and regular investing — the building blocks of sound cashflow planning.

## PDF Guides

### [How We Can Help You](https://www.humansundermanagement.com/videos-guides-sequences#guides)
Breaks down financial planning into manageable pieces including "getting organised" and "creating an action plan," useful for explaining the cashflow planning process to prospects.
```

## Haiku 4.5 (latest)

*0 items · 221 output tokens · 4.7s · $0.0627 · stop_reason: `end_turn`*

```markdown
Here's what we have on cashflow planning and management.

I'm afraid none of the items in our current library are specifically focused on cashflow as a primary topic. The content we have covers related areas like budgeting, spending discipline, and cash management within broader financial planning, but nothing dedicated to cashflow analysis, forecasting, or optimisation.

I'd suggest trying a search for related terms like:
- **"Budget"** or **"spending"** – for content on managing outflows
- **"Cash reserves"** or **"emergency fund"** – for content on maintaining adequate liquidity
- **"Retirement income"** or **"drawdown"** – for content on managing cashflow in retirement
- **"Business owner"** – for content on business cashflow and profit extraction

Alternatively, if you're looking for content on a specific cashflow challenge (like helping a client manage spending in retirement, or understanding their monthly budget), please rephrase your query and I'll be happy to search again.
```

---

# Query: `wall of worry`

## Sonnet 4.6 (incumbent)

*17 items · 1200 output tokens · 28.1s · $0.2027 · stop_reason: `max_tokens` — **response cut off mid-sentence***

```markdown
Here's what we have on the "wall of worry" — a classic concept in behavioural finance describing how markets climb despite a constant backdrop of bad news and uncertainty.

## Client Articles

### [The Case For Rational Optimism](https://www.humansundermanagement.com/rational-optimism)
Perfect for clients who are losing faith in long-term investing due to negative headlines, this piece explains why rational optimism — acknowledging problems whilst maintaining confidence in human progress — is the logical foundation for staying invested.

---

### [The Mirage of Certainty](https://www.humansundermanagement.com/the-mirage-of-certainty)
Addresses clients who are waiting for the world to "calm down" before investing, reinforcing that uncertainty is permanent and that the wall of worry never disappears — it simply changes shape.

---

### [Two Steps Forward, One Step Back](https://www.humansundermanagement.com/two-steps-forward-one-step-back)
Uses historical context and the "bear in the wild" analogy to help clients understand that markets climb through crises rather than waiting for them to resolve.

---

### [The Year That Was](https://www.humansundermanagement.com/2021-the-year-that-was)
Illustrates the disconnect between a relentlessly negative news cycle and positive investment returns — a textbook example of the wall of worry in action.

---

### [Ukraine & Your Retirement](https://www.humansundermanagement.com/ukraine-your-retirement)
A timely piece for clients panicking during geopolitical crises, reinforcing that markets have always climbed a wall of worry and that staying the course is the appropriate response.

---

### [A Constant Chain of Surprises](https://www.humansundermanagement.com/surprises)
Explains why the biggest market shocks come from unexpected events rather than the risks everyone is watching — a powerful complement to the wall of worry narrative.

---

### [A Tale of the 2020's](https://www.humansundermanagement.com/tale-2020s)
Walks through nine major market shocks between 2020 and 2026 alongside a 123% market gain, making the wall of worry concept vivid and emotionally resonant for clients who lived through those events.

---

### [Congratulate Your Past Self](https://www.humansundermanagement.com/congratulate-your-past-self)
Helps clients recognise they have already successfully navigated multiple crises — reframing the wall of worry as something they have climbed before and can climb again.

---

## Adviser Documents

### [Our Response to Doomsday Theories](https://www.humansundermanagement.com/doomsday-theories)
A ready-to-use template for responding when clients forward alarming articles or predictions, redirecting them from fear-driven noise back to their long-term plan.

---

### [Back to First Principles](https://www.humansundermanagement.com/first-principles)
A letter template for resetting client relationships when market noise is causing them to question their strategy, covering the five core principles that explain why markets climb despite constant worry.

---

## Infographics

### [Wall of Worry](https://www.humansundermanagement.com/premium-visuals)
The definitive visual for this concept — a timeline showing how markets have risen over decades despite a continuous stream of crises, conflicts, and economic shocks. Use this in client meetings or newsletters whenever anxiety about current events is running high.

---

### [This Time Is Never Different](https://www.humansundermanagement.com/premium-visuals)
Demonstrates that every era in market history has felt uniquely dangerous, yet patient investors have consistently been rewarded — a powerful visual companion to the wall of worry message.

---

### [Market Events of the 2020's](https://www.humansundermanagement.com/premium-visuals)
Maps major global disruptions across the 2020s against the market's long-term trajectory, showing clients that volatility is the norm and that staying invested through each crisis was the right call.

---

### [The Case For Rational Optimism (Visual)](https://www.humansundermanagement.com/premium-visuals)
Uses four measures of human progress to counter pessimism bias, helping clients maintain confidence in long-term investing even when the world feels like it is getting worse.

---

### [Behaving Your Way to Wealth](https://www.humansundermanagement.com/premium-visuals)
Celebrates clients who stayed invested through a series of market declines, turning the wall of worry into a record of resilience and achievement.

---

## PDF Guides

### [Successful Investing in Pictures](http://humansundermanagement.com/videos-guides-sequences#guides)
This visual guide explicitly references the wall of worry concept, showing how markets climb through crises rather than waiting for them to pass — ideal for sharing with clients who are overwhelmed by market noise.

---

## Email Sequences

### [10 Visual Lessons](https://www.humansundermanagement.com/sequence-visuals)
This 10-part onboarding sequence includes the wall of worry as one
```

## Sonnet 5 (latest)

*8 items · 790 output tokens · 11.4s · $0.1947 · stop_reason: `end_turn`*

```markdown
Here's what we have on the "wall of worry" concept — helping clients understand that markets climb despite a constant stream of bad news.

## Infographics

### [Wall of Worry](https://www.humansundermanagement.com/premium-visuals)

This is the direct match for your search — a timeline showing how markets have historically risen despite continuous negative headlines, crises, and conflicts. Perfect for reassuring anxious clients who think "things feel worse than ever" or who want to wait until things calm down before investing.

### [Market Events of the 2020's](https://www.humansundermanagement.com/premium-visuals)

A closely related visual mapping recent global shocks against the market's long-term upward trajectory, reinforcing that volatility is the norm rather than the exception.

### [This Time Is Never Different](https://www.humansundermanagement.com/premium-visuals)

Complements the wall of worry theme by showing how every era has faced seemingly unprecedented threats, yet markets have continued climbing over time.

## Client Articles

### [A Tale of the 2020's](https://www.humansundermanagement.com/tale-2020s)

Walks through nine major market shocks from 2020-2026 against the S&P 500's strong long-term gain, reinforcing the wall of worry idea through a lived narrative.

### [The Prophets of Doom](https://www.humansundermanagement.com/doom)

Explains why investors are psychologically drawn to doom predictions and why acting on them usually causes more harm than staying the course.

### [Finding The Signal Within The Noise](https://www.humansundermanagement.com/signal-noise)

Helps clients distinguish meaningful long-term signals from the constant noise of alarming headlines, directly supporting the wall of worry mindset.

## Adviser Documents

### [Our Response to Doomsday Theories](https://www.humansundermanagement.com/doomsday-theories)

A ready-to-send letter template for when clients forward alarming doomsday articles, redirecting focus back to their long-term plan rather than fear-driven headlines.

## Email Sequences

### [10 Visual Lessons](https://www.humansundermanagement.com/sequence-visuals)

This onboarding sequence explicitly covers the "wall of worry" phenomenon among other core investing concepts, making it ideal for building a client's foundational understanding of market behaviour.
```

## Haiku 4.5 (latest)

*16 items · 1200 output tokens · 14.1s · $0.0676 · stop_reason: `max_tokens` — **response cut off mid-sentence***

```markdown
Here's what we have on the "wall of worry" — a concept that helps explain how markets climb despite constant crises and concerns.

## Client Articles

### [The Case For Rational Optimism](https://www.humansundermanagement.com/rational-optimism)

This piece provides powerful perspective for clients overwhelmed by negative news cycles who are losing faith in long-term investing. It counters pessimism with concrete evidence of human progress, helping clients maintain rational optimism about their long-term investments.

### [Wall of Worry](https://www.humansundermanagement.com/premium-visuals)

This infographic powerfully demonstrates that despite a continuous stream of negative world events—from financial crises and conflicts to environmental disasters—markets have historically continued their upward trajectory. It's perfect for calming anxious clients during volatile periods.

### [Congratulate Your Past Self](https://www.humansundermanagement.com/congratulate-your-past-self)

This article helps clients recognise they've successfully weathered previous crises and can do so again, addressing the emotional challenge that "this time is different" during each new crisis. It reinforces that whilst each crisis feels unique and terrifying, they rarely matter in the long term.

### [The Mirage of Certainty](https://www.humansundermanagement.com/the-mirage-of-certainty)

Perfect for clients paralysed by current events or waiting for "the right time" to invest, this piece reframes uncertainty as normal rather than exceptional and emphasises focusing on controllable factors like spending and saving rates rather than unpredictable external events.

### [Two Steps Forward, One Step Back](https://www.humansundermanagement.com/two-steps-forward-one-step-back)

This article uses the "bear in the wild" analogy to help anxious investors understand that volatility is normal and expected, not a reason to abandon their long-term strategy. It includes historical context showing how markets have recovered from previous declines.

### [The Prophets of Doom](https://www.humansundermanagement.com/doom)

This piece addresses why we're psychologically drawn to doom predictions and why this serves us poorly in investing. It highlights how even "correct" predictions often cause more harm than good, as investors who react typically miss recoveries.

### [A Tale of the 2020's](https://www.humansundermanagement.com/tale-2020s)

This article walks through nine significant market shocks between 2020 and 2026 and contrasts the emotional weight of each moment with the S&P 500's 123% gain over the same period, reinforcing that staying the course through real, frightening events is what matters.

### [Logic Lost to Fear](https://www.humansundermanagement.com/logic-fear)

This piece uses Jonathan Haidt's "elephant and rider" metaphor to help clients understand why they feel compelled to act against their better judgement during market downturns, and why fear always passes.

### [The Permanent Challenge of Temporary Declines](https://www.humansundermanagement.com/the-permanent-challenge-of-temporary-declines)

Perfect for nervous clients during market downturns, this article emphasises that market declines are normal, temporary, and the "price of admission" for long-term returns, addressing the natural flight response when markets fall.

### [Conflict, Corrections and Courage](https://www.humansundermanagement.com/conflict-courage)

This is your go-to piece when clients panic about global events affecting their investments, reassuring them that market declines are normal features and emphasising the importance of not interrupting long-term compounding.

### [Dead Money, Living Money](https://www.humansundermanagement.com/living-money)

This article reframes the conversation from "risk versus safety" to "dead money versus living money," helping clients understand that productive assets adapt and grow whilst cash gradually loses purchasing power to inflation.

---

## Adviser Documents

### [Our Response to Doomsday Theories](https://www.humansundermanagement.com/doomsday-theories)

This template letter helps advisers respond professionally when clients share alarming financial predictions or doomsday articles, establishing clear boundaries between evidence-based investing and speculation.

### [Back to First Principles](https://www.humansundermanagement.com/first-principles)

This letter template helps advisers reset relationships when clients start questioning their approach or getting distracted by market noise, refocusing them on five core principles that actually matter for long-term wealth building.

---

## Infographics

### [Market Events of the 2020's](https://www.humansundermanagement.com/premium-visuals)

This infographic maps major global events against the long-term trajectory of the market, making it unmistakably clear that investors who stayed the course through each crisis were rewarded.

### [This Time Is Never Different](https://www.humansundermanagement.com/premium-visuals)

This powerful visual demonstrates how every period in market history has faced seemingly catastrophic events and dire predictions, yet markets have continued their upward trajectory over time.

### [Time - The Antidote To Fear](https://www.humansundermanagement.com/premium-vis
```

---

# Query: `scoreboard`

## Sonnet 4.6 (incumbent)

*6 items · 519 output tokens · 13.2s · $0.1925 · stop_reason: `end_turn`*

```markdown
Here's what we have on the topic of scoreboards and how to measure financial progress in a meaningful way.

## Client Articles

### [Choosing the Right Scoreboard](https://www.humansundermanagement.com/choosing-scoreboard)

This article directly addresses the behavioural trap of using the wrong benchmark — whether a market index or social comparison — to judge financial progress. It reframes "how am I doing?" around five personal questions covering goals, savings rate, and whether money is funding a deliberately chosen life.

---

### [Standing at a Distance](https://www.humansundermanagement.com/standing-distance)

This piece tackles the destructive habit of daily portfolio monitoring and "scorekeeping," explaining why frequent checking correlates with worse decisions and greater anxiety. It offers practical solutions such as checking portfolios quarterly and focusing on long-term timeframes rather than short-term noise.

---

### [Know Your Numbers](https://www.humansundermanagement.com/know-your-numbers)

This article introduces six key personal financial metrics — including wealth window, saving percentage, and equity allocation — to help clients track genuine progress rather than fixating on market returns. It's particularly effective for analytical clients who respond well to concrete frameworks.

---

### [Asking Better Questions](https://www.humansundermanagement.com/better-questions)

This piece helps clients move away from short-term, market-focused questions and towards strategic thinking about long-term goals and financial independence. It's ideal when clients are fixating on performance figures rather than what truly matters.

---

## Infographics

### [The 30-Year Scorecard](https://www.humansundermanagement.com/premium-visuals)

This visual comparison tool demonstrates the long-term power of equity investing, helping clients shift their benchmark from short-term market movements to meaningful, multi-decade outcomes. It's particularly useful when clients are anxious about recent volatility or questioning whether their strategy is working.

---

### [The Stock Markets](https://www.humansundermanagement.com/premium-visuals)

This infographic contrasts "unimportant" monthly returns with "important" 30-year returns, reinforcing that the real scoreboard is achieving life goals — not beating an arbitrary index. It works well with nervous investors who check their portfolios too frequently.
```

## Sonnet 5 (latest)

*3 items · 382 output tokens · 7.1s · $0.1906 · stop_reason: `end_turn`*

```markdown
Here's what we found for "scoreboard" — a great match for helping clients think about progress in a healthier, more personal way.

## Client Articles

### [Choosing the Right Scoreboard](https://www.humansundermanagement.com/choosing-scoreboard)

This is a direct match for your search — it tackles the behavioural trap of judging financial progress against the wrong benchmark, whether that's a market index or a friend's returns. It reframes success around five personal questions rather than external comparisons, making it ideal before annual reviews.

### [The 30-Year Scorecard](https://www.humansundermanagement.com/the-30-year-scorecard)

This piece isn't in the list above under articles but is closely related in spirit — actually, note: this is an infographic, see below.

---

## Infographics

### [The 30-Year Scorecard](https://www.humansundermanagement.com/premium-visuals)

This visual comparison tool uses a "scorecard" format to show the long-term power of equity investing versus cash and inflation. It's perfect for anxious clients tempted to abandon their strategy during short-term volatility, reinforcing why patience over decades wins out.
```

## Haiku 4.5 (latest)

*1 items · 180 output tokens · 4.3s · $0.0625 · stop_reason: `end_turn`*

```markdown
I'm sorry, but I'm unable to find any content items in the provided list that match a search for "scoreboard."

The closest match I can identify is:

### [Choosing the Right Scoreboard](https://www.humansundermanagement.com/choosing-scoreboard)

This article helps advisers address the behavioural trap of using the wrong benchmark to judge financial progress—whether that's comparing to market indices or to friends' returns. It reframes success around five personal questions about goals, savings rate, income longevity, avoiding mistakes, and whether money is funding a deliberately chosen life.

---

If you're looking for content about something more specific—such as performance tracking, benchmarking, portfolio monitoring, or measuring financial progress—I'd be happy to help if you can rephrase your search query.
```

---

# Query: `explaining risk`

## Sonnet 4.6 (incumbent)

*15 items · 1200 output tokens · 28.4s · $0.2027 · stop_reason: `max_tokens` — **response cut off mid-sentence***

```markdown
Here's what we have on explaining risk to clients — covering infographics, adviser documents, articles, and more.

---

## Adviser Documents

### [A Different Conversation About Risk](https://www.humansundermanagement.com/risk-conversation)

This document moves beyond tick-box risk profiling to help advisers have meaningful conversations about how clients actually behave when markets fall. It's ideal for onboarding or when existing clients question their investment approach during volatility.

---

### [How Long Should I Invest This Money For?](https://www.humansundermanagement.com/how-long-should-i-invest-this-money-for)

Helps advisers explain investment timeframes and set realistic expectations around market volatility, using real calendar year returns to make the concept tangible. Perfect when clients ask about commitment periods or are nervous about locking money away.

---

### [Back to First Principles](https://www.humansundermanagement.com/first-principles)

A letter template that resets client thinking around five core investment principles, including why market declines are inevitable and why asset allocation drives returns. Useful when clients are wavering or getting distracted by market noise.

---

## Client Articles

### [Your Most Important Investment Decision](https://www.humansundermanagement.com/your-most-important-investment-decision)

Explains the fundamental choice between owning businesses (equities) and lending to them (bonds), reframing risk as the "silent dragon" of inflation rather than short-term volatility. Ideal for clients overwhelmed by complexity who need to understand what really drives returns.

---

### [The Mirage of Certainty](https://www.humansundermanagement.com/the-mirage-of-certainty)

Addresses clients who delay decisions waiting for certainty that will never arrive, reframing uncertainty as permanent rather than exceptional. Particularly effective for nervous investors who intellectually understand long-term investing but struggle to act.

---

### [Two Steps Forward, One Step Back](https://www.humansundermanagement.com/two-steps-forward-one-step-back)

Uses the "bear in the wild" analogy to help clients understand that volatility is normal and expected, not a reason to abandon their strategy. Best deployed when clients are panicking about market declines or media headlines.

---

### [Volatility: The Investor's Forgotten Friend](https://www.humansundermanagement.com/volatility-forgotten-friend)

Reframes volatility as the "price of admission" for long-term returns, emphasising that declines create opportunities for ongoing savers. Useful for clients who have become complacent after calm markets and need preparing for inevitable corrections.

---

### [Do You Deserve the Returns?](https://www.humansundermanagement.com/deserve-returns)

Tackles the "behaviour gap" — why investors consistently underperform the funds they're invested in — and outlines the three mindsets needed to earn long-term returns. Particularly effective for clients experiencing their first major market correction.

---

### [The Permanent Challenge of Temporary Declines](https://www.humansundermanagement.com/the-permanent-challenge-of-temporary-declines)

Explains that market corrections happen on average annually and that volatility is the reason for returns, not despite them. Invaluable when clients panic about portfolio losses or need perspective after unusually calm periods.

---

### [Good Investing Should Be Boring](https://www.humansundermanagement.com/good-investing-should-be-boring)

Reinforces that successful investing comes down to getting asset allocation right and maintaining disciplined behaviour — everything else is noise. Ideal for clients who are restless with their portfolio or tempted by more "exciting" alternatives.

---

## Infographics

### [Informed Risk Scale](https://www.humansundermanagement.com/premium-visuals)

Reframes the risk conversation by contrasting "uninformed risk" (where cash appears safest) with "informed risk" (revealing cash faces severe inflation erosion). Powerful for clients who believe cash is safe and equities are dangerous.

---

### [Risk Is...](https://www.humansundermanagement.com/premium-visuals)

Moves beyond volatility to show clients that the biggest risks often come from their own behaviour — such as moving to cash during temporary declines or following news headlines rather than a financial plan. The "unique to you" framing provides a natural conversation starter for personalised risk discussions.

---

### [Which Portfolio Is Risky](https://www.humansundermanagement.com/premium-visuals)

Challenges the assumption that a smoother, bond-heavy portfolio is "safer" by showing how the equity-heavy portfolio significantly outperforms over time. Particularly effective for pre-retirees who mistakenly believe they should abandon equities as retirement approaches.

---

### [Annual Declines](https://www.humansundermanagement.com/premium-visuals)

Shows that significant intra-year market declines are as regular as birthdays, yet markets have historically delivered positive annual returns in most years. Ideal for normalising volatility with anxious clients and preventing emotional selling decisions.

---

### [The Cost of Certainty](https://www.humansund
```

## Sonnet 5 (latest)

*9 items · 1041 output tokens · 13.2s · $0.1972 · stop_reason: `end_turn`*

```markdown
Here's what we have on explaining risk to clients in a clearer, more meaningful way.

## Adviser Documents

### [A Different Conversation About Risk](https://www.humansundermanagement.com/risk-conversation)
This is the standout match for your search — a document specifically designed to move risk conversations beyond tick-box questionnaires and towards genuine understanding of client behaviour. It reframes risk as the gap between client expectations and lived experience, rather than a simple number.

### [How Long Should I Invest This Money For?](https://www.humansundermanagement.com/how-long-should-i-invest-this-money-for)
Useful for explaining how timeframe shapes appropriate risk-taking, using real calendar year returns to make volatility tangible rather than abstract. Ideal for clients unsure about commitment periods or nervous about short-term declines.

### [Why Invest if Cash Is Giving a Return?](https://www.humansundermanagement.com/whyinvestifcashgivesreturn)
Helps explain the risk of holding cash long-term versus the volatility risk of equities, reframing "safety" as something that depends on time horizon and purpose. Particularly useful when clients confuse cash certainty with genuine safety.

## PDF Guides

### [Investment Policy Statement](http://humansundermanagement.com/videos-guides-sequences#guides)
Breaks investment risk down into four digestible types — capital loss, inflation, volatility, and "low returns" risk — giving advisers a clear framework for productive risk conversations from the very first meeting.

### [What We Believe](http://humansundermanagement.com/videos-guides-sequences#guides)
A foundational philosophy document that helps explain the "why" behind an adviser's approach to risk, particularly useful for establishing the Goals > Plan > Portfolio hierarchy with new clients.

## Infographics

### [Informed Risk Scale](https://www.humansundermanagement.com/premium-visuals)
Directly tackles the "explaining risk" challenge by contrasting "uninformed risk" (where cash looks safest) with "informed risk" (where cash actually carries the greatest inflation risk), helping clients understand that risk isn't one-dimensional.

### [Risk Is...](https://www.humansundermanagement.com/premium-visuals)
Reframes risk away from market volatility and towards real-life consequences — behavioural mistakes, inflation, and going it alone — making it an excellent conversation starter for personalised risk discussions.

### [Which Portfolio Is Risky](https://www.humansundermanagement.com/premium-visuals)
Challenges the assumption that volatility equals risk by comparing long-term outcomes of equity-heavy versus "safer" balanced portfolios, showing that the real risk is often failing to keep pace with inflation.

### [Financial Health Prescription](https://www.humansundermanagement.com/premium-visuals)
Uses a medical prescription format to make risk and financial planning feel like manageable, ongoing care rather than an intimidating one-off decision — useful for anxious or uncertainty-averse clients.
```

## Haiku 4.5 (latest)

*16 items · 1200 output tokens · 15.7s · $0.0676 · stop_reason: `max_tokens` — **response cut off mid-sentence***

```markdown
Here's what we have on explaining risk to your clients.

## Adviser Documents

### [10% Decline Communication](https://www.humansundermanagement.com/10-decline)

This template helps you fulfil regulatory obligations whilst reframing market declines positively. It transforms a potentially panic-inducing communication into a reassuring, educational moment that emphasises discipline and patience during temporary declines.

### [Our First 12 Months](https://www.humansundermanagement.com/our-first-12-months)

Perfect for new client onboarding, this document addresses the behavioural challenge of "mental accounting" where clients fixate on their portfolio value at the start of the relationship. It normalises market volatility as a feature, not a bug, and reinforces discipline as a core investment principle.

### [Why We Focus on Total Returns](https://www.humansundermanagement.com/why-we-focus-on-total-returns)

This tackles the common client fixation on dividend-paying investments over total returns. It's ideal when clients question why you're not prioritising high-dividend stocks or when they've been influenced by "income-focused" marketing from other providers.

### [A Different Conversation About Risk](https://www.humansundermanagement.com/risk-conversation)

This document moves beyond tick-box risk profiling to have meaningful conversations about investment behaviour. It addresses the disconnect between what clients think they can handle and how they actually react when markets fall.

### [How Long Should I Invest This Money For?](https://www.humansundermanagement.com/how-long-should-i-invest-this-money-for)

Perfect for explaining investment timeframes and managing client expectations around market volatility. The real calendar year returns provide concrete examples that make volatility tangible rather than theoretical.

### [Why We Never Time The Markets](https://www.humansundermanagement.com/why-we-never-time-the-markets)

This addresses the universal investor temptation to "outsmart" the markets by timing entries and exits. It's ideal when clients call during market corrections asking to sell, or when they want to wait for "the right time" to invest.

### [Stop Logging Into Your Investment Account](https://www.humansundermanagement.com/stop-logging-account)

This letter addresses the common behavioural trap of frequent portfolio monitoring that leads to emotional decision-making. It helps advisers explain why regular account checking is counterproductive and reframes market fluctuations as the "price of admission."

### [Why Is My Portfolio Not Beating The FTSE 100?](https://www.humansundermanagement.com/portfolio-ftse)

This template addresses one of the most common client concerns: "Why isn't my portfolio beating the FTSE 100?" It tackles the behavioural challenge of short-term thinking and inappropriate benchmarking.

### [Only One Adviser](https://www.humansundermanagement.com/one-adviser)

This template helps advisers address the common situation where prospective clients want to divide their investments between multiple advisers. It uses a military analogy to illustrate why divided control undermines effective financial planning.

### [How Do I Take Profits?](https://www.humansundermanagement.com/how-do-i-take-profits)

This template helps advisers respond when clients want to withdraw investment growth while leaving their original capital invested. It addresses the behavioural bias of treating gains as "house money" that needs to be protected differently from original capital.

### [Why Invest if Cash Is Giving a Return?](https://www.humansundermanagement.com/whyinvestifcashgivesreturn)

This letter addresses the common client concern about why they should invest in "risky" assets when cash is paying attractive rates. It tackles the behavioural challenge of focusing on current cash yields whilst ignoring inflation's erosive effects.

### [Yellow & Red Cards That Could End Our Professional Relationship](https://www.humansundermanagement.com/yellow-red-cards)

This boundary-setting document helps advisers manage challenging client relationships by clearly outlining unacceptable behaviours. It addresses the common problem of clients who undermine their own financial success through poor behaviour or lack of trust.

### [What's The Money For?](https://www.humansundermanagement.com/whats-the-money-for)

This letter addresses one of the most common behavioural challenges with successful retirees: clients who've become so good at saving that they can't give themselves permission to spend, even when they have more than enough.

### [It's Time To Nudge Up Your Contributions](https://www.humansundermanagement.com/nedge-contributions)

This is a direct, no-nonsense template for advisers to address clients who haven't increased their pension or investment contributions in line with inflation. It tackles the behavioural tendency to "set and forget" contributions.

### [Missing Out on the Beasts](https://www.humansundermanagement.com/missing-the-beasts)

This template addresses the classic "I should have bought NVIDIA" conversation that advisers face when clients see spectacular individual stock performance in the media. It demonstrates how diversified global equity funds automatically capture the "beasts."

### [All Investments on One Platform](https://www.
```

---

# Analysis and recommendation

## Headline: this test found a live production bug, not a model problem

**Sonnet 4.6 hit the `max_tokens: 1200` ceiling on 4 of the 5 most recent real
member searches.** Those responses are cut off mid-sentence, and in three cases
mid-hyperlink:

```
...the path to long-term wealth is rarely smooth or predictable.

---

### [Choose Your Outcome          <-- ends here. Broken markdown link.
```

Members searching your library today are receiving truncated answers with a
dangling, unclickable heading at the bottom. This is happening now, on the
current model, and has nothing to do with which model you pick.

**The cause is the system prompt, not the token limit.** `spec.md` specifies
"Claude selects the best 3–5 matches". The system prompt in `src/lib/search.ts`
never states that limit — it says only "select the most relevant items". So
Sonnet obliges and returns **15 to 19 items**, blows through 1,200 tokens
around item 12, and stops mid-word.

Raising `max_tokens` alone would make the answers complete but even longer.
The fix is to cap the count in the prompt, which makes them complete *and*
useful, and reduces output tokens at the same time.

## Model-by-model

### Haiku 4.5 — do not switch

The saving is real (a third of the price) but the failure mode is unacceptable
for this library. On 3 of 5 queries Haiku returned nothing usable, and on
`cashflow` it stated plainly:

> "I'm afraid none of the items in our current library are specifically focused
> on cashflow as a primary topic."

That is **false**. Sonnet 5, given the identical 216 items, found:

- *Making The Transition from Saving to Spending* — the psychological shift from accumulation to drawing income
- *You Stop. Your Money Shouldn't.* — structuring a retirement portfolio, keeping 1–3 years of expenses in cash
- *Know Your Numbers* — six key metrics including income shortfall

Those are exactly what an adviser searching "cashflow" wants. Haiku's answer
sends that adviser away believing HUM Premium has no cashflow content.

This matters disproportionately because **46% of all real searches are one or
two words** (`cashflow`, `scoreboard`, `gold`, `door`, `sunset`). Haiku is
weakest precisely where your members are heaviest. It is also poorly
calibrated in both directions: on the two queries it did answer, it returned
16 items and truncated.

A false "we have nothing" is the most expensive answer this tool can give. It
costs a member's trust in the library, which is worth considerably more than
the $4.82 a month Haiku would save.

### Sonnet 5 — better search, wrong trade

Genuinely the best *quality* result in this test: the most sensible number of
items (3–13, averaging 8.8), only one truncation, and **2.4x faster** than
Sonnet 4.6 (11.9s vs 26.5s average). On latency alone it is a real member-experience upgrade.

But two things rule it out for now:

1. **It rejects `temperature: 0` with an HTTP 400.** Verified live:
   `` `temperature` is deprecated for this model. `` Your spec commits to
   `temperature: 0` on all calls for deterministic, grounded output. Adopting
   Sonnet 5 means abandoning that guarantee — a real change to the
   anti-hallucination posture, not a config tweak.
2. **It costs more.** Its tokenizer turns the same prompt into 93,408 tokens
   instead of 61,571 (+52%). Today's near-parity is intro pricing that ends
   **31 August 2026**. From 1 September the same search costs **$0.29**, up
   45% from Sonnet 4.6 — about **$10.40/month**, not $7.

### Sonnet 4.6 — stay here

It found good content on every query, including the vague one-word ones. Its
only failures are over-delivery and truncation, both of which are prompt bugs
you own and can fix in minutes.

## What I would do, in order

1. **Cap the recommendation count in the system prompt** (3–5, per `spec.md`)
   and raise `max_tokens` to ~2000 as headroom. Fixes truncation for every
   member, today. No model change, no cost increase — output tokens should
   *fall*.
2. **Stay on Sonnet 4.6.** After the keepalive fix your bill is ~$7/month for
   search that reliably finds the right content across a six-year archive.
   That is good value, and the two ways to make it cheaper both degrade it.
3. **Re-run this comparison after the prompt fix.** The current test is
   confounded — every model was fighting a broken output budget. A fair
   comparison at 3–5 items may change the Haiku picture, though I doubt it
   fixes the false negatives.
4. **Revisit only if volume grows.** At ~36 searches/month this is an $87/year
   question. Past ~250/month it becomes worth real engineering, and the lever
   to reach for then is stage-1 vector retrieval, not a weaker model.

## The honest summary

You asked how to spend less. The keepalive fix already removed $5.43/month for
nothing in return, and that was the genuinely wasteful spend. The remaining
~$7/month is buying something real. The problem worth your attention right now
is not that search costs $7 — it is that it has been silently truncating
answers to your members.
