# GraphCareers - AI Resume Copilot Frontend Redesign

## Objective

Redesign ONLY the post-generation experience.

The current Platform Resume Optimization flow works perfectly.

DO NOT redesign:

- Platform Selection
- Resume Generation
- Polling
- Download APIs

Keep everything exactly the same until the optimization finishes.

Once the backend returns:

status = completed

transform the result page into a premium AI Resume Copilot Workspace.

The inspiration should be a combination of:

- ChatGPT
- Cursor
- Linear
- Claude
- Vercel

NOT a traditional ATS checker.

---

# Existing Flow (KEEP EXACTLY)

Platform Page

↓

User clicks

Naukri

LinkedIn

Instahyre

Foundit

↓

POST

/api/resume-intelligence/:platform/optimize

↓

Poll

GET

/api/resume-intelligence/:platform/status

↓

When status == completed

↓

Navigate to

AI Resume Copilot Workspace

Nothing changes before this point.

---

# Workspace Layout

The page should have TWO primary columns.

------------------------------------------------------------

LEFT (40%)

AI Resume Copilot

RIGHT (60%)

Resume Workspace

------------------------------------------------------------

The Resume Preview should occupy most of the page.

The AI should always stay visible.

Do NOT create multiple pages.

Everything happens inside this workspace.

---

#########################################################

LEFT PANEL

#########################################################

This should feel exactly like ChatGPT.

When the workspace opens, don't show an empty chat.

Instead initialize the conversation using backend data.

Example

--------------------------------------------------

Your Naukri Resume is ready!

ATS improved

45 → 85

I analyzed

✓ 100 top matching jobs

✓ Market demand

✓ Platform ATS preferences

✓ Missing keywords

✓ Resume structure

I found several additional improvements.

Let's make this resume even stronger.

--------------------------------------------------

Immediately below

Quick Actions

Improve ATS to 90+

Rewrite Summary

Make Bullet Points Stronger

Improve Projects

Reduce to One Page

Improve Leadership

Explain ATS Score

Explain Missing Skills

Tailor For Job Description

Add Missing Keywords

Improve Quantification

These buttons simply send messages to

POST

/api/resume/copilot/:versionId/chat

The user can also type freely.

Example

Rewrite my GraphCareers project.

Improve my summary.

Tailor this for Amazon.

Reduce this to one page.

Explain why AWS is missing.

Everything should happen through the existing Copilot API.

No frontend logic.

---

#########################################################

RIGHT PANEL

#########################################################

The right panel contains

Top

Resume Preview

Bottom

Insights Dashboard

---

Top

Resume Preview

Render

optimizedResume

as an interactive resume.

DO NOT embed the PDF.

The resume should render from JSON.

Every section should support hover actions.

Summary

Rewrite

Improve

Shorten

Experience

Improve

Quantify

Rewrite

Projects

Improve

ATS

Skills

Organize

Categorize

Merge

Every action should use

POST

/api/resume/edit/:versionId

to create a new version.

After success

reload the active version.

---

Bottom

Insights Dashboard

Instead of only ATS.

Create multiple cards.

#########################################################

CARD 1

ATS

#########################################################

Use

atsScores.before

atsScores.after

atsScores.improvement

Show

Circular Progress

Before

After

Improvement

Breakdown

---

#########################################################

CARD 2

Keywords

#########################################################

Use

keywords

Matched

Added

Missing

Each keyword should be color coded.

Green

Matched

Blue

Added

Red

Missing

Clicking a missing keyword should open

Copilot

with

"Help me naturally include AWS in my resume."

---

#########################################################

CARD 3

Suggested Skills

#########################################################

Use

skillRecommendations

Each skill becomes

beautiful card

Skill

Importance

Percentage

Learn Message

Example

AWS

Critical

80%

Required by 80% of Backend jobs.

Button

Add to Resume

Clicking

Add to Resume

calls

POST

/api/resume/edit/:versionId

using the existing editing backend.

After editing

refresh

Resume

ATS

Suggestions

Chat Context

---

#########################################################

CARD 4

Platform Insights

#########################################################

Use

platformInsights

Display

Top Skills

Experience Distribution

Work Mode Distribution

Beautiful charts.

---

#########################################################

CARD 5

AI Recommendations

#########################################################

Use

recommendations

Example

Improve quantification

Estimated ATS Gain

Apply

Rewrite Summary

Apply

Mention Distributed Systems

Apply

Clicking

Apply

uses

Resume Editing API

---

#########################################################

TOP TOOLBAR

#########################################################

Keep minimal.

Platform

Download PDF

Download DOCX

Tailor to Job Description

Share

Credits

Profile

---

#########################################################

TAILOR TO JOB DESCRIPTION

#########################################################

When the user clicks

Tailor To JD

Open a modal.

Company

Job Title

Paste Job Description

Optimize

Calls

POST

/api/resume/jd-optimize/:versionId

When completed

Create

new version

Automatically switch

Resume Preview

Chat Context

ATS

Suggestions

Everything should update.

---

#########################################################

VERSION MANAGEMENT

#########################################################

Every edit

Every Copilot action

Every JD optimization

creates a new version.

Use

Workspace APIs

GET

/api/resume-workspace

GET

/api/resume-workspace/versions/:versionId

POST

/api/resume-workspace/versions/:versionId/activate

GET

/api/resume-workspace/events

GET

/api/resume-workspace/compare

The version selector should be subtle.

Don't dominate the UI.

Users mainly work on the active version.

---

#########################################################

AI ACTIVITY

#########################################################

Whenever backend is processing

show streaming.

Planner analyzing...

Resume Intelligence loaded...

Generating Optimization...

Updating ATS...

Creating Version...

Generating Suggestions...

Ready.

Never display

Loading...

---

#########################################################

ANIMATIONS

#########################################################

Use

Framer Motion

Glassmorphism

Dark Theme

Smooth transitions

Skeleton loading

Optimistic UI

Hovered resume sections

Animated ATS progress

Streaming messages

Everything should feel alive.

---

#########################################################

TECH STACK

#########################################################

Next.js

TailwindCSS

Shadcn UI

React Query

Framer Motion

React Hook Form

Zustand (UI state only)

No Redux.

---

#########################################################

IMPORTANT

#########################################################

The AI Copilot is now the heart of the product.

The Resume Preview is the source of truth.

Everything else revolves around these two.

Layout

--------------------------------------------------------

LEFT

AI Resume Copilot

RIGHT

Resume Preview

Bottom

ATS

Keywords

Suggested Skills

Recommendations

Platform Insights

--------------------------------------------------------

This should feel like talking to an AI Resume Engineer while watching your resume improve live.

Do NOT redesign the generation flow.

Only redesign everything after the optimization completes.

The frontend must consume ONLY the existing backend APIs.