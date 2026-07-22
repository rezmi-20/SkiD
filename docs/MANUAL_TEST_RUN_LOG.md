# Manual Test Run Log

Date: 2026-07-22

Status legend:

- PASS: works as expected
- FAIL: bug or broken behavior found
- BLOCKED: cannot test yet
- PARTIAL: mostly works, with notes

## Test 1 - Landing Page

Status: TODO
Notes:

- Home page:PASS
- Logo:PASS
- Navigation:PASS
- Login button:PASS
- Client registration:PASS
- Worker registration:PASS
- Broken links: no broken link

## Test 2 - Login

Status: TODO
Notes:

- Client login:PASS
- Worker login:PASS
- Admin login:PASS
- Client manual `/worker/dashboard` access:
- Worker/admin wrong dashboard access:
  role based acees works but in client it instread of dashboard it it take directly here /client/search
  sign with google sign in with apple and forget password doesn't do anything

## Test 3 - Client Dashboard

Status: TODO
Notes:

- Dashboard: it very visible pass
- Profile: it is visible in side bar but not intercative not clicable
- Notifications: as function it do all its function but in the ui instead of the icon the name of icons in large apper
- Search: all search filter works but as real time location I don't know
- Contracts: I can see previous contracts I cant download them I will test this with new job and contract
- Console/API errors:page.tsx:49
  GET http://localhost:3000/api/auth/me 401 (Unauthorized)
  LoginPage.useEffect.checkSession @ page.tsx:49
  LoginPage.useEffect @ page.tsx:64
  "use client"
  Promise.all @ VM1076 <anonymous>:1
  Promise.all @ VM1076 <anonymous>:1
  Show 221 more frames
  page.tsx:49
  GET http://localhost:3000/api/auth/me 401 (Unauthorized)
  LoginPage.useEffect.checkSession @ page.tsx:49
  LoginPage.useEffect @ page.tsx:64
  "use client"
  Promise.all @ VM1076 <anonymous>:1
  Promise.all @ VM1076 <anonymous>:1
  Show 245 more frame

Request URL:
http://localhost:3000/api/auth/me
Request Method:
GET
Status Code:
401 Unauthorized
Remote Address:
[::1]:3000
Referrer Policy:
strict-origin-when-cross-origin
accept:
_/_
accept-encoding:
gzip, deflate, br, zstd
accept-language:
en-US,en;q=0.9,uk-UA;q=0.8,uk;q=0.7,ms-MY;q=0.6,ms;q=0.5,ar-EG;q=0.4,ar;q=0.3,am-ET;q=0.2,am;q=0.1,ar-MA;q=0.1,ar-LY;q=0.1,ar-DZ;q=0.1
connection:
keep-alive
cookie:
AMP_MKTG_ae7b5071dc=JTdCJTIycmVmZXJyZXIlMjIlM0ElMjJodHRwJTNBJTJGJTJGbG9jYWxob3N0JTNBMzAwMCUyRiUyMiUyQyUyMnJlZmVycmluZ19kb21haW4lMjIlM0ElMjJsb2NhbGhvc3QlM0EzMDAwJTIyJTdE; AMP_ae7b5071dc=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjI0YjI0NGZiOC1jMTVlLTQ3ZjEtODk3Yy1iMDg3NzYyNTU0ZjklMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzg0NjM4MzUwMzUzJTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc4NDcwNTU1Njc4NyU3RA==
dnt:
1
host:
localhost:3000
referer:
http://localhost:3000/login
sec-ch-ua:
"Not?A_Brand";v="99", "Chromium";v="130"
sec-ch-ua-mobile:
?1
sec-ch-ua-platform:
"Android"
sec-fetch-dest:
empty
sec-fetch-mode:
cors
sec-fetch-site:
same-origin
sec-gpc:
1
user-agent:
Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36

this thing keeps happening

## Test 4 - Worker Dashboard

Status: TODO
Notes:

- Dashboard: pass
- Jobs: pass it show previous job but same notification ui problem
- Earnings: it is wonder full but export statements doesn't work
- Contracts: same ui problem in notification in creating pin this ui problem exists in many place so check for this problem
- Messages: works pretty well but it doesn't show if the message is unread or read it is not priority now but I cant send video in chat it is least priority
  and check message button in notification page http://localhost:3000/messages 404

when worker receives message their is no popup notification although he is online it doe not appear in notification page the time stamp for chat message is not correct it say before 3 hour ago recent message

## Test 5 - Unverified Worker

Status: TODO
Notes:

- Restricted jobs:pass
- Verification bypass:pass
- Pending verification page:unable to test

## Test 6 - Create a Job

Status: TODO
Notes:

- Job creation: pass
- Client dashboard visibility: it doent show anywhere the I created and pending for the worker response
- Worker/search visibility: partially works I have to test this in diredawa now I am in addis ababa

## Test 7 - Worker Accepts Job

Status: TODO
Notes:

- Job found: it appear notification and takes me to here /worker/jobs I cant see the detail of work here the button does not work /worker/gigs here doesn't appear it should appear in both
- Accept/apply result: pass it appear in notification and in contract as draft

## Test 8 - Client Chooses Worker

Status: TODO
Notes:

- Applicants:worker doesn't apply for job in my system client search find them in the system and approach them
- Worker selection:not in my system
- Contract creation:going good see the detail below

## Test 9 - Contract

Status: TODO
Notes:

- Job info:
- Worker info:i cant see it in the draft
- Client info: cant see it in the draft
- Terms: pass
- Accept terms:pass
- Reject terms: pass it only appears in notification
- Resubmit:pass it only appear in notification
  in this stage what I noticed is the system when something happens like resubmit accept reject happens in other party the other party page it doe not updated I have to refreash the the party page for the update

## Test 10 - Contract Signatures

Status: TODO
Notes:

- Client signature:pass
- Worker signature:pass
- Duplicate signature prevention: I didnt test
  a strict rule has not been applied here how does unverified client can sign contract in the first place this is strict rule when creating the pin for the unverified client it doesn't even asked him to verify its identity for contract to submit his Fayda

## Test 11 - Completion Workflow

Status: TODO
Notes:

- Worker completion request:pass resubmission details didn't appear here
- Client receives request:pass
- Client rejection:didnt test
- Worker resubmission:it supposnt to work this way
- Client approval:pass
- Payment pending status:
  same promblems as test 9 major thing appear in notification only example when client accept work or sign contract I have to go to notification and get redirected for what to do next from there this bad user expreance also for first time users

## Test 12 - Payment

Status: TODO
Notes:

- Amount:pass
- Job:pass
- Worker:pass
- Sandbox/simulated payment:pass
- Paid status:this part I tasted this before and works very well but in error handling this happened today when I was testing in local host I didn't started the tunnel cloudfare so payment was successful but chapa page become un available because of tunnel so I started tunnel in terminal and it shows the payment was unsuccessfull I tried to pay again but in error hanlind this payment history shows as paid but when I am back to payment page it shows still unpaid

and http://localhost:3000/client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e this job history was what this happened I did make you to mark it as paid you mark it as paid reverising some logic successful payment url should be https://checkout.chapa.co/checkout/test-payment-receipt/APooYBPD4kbRt like this because you did it in manual it goes to 404 page because incoreect urlhttps://checkout.chapa.co/checkout/test-payment-receipt/MANUAL-TEST-PAID-ee843af0

I am sure this less to happens in deployed version because there no need for tunnelling there but it is important to update the error our handling method

## Test 13 - Receipt

Status: TODO
Notes:

- Amount:
- Reference:
- Job:
- Date:
- Cross-account access:

this is chapa platform part so it works very well

## Test 14 - Rating

Status: TODO
Notes:

- Client rates worker:
- Worker rates client:
- Duplicate prevention:
  nothing works it did take him too long to even to show rating http://localhost:3000/worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e this briefly maybe 1 second before going back to http://localhost:3000/worker/contracts here this part relly need complete recheck or redo

## Test 15 - Notifications

Status: TODO
Notes:

- Job assigned:
- Contract created:
- Terms accepted/rejected:
- Completion requested:
- Payment completed:
- Rating completed:

every this is here is pass

what I didn't like is every major things appear only here which reduse ux
what other system flow is bad in ux view like for example when I wanted to pay I go to contract click pay button the system should refreash it self like when worker notify me as work completed I should go by my self to payment tab and see pending payment and initiate starting to pay there while complete payment button to appear in in contract is good to

## Test 16 - Admin

Status: TODO
Notes:

- Dashboard:pass
- User management:pass
- Worker verification:pass
- Reports:pass show very good recent activity record I have to able to serch reports events maybe old the main report here is all about payment admin cant view receipts here when I click some receipt I mean it download system generated receipt not chapas it show see the chapa not system receipt like client and worker
- Contracts: wonderfull pass the contract is the same as worker and client sees admin contract pdf should be the orginal that contains the full information for court evidence
- Payments: this page is 100 percent similar with report report page should include more like contract job and pdf downloadable reports
  as super admin and other admin this priority should be different so we will discus about this
- Worker verification update:pass

## Test 17 - Security

Status: TODO
Notes:

- Someone else's client contract:
- Someone else's payment job:
- Someone else's worker contract:
- Receipt API/manual URL:
  make it clear how to test this

## Test 18 - Browser Console

Status: TODO
Notes:

- Red errors: some appears but I didn't record them
- Failed API requests: attached it below
- Infinite loading: this is constant page to page loading take over 3 seconds
- React warnings: attached below at the end

## Test 19 - Mobile View

Status: TODO
Notes:

- iPhone 12:
- iPad:
- Desktop:
- Navigation:
- Forms:
- Buttons/cards/tables:
  mostly tested in pixel 7 even in pixel 7 or other it has inconsistencies like all page are great in desktop view and one can be great in pixel 7 view bad at other view some pages are bad at all in mobile view like in admin portal it example even though admin mostly use desktop in mobile pixel 7 nav bar dissabir in ipad nav bar appears

mobile view we have to review it carefully in worker and client interface like what I noticed profile appear it side nav bar in desktop view but not at bootom nav bar in mobile that is good it decrease the item on bottom nav bar but it should appare at above nav bar with notification and light dark toggle switch I mean a mobile user cant access it profile page language switch also disappear in mobile view there are many un wired things in profile
like Account Details
Active
Display Name
remedan_ds
Account Created
March 20, 2026
Last Login
22 Jul 2026
Membership Status
Premium Member
Account Verification
Verified
Language Preference
Amharic
Time Zone
GMT+3 (East Africa Time)
displaying incorrect data unverified account as verified

another
Security Settings
Password Last Changed
July 15, 2026 false data I didn't change password
Two-Factor Authentication
Enabled false data system does not have this feature we should add it
Security Questions Set
Yes false data system does not have this feature we should add it for account recovery
Login Notifications what even this
Enabled
Connected Devices
2 Devices is this really working is it real data
Recent Account Activity
No Suspicious Activity Detected

## Test 20 - Final Build

Status: TODO
Commands:

- `npm run db:verify:core`
- `npm run db:check:schema`
- `npm run check:workflow`
- `npm run check:e2e:workflow`
- `npm run check:auth`
- `npm run check:payment`
- `npm run build`
  Notes:
  PS C:\Users\Remedan\Documents\Final year project Implementation\SkiD> npm run db:verify:core
  > > npm run db:check:schema  
  > > npm run check:workflow  
  > > npm run check:e2e:workflow  
  > > npm run check:auth  
  > > npm run check:payment  
  > > npm run build

> db:verify:core
> node scripts/verify-core-mvp-database.mjs

◇ injected env (14) from .env.local // tip: ⌘ suppress logs { quiet: true }
PASS jobs.location
PASS jobs.requested_date
PASS jobs.rejection_reason
PASS jobs.completion_rejection_reason
PASS worker_profiles.verification_reason
PASS worker_profiles.verified_by
PASS worker_profiles.verified_at
PASS contracts.terms_status
PASS contracts.terms_submitted_at
PASS contracts.terms_submitted_by
PASS contracts.terms_accepted_at
PASS contracts.terms_accepted_by
PASS contracts.terms_rejected_at
PASS contracts.terms_rejected_by
PASS contracts.terms_rejection_reason
PASS payments.chapa_reference
PASS job_status:completion_requested
PASS job_status:payment_pending
PASS job_status:paid
PASS job_status:closed
PASS job_client_idx
PASS job_worker_idx
PASS rating_job_idx
PASS payment_job_idx
PASS payment_status_idx
PASS contract_job_unique_idx
PASS contract_signature_contract_user_unique_idx
PASS rating_job_rater_rated_unique_idx
PASS payment_chapa_ref_unique_idx
PASS payment_released_job_unique_idx

> db:check:schema
> node scripts/check-schema-consistency.mjs

PASS jobs.location
PASS jobs.requested_date
PASS jobs.rejection_reason
PASS jobs.completion_rejection_reason
PASS worker_profiles.verification_reason
PASS worker_profiles.verified_by
PASS worker_profiles.verified_at
PASS contracts.terms_status
PASS contracts.terms_submitted_at
PASS contracts.terms_submitted_by
PASS contracts.terms_accepted_at
PASS contracts.terms_accepted_by
PASS contracts.terms_rejected_at
PASS contracts.terms_rejected_by
PASS contracts.terms_rejection_reason
PASS payments.chapa_reference
PASS job_status:completion_requested
PASS job_status:payment_pending
PASS job_status:paid
PASS job_status:closed
PASS job_client_idx
PASS job_worker_idx
PASS rating_job_idx
PASS payment_job_idx
PASS payment_status_idx
PASS contract_job_unique_idx
PASS contract_signature_contract_user_unique_idx
PASS rating_job_rater_rated_unique_idx
PASS payment_chapa_ref_unique_idx
PASS payment_released_job_unique_idx
PASS contracts.job_id foreign key
PASS contract_signatures.contract_id foreign key
PASS contract_signatures.user_id foreign key
PASS ratings.job_id foreign key
PASS payments.job_id foreign key
PASS worker_profiles.verified_by foreign key

> check:workflow
> node scripts/verify-core-workflow-rules.mjs

Core workflow rule check passed.

> check:e2e:workflow
> node scripts/verify-e2e-mvp-workflow.mjs

PASS Verified worker can discover the job
PASS Unverified worker cannot discover restricted work
PASS Illegal terminal transitions are rejected
PASS Contract is created
PASS Duplicate contract for the same job is rejected
PASS Authorized parties can view the contract
PASS Unrelated user cannot view or change the contract
PASS Contract terms are submitted
PASS Counterparty accepts terms
PASS Required signatures are recorded
PASS Duplicate signature for the same contract/user is rejected
PASS Job progresses into active/in-progress state
PASS Worker requests completion
PASS Client can reject completion with a reason
PASS Worker can request completion again
PASS Client confirms completion
PASS Job moves to payment_pending
PASS Payment amount comes only from trusted server-side contract/job data
PASS A simulated verified payment moves the job to paid
PASS Duplicate successful/released payment is rejected
PASS Both parties can rate once in each permitted direction
PASS Duplicate ratings are rejected
PASS Unrelated users cannot rate the job
PASS Job closes according to the implemented closure rule
PASS Required notifications are created at important transitions: validated by workflow notifications in the implementation
PASS Illegal transitions are rejected: validated via the workflow state machine and guarded updates

> check:auth
> node scripts/check-auth-consistency.mjs

Auth consistency check passed.

> check:payment
> node scripts/check-payment-safety.mjs

PASS inspected app/api/initialize-payment/route.ts
PASS inspected app/api/payments/chapa/route.ts
PASS payment amount comes from server-side contract/job data in app/api/payments/chapa/route.ts
PASS job ownership is checked in app/api/payments/chapa/route.ts
PASS payment status gate exists in app/api/payments/chapa/route.ts
PASS transaction reference is generated server-side in app/api/payments/chapa/route.ts
PASS server-to-server verification exists in app/api/payments/chapa/route.ts
PASS receipt route has auth in app/api/payments/chapa/route.ts
PASS query params alone cannot mark payment paid in app/api/payments/chapa/route.ts
PASS inspected app/api/payment/webhook/route.ts
PASS webhook signature verification exists in app/api/payment/webhook/route.ts
PASS server-to-server verification exists in app/api/payment/webhook/route.ts
PASS query params alone cannot mark payment paid in app/api/payment/webhook/route.ts
PASS inspected app/api/payments/status/route.ts
PASS receipt route has auth in app/api/payments/status/route.ts
PASS receipt route checks ownership in app/api/payments/status/route.ts
PASS inspected app/api/payments/[paymentId]/receipt/route.ts
PASS receipt route has auth in app/api/payments/[paymentId]/receipt/route.ts
PASS receipt route checks ownership in app/api/payments/[paymentId]/receipt/route.ts
PASS inspected app/payment-success/page.tsx
PASS server-to-server verification exists in app/payment-success/page.tsx
PASS receipt route has auth in app/payment-success/page.tsx
PASS query params alone cannot mark payment paid in app/payment-success/page.tsx
PASS inspected app/checkout/page.tsx
PASS payment amount comes from server-side contract/job data in app/checkout/page.tsx
PASS payment status gate exists in app/checkout/page.tsx
PASS checkout page does not submit payment amount to API in app/checkout/page.tsx
PASS inspected app/(client)/client/pay/[jobId]/page.tsx
PASS payment amount comes from server-side contract/job data in app/(client)/client/pay/[jobId]/page.tsx
PASS payment status gate exists in app/(client)/client/pay/[jobId]/page.tsx
PASS receipt route has auth in app/(client)/client/pay/[jobId]/page.tsx
PASS inspected lib/actions/payments.ts
PASS payment amount comes from server-side contract/job data in lib/actions/payments.ts
PASS job ownership is checked in lib/actions/payments.ts
PASS payment status gate exists in lib/actions/payments.ts
PASS receipt route has auth in lib/actions/payments.ts
PASS inspected lib/payment-processing.ts
PASS payment status gate exists in lib/payment-processing.ts
PASS server-to-server verification exists in lib/payment-processing.ts
PASS query params alone cannot mark payment paid in lib/payment-processing.ts

> prebuild
> npm run check:auth

> check:auth
> node scripts/check-auth-consistency.mjs

Auth consistency check passed.

> build
> next build

▲ Next.js 16.2.2 (Turbopack)

- Environments: .env.local

  Creating an optimized production build ...
  ✓ Compiled successfully in 62s
  ✓ Finished TypeScript in 84s  
  ✓ Collecting page data using 11 workers in 25.1s  
  ✓ Generating static pages using 11 workers (44/44) in 4.5s
  ✓ Finalizing page optimization in 187ms

Route (app)
┌ ƒ /
├ ○ /\_not-found
├ ƒ /admin/community
├ ƒ /admin/contracts
├ ƒ /admin/dashboard
├ ƒ /admin/disputes
├ ƒ /admin/jobs
├ ƒ /admin/payments
├ ƒ /admin/reports
├ ƒ /admin/settings
├ ƒ /admin/users
├ ƒ /admin/verify
├ ƒ /admin/verify/[id]
├ ƒ /admin/workers
├ ƒ /api/auth/[...path]
├ ƒ /api/auth/lookup
├ ƒ /api/auth/me
├ ƒ /api/auth/profile
├ ƒ /api/auth/sign-out
├ ƒ /api/contracts
├ ƒ /api/contracts/[id]/pdf
├ ƒ /api/conversations
├ ƒ /api/conversations/[id]/messages
├ ƒ /api/create-subaccount
├ ƒ /api/initialize-payment
├ ƒ /api/jobs
├ ƒ /api/jobs/[id]
├ ƒ /api/list-banks
├ ƒ /api/location
├ ƒ /api/payment/webhook
├ ƒ /api/payments/[paymentId]/receipt
├ ƒ /api/payments/chapa
├ ƒ /api/payments/status
├ ƒ /api/ratings
├ ƒ /api/upload
├ ƒ /api/workers
├ ƒ /api/workers/[id]
├ ƒ /api/workers/verify
├ ƒ /auth/callback
├ ○ /checkout
├ ƒ /client/community
├ ƒ /client/contract-setup
├ ƒ /client/contract/new
├ ƒ /client/contracts
├ ƒ /client/contracts/[id]
├ ƒ /client/dashboard
├ ƒ /client/messages
├ ƒ /client/messages/[conversationId]
├ ƒ /client/notifications
├ ƒ /client/pay/[jobId]
├ ƒ /client/payments
├ ƒ /client/profile
├ ƒ /client/profile/settings
├ ƒ /client/rate/[jobId]
├ ƒ /client/search
├ ƒ /client/worker/[id]
├ ƒ /community/feed
├ ƒ /contracts/[id]
├ ○ /login
├ ○ /otp-verification
├ ƒ /payment-success
├ ○ /register/client
├ ○ /register/worker
├ ƒ /worker/community
├ ƒ /worker/contract-setup
├ ƒ /worker/contracts
├ ƒ /worker/contracts/[id]
├ ƒ /worker/dashboard
├ ƒ /worker/earnings
├ ƒ /worker/gigs
├ ƒ /worker/jobs
├ ƒ /worker/messages
├ ƒ /worker/messages/[conversationId]
├ ƒ /worker/notifications
├ ƒ /worker/pending-verification
├ ƒ /worker/profile
├ ƒ /worker/profile/settings
└ ƒ /worker/rate/[jobId]

ƒ Proxy (Middleware)

○ (Static) prerendered as static content
ƒ (Dynamic) server-rendered on demand

## Final Demo Flow

Status: TODO
Notes:

- Landing page:
- Client creates job:
- Verified worker applies:
- Client assigns worker:
- Contract/signing:
- Completion approval:
- Payment:
- Ratings:
- Admin oversight:
- Verification/build proof:

## Bugs Found

- ## Error Type
  Runtime Error

## Error Message

An unexpected response was received from the server.

    at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node_modules_next_dist_client_0fhqo1d._.js:11157:37)

Next.js version: 16.2.2 (Turbopack)
this happens suddenly and make me logout and keeps happening again and again if I have little time like 30 second in activity in one page it show this error and log out

POST /worker/gigs 200 in 1165ms (next.js: 15ms, proxy.ts: 14ms, application-code: 1136ms)
└─ ƒ getUnreadCount() in 1112ms lib/actions/notifications.ts
POST /contracts/4a448112-1977-4bd4-aff2-966f53308214 200 in 1632ms (next.js: 27ms, proxy.ts: 9ms, application-code: 1596ms)
└─ ƒ getUnreadCount() in 1574ms lib/actions/notifications.ts
GET /client/contracts 200 in 1085ms (next.js: 11ms, proxy.ts: 10ms, application-code: 1064ms)
POST /client/contracts 200 in 453ms (next.js: 19ms, proxy.ts: 10ms, application-code: 424ms)
└─ ƒ getUnreadCount() in 400ms lib/actions/notifications.ts
POST /client/contracts 200 in 457ms (next.js: 16ms, proxy.ts: 15ms, application-code: 426ms)
└─ ƒ getUnreadCount() in 403ms lib/actions/notifications.ts
POST /login 200 in 39ms (next.js: 7ms, proxy.ts: 5ms, application-code: 27ms)
POST /client/contracts 200 in 1484ms (next.js: 7ms, proxy.ts: 7ms, application-code: 1470ms)
└─ ƒ getUnreadCount() in 1454ms lib/actions/notifications.ts
POST /login 200 in 33ms (next.js: 7ms, proxy.ts: 7ms, application-code: 19ms)
POST /client/contracts 200 in 1576ms (next.js: 7ms, proxy.ts: 6ms, application-code: 1562ms)
└─ ƒ getUnreadCount() in 1550ms lib/actions/notifications.ts
POST /login 200 in 57ms (next.js: 18ms, proxy.ts: 11ms, application-code: 29ms)
POST /client/contracts 200 in 1338ms (next.js: 7ms, proxy.ts: 7ms, application-code: 1324ms)
└─ ƒ getUnreadCount() in 1310ms lib/actions/notifications.ts
POST /client/contracts 200 in 1587ms (next.js: 7ms, proxy.ts: 5ms, application-code: 1575ms)
└─ ƒ getUnreadCount() in 1563ms lib/actions/notifications.ts
POST /login 200 in 44ms (next.js: 12ms, proxy.ts: 8ms, application-code: 23ms)
POST /client/contracts 200 in 1592ms (next.js: 8ms, proxy.ts: 8ms, application-code: 1575ms)
└─ ƒ getUnreadCount() in 1562ms lib/actions/notifications.ts
POST /client/contracts 200 in 1472ms (next.js: 8ms, proxy.ts: 7ms, application-code: 1457ms)
└─ ƒ getUnreadCount() in 1445ms lib/actions/notifications.ts
POST /login 200 in 35ms (next.js: 9ms, proxy.ts: 6ms, application-code: 19ms)
POST /login 200 in 39ms (next.js: 7ms, proxy.ts: 7ms, application-code: 25ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
GET /login 200 in 115ms (next.js: 7ms, proxy.ts: 8ms, application-code: 101ms)
GET /api/auth/me 401 in 905ms (next.js: 6ms, proxy.ts: 7ms, application-code: 892ms)
GET /api/auth/get-session 200 in 991ms (next.js: 37ms, proxy.ts: 6ms, application-code: 949ms)
POST /api/auth/sign-in/email 200 in 2.6s (next.js: 20ms, proxy.ts: 19ms, application-code: 2.6s)
GET /api/auth/get-session 200 in 228ms (next.js: 16ms, proxy.ts: 5ms, application-code: 208ms)
GET /auth/callback 200 in 327ms (next.js: 6ms, proxy.ts: 7ms, application-code: 315ms)
GET /api/auth/get-session 200 in 369ms (next.js: 16ms, proxy.ts: 13ms, application-code: 340ms)
GET /api/auth/get-session 200 in 278ms (next.js: 37ms, proxy.ts: 13ms, application-code: 228ms)
GET /client/search 200 in 1589ms (next.js: 16ms, proxy.ts: 19ms, application-code: 1554ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=51.9916086&lng=4.2065916 200 in 328ms (next.js: 12ms, proxy.ts: 8ms, application-code: 308ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=51.9916086&lng=4.2065916 200 in 331ms (next.js: 10ms, proxy.ts: 11ms, application-code: 310ms)
POST /client/search 200 in 1019ms (next.js: 11ms, proxy.ts: 25ms, application-code: 983ms)
└─ ƒ getUnreadCount() in 958ms lib/actions/notifications.ts
POST /client/search 200 in 451ms (next.js: 12ms, proxy.ts: 9ms, application-code: 430ms)
└─ ƒ getUnreadCount() in 409ms lib/actions/notifications.ts
GET /client/payments 200 in 833ms (next.js: 7ms, proxy.ts: 8ms, application-code: 819ms)
GET /client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1904ms (next.js: 28ms, proxy.ts: 8ms, application-code: 1867ms)
[CHAPA_POST_HIT] {
origin: 'http://localhost:3000',
href: 'http://localhost:3000/api/payments/chapa',
webhookUrl: 'https://oak-matter-bloomberg-carbon.trycloudflare.com/api/payment/webhook',
browserReturnUrl: '(not sent)'
}
[CHAPA_PAYMENT_URLS] {
txRef: 'DIRESKILL-1784710953374-21348',
callbackUrl: 'https://oak-matter-bloomberg-carbon.trycloudflare.com/api/payment/webhook'
}
POST /api/payments/chapa 200 in 6.3s (next.js: 2.5s, proxy.ts: 5ms, application-code: 3.8s)
POST /login 200 in 64ms (next.js: 13ms, proxy.ts: 11ms, application-code: 41ms)
POST /login 200 in 56ms (next.js: 9ms, proxy.ts: 9ms, application-code: 38ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
GET /api/auth/get-session 200 in 1030ms (next.js: 49ms, proxy.ts: 16ms, application-code: 964ms)
POST /login 200 in 168ms (next.js: 40ms, proxy.ts: 19ms, application-code: 109ms)
POST /login 200 in 51ms (next.js: 11ms, proxy.ts: 8ms, application-code: 33ms)
POST /login 200 in 40ms (next.js: 9ms, proxy.ts: 6ms, application-code: 25ms)
Reload env: .env.local
GET /login 200 in 1680ms (next.js: 1249ms, proxy.ts: 352ms, application-code: 79ms)
GET /login 200 in 215ms (next.js: 9ms, proxy.ts: 10ms, application-code: 196ms)
GET /login 200 in 1470ms (next.js: 11ms, proxy.ts: 8ms, application-code: 1451ms)
GET /login 200 in 1399ms (next.js: 9ms, proxy.ts: 8ms, application-code: 1382ms)
GET /api/auth/get-session 200 in 1866ms (next.js: 614ms, proxy.ts: 9ms, application-code: 1243ms)
GET /api/auth/me 401 in 1185ms (next.js: 268ms, proxy.ts: 37ms, application-code: 880ms)
GET /client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 2.9s (next.js: 554ms, proxy.ts: 37ms, application-code: 2.3s)
POST /client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 467ms (next.js: 29ms, proxy.ts: 13ms, application-code: 425ms)
└─ ƒ getUnreadCount() in 398ms lib/actions/notifications.ts
POST /client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 501ms (next.js: 53ms, proxy.ts: 24ms, application-code: 425ms)
└─ ƒ getUnreadCount() in 397ms lib/actions/notifications.ts
[CHAPA_POST_HIT] {
origin: 'http://localhost:3000',
href: 'http://localhost:3000/api/payments/chapa',
webhookUrl: 'https://regime-bracket-universities-elevation.trycloudflare.com/api/payment/webhook',
browserReturnUrl: '(not sent)'
}
POST /api/payments/chapa 409 in 1069ms (next.js: 326ms, proxy.ts: 10ms, application-code: 733ms)
GET /client/payments 200 in 1985ms (next.js: 71ms, proxy.ts: 11ms, application-code: 1904ms)
POST /client/payments 200 in 443ms (next.js: 10ms, proxy.ts: 10ms, application-code: 423ms)
└─ ƒ getUnreadCount() in 404ms lib/actions/notifications.ts
GET /client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1972ms (next.js: 31ms, proxy.ts: 11ms, application-code: 1930ms)
[CHAPA_POST_HIT] {
origin: 'http://localhost:3000',
href: 'http://localhost:3000/api/payments/chapa',
webhookUrl: 'https://regime-bracket-universities-elevation.trycloudflare.com/api/payment/webhook',
browserReturnUrl: '(not sent)'
}
POST /api/payments/chapa 409 in 2.5s (next.js: 11ms, proxy.ts: 13ms, application-code: 2.5s)
GET /api/auth/get-session 200 in 1150ms (next.js: 58ms, proxy.ts: 8ms, application-code: 1084ms)
GET /client/payments 200 in 2.1s (next.js: 9ms, proxy.ts: 11ms, application-code: 2.1s)
POST /client/payments 200 in 461ms (next.js: 13ms, proxy.ts: 11ms, application-code: 436ms)
└─ ƒ getUnreadCount() in 409ms lib/actions/notifications.ts
POST /client/payments 200 in 498ms (next.js: 15ms, proxy.ts: 13ms, application-code: 470ms)
└─ ƒ getUnreadCount() in 444ms lib/actions/notifications.ts
POST /client/payments 200 in 1684ms (next.js: 8ms, proxy.ts: 7ms, application-code: 1669ms)
└─ ƒ getUnreadCount() in 1653ms lib/actions/notifications.ts
POST /login 200 in 52ms (next.js: 9ms, proxy.ts: 11ms, application-code: 32ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 36ms (next.js: 8ms, proxy.ts: 5ms, application-code: 23ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 40ms (next.js: 9ms, proxy.ts: 8ms, application-code: 24ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 42ms (next.js: 7ms, proxy.ts: 7ms, application-code: 28ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 36ms (next.js: 7ms, proxy.ts: 7ms, application-code: 22ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 40ms (next.js: 7ms, proxy.ts: 7ms, application-code: 25ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 35ms (next.js: 7ms, proxy.ts: 8ms, application-code: 19ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 39ms (next.js: 9ms, proxy.ts: 7ms, application-code: 23ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 35ms (next.js: 7ms, proxy.ts: 6ms, application-code: 22ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 35ms (next.js: 7ms, proxy.ts: 6ms, application-code: 22ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 38ms (next.js: 8ms, proxy.ts: 7ms, application-code: 24ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 31ms (next.js: 7ms, proxy.ts: 6ms, application-code: 18ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 73ms (next.js: 14ms, proxy.ts: 14ms, application-code: 45ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
GET /login 200 in 69ms (next.js: 9ms, proxy.ts: 8ms, application-code: 51ms)
GET /api/auth/me 401 in 1874ms (next.js: 10ms, proxy.ts: 17ms, application-code: 1848ms)
GET /api/auth/me 401 in 1876ms (next.js: 20ms, proxy.ts: 16ms, application-code: 1840ms)
POST /api/auth/sign-in/email 200 in 2.9s (next.js: 21ms, proxy.ts: 7ms, application-code: 2.8s)
GET /api/auth/get-session 200 in 232ms (next.js: 16ms, proxy.ts: 7ms, application-code: 209ms)
GET /auth/callback 200 in 551ms (next.js: 144ms, proxy.ts: 7ms, application-code: 399ms)
GET /api/auth/get-session 200 in 362ms (next.js: 36ms, proxy.ts: 7ms, application-code: 319ms)
GET /api/auth/get-session 200 in 278ms (next.js: 35ms, proxy.ts: 26ms, application-code: 217ms)
GET /client/search 200 in 1623ms (next.js: 45ms, proxy.ts: 9ms, application-code: 1569ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=51.9916086&lng=4.2065916 200 in 616ms (next.js: 191ms, proxy.ts: 15ms, application-code: 410ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=51.9916086&lng=4.2065916 200 in 233ms (next.js: 8ms, proxy.ts: 12ms, application-code: 214ms)
POST /client/search 200 in 1329ms (next.js: 228ms, proxy.ts: 16ms, application-code: 1085ms)
└─ ƒ getUnreadCount() in 1062ms lib/actions/notifications.ts
POST /client/search 200 in 448ms (next.js: 15ms, proxy.ts: 11ms, application-code: 422ms)
└─ ƒ getUnreadCount() in 401ms lib/actions/notifications.ts
GET /client/payments 200 in 887ms (next.js: 6ms, proxy.ts: 7ms, application-code: 874ms)
GET /client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1713ms (next.js: 20ms, proxy.ts: 6ms, application-code: 1687ms)
[CHAPA_POST_HIT] {
origin: 'http://localhost:3000',
href: 'http://localhost:3000/api/payments/chapa',
webhookUrl: 'https://regime-bracket-universities-elevation.trycloudflare.com/api/payment/webhook',
browserReturnUrl: '(not sent)'
}
POST /api/payments/chapa 409 in 609ms (next.js: 4ms, proxy.ts: 5ms, application-code: 600ms)
POST /client/pay/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1612ms (next.js: 21ms, proxy.ts: 7ms, application-code: 1584ms)
└─ ƒ getUnreadCount() in 1563ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 941ms (next.js: 32ms, proxy.ts: 15ms, application-code: 894ms)
GET /api/auth/get-session 200 in 1039ms (next.js: 42ms, proxy.ts: 13ms, application-code: 984ms)
GET /client/payments 200 in 2.8s (next.js: 19ms, proxy.ts: 17ms, application-code: 2.8s)
POST /client/payments 200 in 1847ms (next.js: 24ms, proxy.ts: 17ms, application-code: 1807ms)
└─ ƒ getUnreadCount() in 1766ms lib/actions/notifications.ts
POST /client/payments 200 in 460ms (next.js: 15ms, proxy.ts: 10ms, application-code: 435ms)
└─ ƒ getUnreadCount() in 397ms lib/actions/notifications.ts
POST /client/payments 200 in 1660ms (next.js: 10ms, proxy.ts: 9ms, application-code: 1641ms)
└─ ƒ getUnreadCount() in 1612ms lib/actions/notifications.ts
POST /client/payments 200 in 1738ms (next.js: 58ms, proxy.ts: 36ms, application-code: 1644ms)
└─ ƒ getUnreadCount() in 1605ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 1277ms (next.js: 140ms, proxy.ts: 12ms, application-code: 1124ms)
GET /api/auth/get-session 200 in 383ms (next.js: 87ms, proxy.ts: 15ms, application-code: 282ms)
GET /client/payments 200 in 2.7s (next.js: 139ms, proxy.ts: 90ms, application-code: 2.5s)
POST /client/payments 200 in 528ms (next.js: 48ms, proxy.ts: 23ms, application-code: 457ms)
└─ ƒ getUnreadCount() in 404ms lib/actions/notifications.ts
POST /client/payments 200 in 526ms (next.js: 48ms, proxy.ts: 33ms, application-code: 445ms)
└─ ƒ getUnreadCount() in 410ms lib/actions/notifications.ts
POST /client/payments 200 in 1683ms (next.js: 14ms, proxy.ts: 15ms, application-code: 1654ms)
└─ ƒ getUnreadCount() in 1625ms lib/actions/notifications.ts
GET / 200 in 482ms (next.js: 72ms, proxy.ts: 12ms, application-code: 398ms)
GET /api/auth/get-session 200 in 947ms (next.js: 32ms, proxy.ts: 25ms, application-code: 890ms)
GET /api/auth/get-session 200 in 441ms (next.js: 42ms, proxy.ts: 15ms, application-code: 385ms)
GET /client/search 200 in 2.2s (next.js: 17ms, proxy.ts: 26ms, application-code: 2.1s)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=51.9916086&lng=4.2065916 200 in 511ms (next.js: 18ms, proxy.ts: 13ms, application-code: 480ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=51.9916086&lng=4.2065916 200 in 433ms (next.js: 29ms, proxy.ts: 44ms, application-code: 360ms)
POST /client/search 200 in 1197ms (next.js: 39ms, proxy.ts: 22ms, application-code: 1135ms)
└─ ƒ getUnreadCount() in 1067ms lib/actions/notifications.ts
POST /client/search 200 in 472ms (next.js: 18ms, proxy.ts: 20ms, application-code: 435ms)
└─ ƒ getUnreadCount() in 405ms lib/actions/notifications.ts
POST /client/payments 200 in 1605ms (next.js: 16ms, proxy.ts: 12ms, application-code: 1577ms)
└─ ƒ getUnreadCount() in 1549ms lib/actions/notifications.ts
POST /client/search 200 in 1514ms (next.js: 11ms, proxy.ts: 10ms, application-code: 1492ms)
└─ ƒ getUnreadCount() in 1463ms lib/actions/notifications.ts
GET /client/payments 200 in 2.1s (next.js: 17ms, proxy.ts: 19ms, application-code: 2.1s)
POST /client/payments 200 in 1597ms (next.js: 11ms, proxy.ts: 12ms, application-code: 1574ms)
└─ ƒ getUnreadCount() in 1549ms lib/actions/notifications.ts
POST /client/payments 200 in 1625ms (next.js: 9ms, proxy.ts: 11ms, application-code: 1605ms)
└─ ƒ getUnreadCount() in 1586ms lib/actions/notifications.ts
POST /client/payments 200 in 2.3s (next.js: 10ms, proxy.ts: 8ms, application-code: 2.3s)
└─ ƒ getUnreadCount() in 2302ms lib/actions/notifications.ts
POST /client/payments 200 in 1732ms (next.js: 11ms, proxy.ts: 9ms, application-code: 1712ms)
└─ ƒ getUnreadCount() in 1692ms lib/actions/notifications.ts
POST /login 200 in 60ms (next.js: 11ms, proxy.ts: 16ms, application-code: 33ms)
POST /login 200 in 51ms (next.js: 9ms, proxy.ts: 10ms, application-code: 32ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 149ms (next.js: 18ms, proxy.ts: 83ms, application-code: 48ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
GET /api/auth/get-session 200 in 1076ms (next.js: 65ms, proxy.ts: 26ms, application-code: 985ms)
POST /login 200 in 35ms (next.js: 8ms, proxy.ts: 6ms, application-code: 22ms)
POST /login 200 in 34ms (next.js: 7ms, proxy.ts: 7ms, application-code: 21ms)
POST /login 200 in 326ms (next.js: 109ms, proxy.ts: 5ms, application-code: 211ms)
POST /login 200 in 73ms (next.js: 13ms, proxy.ts: 17ms, application-code: 43ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 2.2s (next.js: 417ms, proxy.ts: 177ms, application-code: 1654ms)
POST /login 200 in 3.5s (next.js: 611ms, proxy.ts: 318ms, application-code: 2.6s)
[browser] ⨯ unhandledRejection: TypeError: Failed to fetch
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11109:23)
POST /login 200 in 398ms (next.js: 99ms, proxy.ts: 58ms, application-code: 241ms)
GET /api/auth/get-session 502 in 12.6s (next.js: 570ms, proxy.ts: 449ms, application-code: 11.6s)
GET /api/auth/get-session 200 in 3.0s (next.js: 78ms, proxy.ts: 37ms, application-code: 2.9s)
GET /api/auth/get-session 200 in 517ms (next.js: 67ms, proxy.ts: 32ms, application-code: 418ms)
GET / 200 in 2.9s (next.js: 124ms, proxy.ts: 35ms, application-code: 2.7s)
GET /api/auth/get-session 200 in 393ms (next.js: 57ms, proxy.ts: 18ms, application-code: 319ms)
GET /login 200 in 627ms (next.js: 49ms, proxy.ts: 42ms, application-code: 536ms)
GET /api/auth/get-session 200 in 1093ms (next.js: 65ms, proxy.ts: 18ms, application-code: 1009ms)
GET /api/auth/me 401 in 1873ms (next.js: 104ms, proxy.ts: 28ms, application-code: 1740ms)
POST /api/auth/sign-in/email 200 in 5.0s (next.js: 76ms, proxy.ts: 26ms, application-code: 4.9s)
GET /api/auth/get-session 200 in 618ms (next.js: 61ms, proxy.ts: 24ms, application-code: 533ms)
GET /auth/callback 200 in 619ms (next.js: 37ms, proxy.ts: 23ms, application-code: 559ms)
GET /api/auth/get-session 200 in 611ms (next.js: 70ms, proxy.ts: 28ms, application-code: 513ms)
GET /api/auth/get-session 200 in 1313ms (next.js: 107ms, proxy.ts: 20ms, application-code: 1186ms)
GET /api/auth/get-session 200 in 364ms (next.js: 23ms, proxy.ts: 30ms, application-code: 311ms)
POST /api/auth/sign-in/email 200 in 2.7s (next.js: 26ms, proxy.ts: 25ms, application-code: 2.6s)
GET /client/search 200 in 5.0s (next.js: 26ms, proxy.ts: 29ms, application-code: 4.9s)
GET /api/auth/get-session 200 in 292ms (next.js: 41ms, proxy.ts: 17ms, application-code: 234ms)
GET /auth/callback 200 in 539ms (next.js: 17ms, proxy.ts: 18ms, application-code: 504ms)
GET /api/auth/get-session 200 in 755ms (next.js: 26ms, proxy.ts: 17ms, application-code: 712ms)
GET /api/auth/get-session 200 in 349ms (next.js: 38ms, proxy.ts: 43ms, application-code: 268ms)
GET /worker/dashboard 200 in 2.9s (next.js: 211ms, proxy.ts: 18ms, application-code: 2.6s)
POST /worker/dashboard 200 in 940ms (next.js: 156ms, proxy.ts: 220ms, application-code: 564ms)
└─ ƒ getUnreadCount() in 478ms lib/actions/notifications.ts
POST /worker/dashboard 200 in 516ms (next.js: 22ms, proxy.ts: 22ms, application-code: 472ms)
└─ ƒ getUnreadCount() in 430ms lib/actions/notifications.ts
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.030451&lng=38.8250943 200 in 731ms (next.js: 26ms, proxy.ts: 15ms, application-code: 690ms)
POST /client/search 200 in 985ms (next.js: 57ms, proxy.ts: 22ms, application-code: 906ms)
└─ ƒ getUnreadCount() in 866ms lib/actions/notifications.ts
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.030451&lng=38.8250943 200 in 644ms (next.js: 23ms, proxy.ts: 39ms, application-code: 582ms)
POST /client/search 200 in 1357ms (next.js: 25ms, proxy.ts: 17ms, application-code: 1316ms)
└─ ƒ getUnreadCount() in 1254ms lib/actions/notifications.ts
GET /worker/earnings 200 in 1187ms (next.js: 161ms, proxy.ts: 24ms, application-code: 1001ms)
POST /worker/earnings 200 in 1888ms (next.js: 23ms, proxy.ts: 21ms, application-code: 1844ms)
└─ ƒ getUnreadCount() in 1798ms lib/actions/notifications.ts
POST /client/search 200 in 494ms (next.js: 14ms, proxy.ts: 19ms, application-code: 461ms)
└─ ƒ getUnreadCount() in 425ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 1172ms (next.js: 70ms, proxy.ts: 20ms, application-code: 1083ms)
GET /worker/notifications 200 in 3.4s (next.js: 127ms, proxy.ts: 16ms, application-code: 3.2s)
POST /worker/earnings 200 in 493ms (next.js: 19ms, proxy.ts: 18ms, application-code: 455ms)
└─ ƒ getUnreadCount() in 421ms lib/actions/notifications.ts
POST /worker/notifications 200 in 4.5s (next.js: 29ms, proxy.ts: 30ms, application-code: 4.4s)
└─ ƒ markAsRead("b839a20c-e3b9-4ab9-b64b-e8513472b238") in 1934ms lib/actions/notifications.ts
GET /worker/earnings 200 in 2.6s (next.js: 21ms, proxy.ts: 21ms, application-code: 2.5s)
GET /worker/earnings 200 in 2.5s (next.js: 31ms, proxy.ts: 34ms, application-code: 2.4s)
POST /client/search 200 in 577ms (next.js: 26ms, proxy.ts: 22ms, application-code: 529ms)
└─ ƒ getUnreadCount() in 447ms lib/actions/notifications.ts
GET /client/search 200 in 2.6s (next.js: 30ms, proxy.ts: 29ms, application-code: 2.5s)
GET /api/auth/get-session 200 in 986ms (next.js: 49ms, proxy.ts: 19ms, application-code: 919ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304519&lng=38.8250991 200 in 790ms (next.js: 12ms, proxy.ts: 16ms, application-code: 761ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304519&lng=38.8250991 200 in 492ms (next.js: 26ms, proxy.ts: 36ms, application-code: 430ms)
POST /client/search 200 in 1370ms (next.js: 24ms, proxy.ts: 22ms, application-code: 1324ms)
└─ ƒ getUnreadCount() in 1284ms lib/actions/notifications.ts
POST /client/search 200 in 507ms (next.js: 23ms, proxy.ts: 18ms, application-code: 466ms)
└─ ƒ getUnreadCount() in 413ms lib/actions/notifications.ts
POST /worker/earnings 200 in 2.3s (next.js: 25ms, proxy.ts: 19ms, application-code: 2.2s)
└─ ƒ getUnreadCount() in 2197ms lib/actions/notifications.ts
GET /client/messages 200 in 384ms (next.js: 147ms, proxy.ts: 23ms, application-code: 214ms)
GET /api/conversations 200 in 1910ms (next.js: 246ms, proxy.ts: 62ms, application-code: 1602ms)
GET /api/conversations 200 in 507ms (next.js: 12ms, proxy.ts: 21ms, application-code: 473ms)
POST /client/messages/[conversationId] 200 in 1528ms (next.js: 131ms, proxy.ts: 18ms, application-code: 1379ms)
└─ ƒ getProfileData() in 1322ms lib/actions/profile.ts
POST /client/payments 200 in 1616ms (next.js: 28ms, proxy.ts: 21ms, application-code: 1568ms)
POST /client/messages 200 in 3.3s (next.js: 18ms, proxy.ts: 32ms, application-code: 3.3s)
└─ ƒ getProfileData() in 3156ms lib/actions/profile.ts
GET /client/payments 200 in 2.1s (next.js: 24ms, proxy.ts: 19ms, application-code: 2.0s)
GET /client/contracts 200 in 1481ms (next.js: 166ms, proxy.ts: 17ms, application-code: 1299ms)
○ Compiling /client/rate/[jobId] ...
POST /worker/earnings 200 in 1922ms (next.js: 28ms, proxy.ts: 38ms, application-code: 1857ms)
└─ ƒ getUnreadCount() in 1808ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 1836ms (next.js: 330ms, proxy.ts: 22ms, application-code: 1484ms)
GET /worker/contracts 200 in 2.4s (next.js: 136ms, proxy.ts: 17ms, application-code: 2.3s)
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
Error: Route "/client/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at ClientRatingPage (app\(client)\client\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function ClientRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/client/contracts");
14 |
✓ Finished filesystem cache database compaction in 15.0s
POST /client/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1448ms (next.js: 327ms, proxy.ts: 47ms, application-code: 1074ms)
└─ ƒ getUnreadCount() in 994ms lib/actions/notifications.ts
POST /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1575ms (next.js: 131ms, proxy.ts: 49ms, application-code: 1395ms)
└─ ƒ getUnreadCount() in 1233ms lib/actions/notifications.ts
GET /client/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 80s (next.js: 78s, proxy.ts: 26ms, application-code: 2.2s)
POST /client/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 541ms (next.js: 30ms, proxy.ts: 16ms, application-code: 496ms)
└─ ƒ getUnreadCount() in 464ms lib/actions/notifications.ts
POST /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 505ms (next.js: 25ms, proxy.ts: 15ms, application-code: 465ms)
└─ ƒ getUnreadCount() in 424ms lib/actions/notifications.ts
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 48s (next.js: 36.1s, proxy.ts: 27ms, application-code: 11.9s)
POST /client/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 617ms (next.js: 95ms, proxy.ts: 26ms, application-code: 496ms)
└─ ƒ getUnreadCount() in 434ms lib/actions/notifications.ts
GET /worker/contracts 200 in 1651ms (next.js: 53ms, proxy.ts: 55ms, application-code: 1543ms)
GET /worker/contracts 200 in 1843ms (next.js: 273ms, proxy.ts: 36ms, application-code: 1534ms)
GET /client/contracts 200 in 1875ms (next.js: 100ms, proxy.ts: 50ms, application-code: 1725ms)
GET /client/contracts 200 in 1453ms (next.js: 58ms, proxy.ts: 44ms, application-code: 1351ms)
✓ Finished filesystem cache database compaction in 13.4s
POST /client/contracts 200 in 1597ms (next.js: 14ms, proxy.ts: 16ms, application-code: 1566ms)
└─ ƒ getUnreadCount() in 1525ms lib/actions/notifications.ts
POST /worker/contracts 200 in 1689ms (next.js: 15ms, proxy.ts: 14ms, application-code: 1660ms)
└─ ƒ getUnreadCount() in 1618ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 1098ms (next.js: 57ms, proxy.ts: 20ms, application-code: 1021ms)
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1879ms (next.js: 56ms, proxy.ts: 22ms, application-code: 1801ms)
GET /worker/contracts 200 in 1282ms (next.js: 20ms, proxy.ts: 21ms, application-code: 1241ms)
GET /worker/contracts 200 in 2.3s (next.js: 34ms, proxy.ts: 31ms, application-code: 2.2s)
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 2.0s (next.js: 44ms, proxy.ts: 26ms, application-code: 1941ms)
GET /worker/contracts 200 in 1856ms (next.js: 17ms, proxy.ts: 19ms, application-code: 1820ms)
GET /worker/contracts 200 in 2.4s (next.js: 40ms, proxy.ts: 31ms, application-code: 2.4s)
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 842ms (next.js: 57ms, proxy.ts: 19ms, application-code: 766ms)
GET /worker/contracts 200 in 1216ms (next.js: 25ms, proxy.ts: 32ms, application-code: 1159ms)
GET /worker/contracts 200 in 1206ms (next.js: 18ms, proxy.ts: 21ms, application-code: 1167ms)
POST /worker/contracts 200 in 478ms (next.js: 23ms, proxy.ts: 16ms, application-code: 439ms)
└─ ƒ getUnreadCount() in 404ms lib/actions/notifications.ts
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 735ms (next.js: 34ms, proxy.ts: 23ms, application-code: 677ms)
GET /worker/contracts 200 in 1259ms (next.js: 32ms, proxy.ts: 49ms, application-code: 1178ms)
GET /worker/contracts 200 in 1248ms (next.js: 16ms, proxy.ts: 17ms, application-code: 1214ms)
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 1108ms (next.js: 46ms, proxy.ts: 21ms, application-code: 1042ms)
GET /api/auth/get-session 200 in 1064ms (next.js: 51ms, proxy.ts: 14ms, application-code: 999ms)
POST /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 682ms (next.js: 163ms, proxy.ts: 38ms, application-code: 481ms)
└─ ƒ getUnreadCount() in 449ms lib/actions/notifications.ts
GET /worker/contracts 200 in 1203ms (next.js: 17ms, proxy.ts: 16ms, application-code: 1170ms)
GET /worker/contracts 200 in 1873ms (next.js: 21ms, proxy.ts: 27ms, application-code: 1825ms)
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 752ms (next.js: 38ms, proxy.ts: 30ms, application-code: 684ms)
GET /worker/contracts 200 in 1188ms (next.js: 32ms, proxy.ts: 32ms, application-code: 1124ms)
GET /worker/contracts 200 in 1248ms (next.js: 33ms, proxy.ts: 20ms, application-code: 1195ms)
Error: Route "/worker/rate/[jobId]" used `params.jobId`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
at WorkerRatingPage (app\(worker)\worker\rate\[jobId]\page.tsx:11:47)
9 |
10 | export default async function WorkerRatingPage({ params }: { params: { jobId: string } }) {

> 11 | const data = await getRatingPageData(params.jobId);

     |                                               ^

12 |
13 | if (!data) redirect("/worker/contracts");
14 |
GET /worker/rate/ee843af0-3c22-4bac-b4cb-9b24d81cfc3e 200 in 731ms (next.js: 50ms, proxy.ts: 16ms, application-code: 665ms)
GET /worker/contracts 200 in 1265ms (next.js: 25ms, proxy.ts: 37ms, application-code: 1202ms)
GET /worker/contracts 200 in 1212ms (next.js: 17ms, proxy.ts: 16ms, application-code: 1178ms)
POST /worker/contracts 200 in 1600ms (next.js: 16ms, proxy.ts: 13ms, application-code: 1571ms)
└─ ƒ getUnreadCount() in 1540ms lib/actions/notifications.ts
POST /worker/contracts 200 in 2.2s (next.js: 19ms, proxy.ts: 18ms, application-code: 2.1s)
└─ ƒ getUnreadCount() in 2106ms lib/actions/notifications.ts
POST /client/contracts 200 in 490ms (next.js: 17ms, proxy.ts: 14ms, application-code: 459ms)
└─ ƒ getUnreadCount() in 429ms lib/actions/notifications.ts
POST /login 200 in 73ms (next.js: 17ms, proxy.ts: 11ms, application-code: 46ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 84ms (next.js: 18ms, proxy.ts: 17ms, application-code: 49ms)
POST /login 200 in 62ms (next.js: 12ms, proxy.ts: 10ms, application-code: 40ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 129ms (next.js: 24ms, proxy.ts: 18ms, application-code: 88ms)
POST /login 200 in 104ms (next.js: 22ms, proxy.ts: 18ms, application-code: 64ms)
POST /login 200 in 66ms (next.js: 14ms, proxy.ts: 10ms, application-code: 41ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 102ms (next.js: 17ms, proxy.ts: 15ms, application-code: 69ms)
POST /login 200 in 74ms (next.js: 16ms, proxy.ts: 14ms, application-code: 44ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 134ms (next.js: 21ms, proxy.ts: 22ms, application-code: 91ms)
POST /login 200 in 134ms (next.js: 48ms, proxy.ts: 23ms, application-code: 63ms)
POST /login 200 in 58ms (next.js: 11ms, proxy.ts: 9ms, application-code: 38ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 89ms (next.js: 15ms, proxy.ts: 14ms, application-code: 60ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 141ms (next.js: 17ms, proxy.ts: 18ms, application-code: 106ms)
POST /login 200 in 146ms (next.js: 49ms, proxy.ts: 15ms, application-code: 82ms)
POST /login 200 in 59ms (next.js: 12ms, proxy.ts: 11ms, application-code: 36ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 87ms (next.js: 20ms, proxy.ts: 13ms, application-code: 54ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 134ms (next.js: 21ms, proxy.ts: 26ms, application-code: 88ms)
POST /login 200 in 136ms (next.js: 50ms, proxy.ts: 22ms, application-code: 64ms)
POST /login 200 in 71ms (next.js: 15ms, proxy.ts: 12ms, application-code: 44ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 89ms (next.js: 17ms, proxy.ts: 15ms, application-code: 57ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 131ms (next.js: 21ms, proxy.ts: 28ms, application-code: 83ms)
POST /login 200 in 128ms (next.js: 46ms, proxy.ts: 22ms, application-code: 60ms)
POST /login 200 in 66ms (next.js: 13ms, proxy.ts: 10ms, application-code: 43ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 67ms (next.js: 13ms, proxy.ts: 10ms, application-code: 44ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 136ms (next.js: 24ms, proxy.ts: 20ms, application-code: 92ms)
POST /login 200 in 134ms (next.js: 51ms, proxy.ts: 19ms, application-code: 65ms)
POST /login 200 in 88ms (next.js: 18ms, proxy.ts: 17ms, application-code: 52ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /api/auth/sign-out 200 in 202ms (next.js: 152ms, proxy.ts: 14ms, application-code: 36ms)
GET /api/auth/get-session 200 in 451ms (next.js: 143ms, proxy.ts: 255ms, application-code: 52ms)
GET /login 200 in 672ms (next.js: 36ms, proxy.ts: 22ms, application-code: 614ms)
GET /api/auth/me 401 in 1437ms (next.js: 11ms, proxy.ts: 14ms, application-code: 1413ms)
GET /api/auth/get-session 200 in 2.3s (next.js: 96ms, proxy.ts: 35ms, application-code: 2.1s)
GET /api/auth/get-session 200 in 272ms (next.js: 30ms, proxy.ts: 17ms, application-code: 226ms)
POST /api/auth/sign-in/email 200 in 3.2s (next.js: 42ms, proxy.ts: 13ms, application-code: 3.1s)
GET /api/auth/get-session 200 in 340ms (next.js: 68ms, proxy.ts: 28ms, application-code: 244ms)
GET /auth/callback 200 in 686ms (next.js: 34ms, proxy.ts: 19ms, application-code: 632ms)
GET /api/auth/get-session 200 in 867ms (next.js: 20ms, proxy.ts: 22ms, application-code: 825ms)
GET /api/auth/get-session 200 in 385ms (next.js: 41ms, proxy.ts: 17ms, application-code: 327ms)
GET /admin/dashboard 200 in 4.8s (next.js: 456ms, proxy.ts: 18ms, application-code: 4.3s)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 114ms (next.js: 24ms, proxy.ts: 16ms, application-code: 74ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
GET /api/auth/get-session 200 in 1089ms (next.js: 82ms, proxy.ts: 19ms, application-code: 988ms)
POST /worker/contracts 200 in 1720ms (next.js: 16ms, proxy.ts: 15ms, application-code: 1689ms)
└─ ƒ getUnreadCount() in 1660ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 414ms (next.js: 74ms, proxy.ts: 21ms, application-code: 319ms)
POST /login 200 in 58ms (next.js: 13ms, proxy.ts: 10ms, application-code: 35ms)
GET /admin/users 200 in 2.3s (next.js: 264ms, proxy.ts: 16ms, application-code: 2.0s)
POST /login 200 in 111ms (next.js: 21ms, proxy.ts: 17ms, application-code: 74ms)
POST /admin/users 200 in 2.8s (next.js: 23ms, proxy.ts: 16ms, application-code: 2.7s)
└─ ƒ setSuspendedStatus("33e4c140-db00-4ddc-827a-85e6728f7ccc", true) in 1630ms lib/actions/super-admin.ts
POST /admin/users 200 in 3.0s (next.js: 16ms, proxy.ts: 15ms, application-code: 2.9s)
└─ ƒ setSuspendedStatus("33e4c140-db00-4ddc-827a-85e6728f7ccc", false) in 1844ms lib/actions/super-admin.ts
POST /worker/contracts 200 in 469ms (next.js: 19ms, proxy.ts: 13ms, application-code: 437ms)
└─ ƒ getUnreadCount() in 409ms lib/actions/notifications.ts
POST /admin/users 200 in 1558ms (next.js: 18ms, proxy.ts: 13ms, application-code: 1527ms)
└─ ƒ deleteUser("33e4c140-db00-4ddc-827a-85e6728f7ccc") in 583ms lib/actions/super-admin.ts
○ Compiling /admin/workers ...
○ Compiling /admin/reports ...
GET /admin/reports 200 in 11.0s (next.js: 7.5s, proxy.ts: 33ms, application-code: 3.5s)
GET /admin/reports 200 in 3.5s (next.js: 27ms, proxy.ts: 28ms, application-code: 3.5s)
GET /admin/workers 200 in 22.3s (next.js: 4.4s, proxy.ts: 14ms, application-code: 17.8s)
POST /login 200 in 127ms (next.js: 20ms, proxy.ts: 31ms, application-code: 76ms)
POST /worker/contracts 200 in 2.0s (next.js: 33ms, proxy.ts: 38ms, application-code: 1954ms)
└─ ƒ getUnreadCount() in 1913ms lib/actions/notifications.ts
✓ Finished filesystem cache database compaction in 12.6s
POST /login 200 in 92ms (next.js: 18ms, proxy.ts: 22ms, application-code: 52ms)
GET /api/payments/02c5eaa9-c798-44fc-996f-c130aa42edcb/receipt 200 in 7.7s (next.js: 5.8s, proxy.ts: 26ms, application-code: 1858ms)
POST /worker/contracts 200 in 1178ms (next.js: 31ms, proxy.ts: 32ms, application-code: 1115ms)
└─ ƒ getUnreadCount() in 1070ms lib/actions/notifications.ts
GET /api/payments/02c5eaa9-c798-44fc-996f-c130aa42edcb/receipt?_rsc=tmarq 200 in 654ms (next.js: 47ms, proxy.ts: 18ms, application-code: 589ms)
GET /api/payments/02c5eaa9-c798-44fc-996f-c130aa42edcb/receipt 200 in 542ms (next.js: 29ms, proxy.ts: 37ms, application-code: 476ms)
GET /api/payments/02c5eaa9-c798-44fc-996f-c130aa42edcb/receipt 200 in 626ms (next.js: 22ms, proxy.ts: 14ms, application-code: 591ms)
POST /login 200 in 146ms (next.js: 26ms, proxy.ts: 65ms, application-code: 55ms)
POST /worker/contracts 200 in 1878ms (next.js: 34ms, proxy.ts: 35ms, application-code: 1810ms)
└─ ƒ getUnreadCount() in 1771ms lib/actions/notifications.ts
POST /login 200 in 197ms (next.js: 29ms, proxy.ts: 26ms, application-code: 142ms)
POST /login 200 in 205ms (next.js: 34ms, proxy.ts: 58ms, application-code: 114ms)
GET /login 200 in 158ms (next.js: 22ms, proxy.ts: 16ms, application-code: 120ms)
GET /api/auth/me 401 in 1147ms (next.js: 15ms, proxy.ts: 32ms, application-code: 1100ms)
GET /api/auth/me 401 in 1263ms (next.js: 49ms, proxy.ts: 23ms, application-code: 1191ms)
POST /api/auth/sign-in/email 200 in 2.5s (next.js: 65ms, proxy.ts: 29ms, application-code: 2.4s)
GET /api/auth/get-session 200 in 257ms (next.js: 21ms, proxy.ts: 15ms, application-code: 221ms)
GET /auth/callback 200 in 575ms (next.js: 20ms, proxy.ts: 48ms, application-code: 506ms)
GET /api/auth/get-session 200 in 463ms (next.js: 81ms, proxy.ts: 36ms, application-code: 347ms)
GET /api/auth/get-session 200 in 293ms (next.js: 32ms, proxy.ts: 21ms, application-code: 239ms)
GET /admin/dashboard 200 in 3.3s (next.js: 21ms, proxy.ts: 19ms, application-code: 3.2s)
POST /login 200 in 408ms (next.js: 58ms, proxy.ts: 24ms, application-code: 326ms)
○ Compiling /admin/contracts ...
POST /worker/contracts 200 in 2.1s (next.js: 37ms, proxy.ts: 27ms, application-code: 2.0s)
└─ ƒ getUnreadCount() in 1990ms lib/actions/notifications.ts
GET /admin/contracts 200 in 4.9s (next.js: 3.7s, proxy.ts: 24ms, application-code: 1159ms)
GET /admin/contracts 200 in 741ms (next.js: 17ms, proxy.ts: 20ms, application-code: 704ms)
GET /api/contracts/4a448112-1977-4bd4-aff2-966f53308214/pdf 200 in 1760ms (next.js: 173ms, proxy.ts: 14ms, application-code: 1573ms)
GET /api/contracts/4a448112-1977-4bd4-aff2-966f53308214/pdf 200 in 657ms (next.js: 22ms, proxy.ts: 15ms, application-code: 621ms)
GET /api/auth/get-session 200 in 1076ms (next.js: 60ms, proxy.ts: 22ms, application-code: 995ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node_modules_next_dist_client_0fhqo1d._.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 3.3s (next.js: 490ms, proxy.ts: 2.2s, application-code: 655ms)
POST /worker/contracts 200 in 15.6s (next.js: 344ms, proxy.ts: 4.3s, application-code: 10.9s)
└─ ƒ getUnreadCount() in 10514ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 10.6s (next.js: 815ms, proxy.ts: 725ms, application-code: 9.1s)
POST /login 200 in 80ms (next.js: 18ms, proxy.ts: 17ms, application-code: 45ms)
POST /worker/contracts 200 in 1762ms (next.js: 23ms, proxy.ts: 32ms, application-code: 1706ms)
└─ ƒ getUnreadCount() in 1674ms lib/actions/notifications.ts
POST /login 200 in 105ms (next.js: 34ms, proxy.ts: 18ms, application-code: 52ms)
POST /worker/contracts 200 in 1781ms (next.js: 29ms, proxy.ts: 28ms, application-code: 1723ms)
└─ ƒ getUnreadCount() in 1691ms lib/actions/notifications.ts
○ Compiling /admin/payments ...
GET /admin/payments 200 in 7.5s (next.js: 5.3s, proxy.ts: 15ms, application-code: 2.2s)
GET /admin/payments 200 in 1421ms (next.js: 24ms, proxy.ts: 26ms, application-code: 1371ms)
POST /login 200 in 237ms (next.js: 39ms, proxy.ts: 32ms, application-code: 167ms)
POST /login 200 in 242ms (next.js: 96ms, proxy.ts: 31ms, application-code: 115ms)
POST /login 200 in 155ms (next.js: 27ms, proxy.ts: 24ms, application-code: 104ms)
POST /login 200 in 146ms (next.js: 54ms, proxy.ts: 21ms, application-code: 71ms)
POST /login 200 in 175ms (next.js: 25ms, proxy.ts: 25ms, application-code: 125ms)
POST /login 200 in 175ms (next.js: 64ms, proxy.ts: 21ms, application-code: 89ms)
POST /login 200 in 175ms (next.js: 35ms, proxy.ts: 35ms, application-code: 105ms)
POST /login 200 in 162ms (next.js: 65ms, proxy.ts: 22ms, application-code: 74ms)
POST /login 200 in 202ms (next.js: 35ms, proxy.ts: 29ms, application-code: 137ms)
POST /login 200 in 199ms (next.js: 94ms, proxy.ts: 24ms, application-code: 81ms)
POST /login 200 in 132ms (next.js: 21ms, proxy.ts: 20ms, application-code: 91ms)
POST /login 200 in 131ms (next.js: 47ms, proxy.ts: 19ms, application-code: 65ms)
POST /login 200 in 173ms (next.js: 27ms, proxy.ts: 36ms, application-code: 110ms)
POST /login 200 in 163ms (next.js: 66ms, proxy.ts: 21ms, application-code: 76ms)
POST /login 200 in 167ms (next.js: 31ms, proxy.ts: 30ms, application-code: 106ms)
POST /login 200 in 165ms (next.js: 55ms, proxy.ts: 27ms, application-code: 82ms)
POST /login 200 in 181ms (next.js: 30ms, proxy.ts: 29ms, application-code: 122ms)
POST /login 200 in 181ms (next.js: 61ms, proxy.ts: 34ms, application-code: 87ms)
POST /login 200 in 166ms (next.js: 26ms, proxy.ts: 34ms, application-code: 106ms)
POST /login 200 in 159ms (next.js: 56ms, proxy.ts: 27ms, application-code: 77ms)
POST /login 200 in 174ms (next.js: 22ms, proxy.ts: 24ms, application-code: 127ms)
POST /login 200 in 122ms (next.js: 36ms, proxy.ts: 26ms, application-code: 61ms)
POST /login 200 in 169ms (next.js: 23ms, proxy.ts: 23ms, application-code: 123ms)
POST /login 200 in 169ms (next.js: 58ms, proxy.ts: 23ms, application-code: 88ms)
POST /login 200 in 96ms (next.js: 18ms, proxy.ts: 24ms, application-code: 54ms)
GET /api/auth/get-session 200 in 2.4s (next.js: 49ms, proxy.ts: 17ms, application-code: 2.3s)
GET /login 200 in 183ms (next.js: 24ms, proxy.ts: 20ms, application-code: 140ms)
GET /api/auth/me 401 in 979ms (next.js: 34ms, proxy.ts: 19ms, application-code: 926ms)
GET /api/auth/me 401 in 994ms (next.js: 13ms, proxy.ts: 20ms, application-code: 961ms)
POST /api/auth/sign-in/email 200 in 3.2s (next.js: 63ms, proxy.ts: 28ms, application-code: 3.1s)
GET /api/auth/get-session 200 in 518ms (next.js: 37ms, proxy.ts: 24ms, application-code: 456ms)
GET /auth/callback 200 in 646ms (next.js: 24ms, proxy.ts: 20ms, application-code: 602ms)
POST /login 200 in 1934ms (next.js: 62ms, proxy.ts: 38ms, application-code: 1834ms)
GET /api/auth/get-session 200 in 962ms (next.js: 55ms, proxy.ts: 28ms, application-code: 879ms)
GET /client/search 200 in 3.1s (next.js: 84ms, proxy.ts: 75ms, application-code: 3.0s)
GET /api/auth/get-session 200 in 1200ms (next.js: 102ms, proxy.ts: 43ms, application-code: 1055ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304564&lng=38.8251113 200 in 1018ms (next.js: 28ms, proxy.ts: 14ms, application-code: 976ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304564&lng=38.8251113 200 in 373ms (next.js: 14ms, proxy.ts: 16ms, application-code: 343ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304564&lng=38.8251113 200 in 492ms (next.js: 16ms, proxy.ts: 17ms, application-code: 459ms)
POST /client/search 200 in 1829ms (next.js: 90ms, proxy.ts: 76ms, application-code: 1663ms)
└─ ƒ getUnreadCount() in 1609ms lib/actions/notifications.ts
POST /client/search 200 in 519ms (next.js: 22ms, proxy.ts: 27ms, application-code: 470ms)
└─ ƒ getUnreadCount() in 430ms lib/actions/notifications.ts
GET /client/contracts 200 in 2.8s (next.js: 37ms, proxy.ts: 20ms, application-code: 2.7s)
GET /client/payments 200 in 3.7s (next.js: 93ms, proxy.ts: 165ms, application-code: 3.5s)
GET /client/dashboard 200 in 2.7s (next.js: 107ms, proxy.ts: 17ms, application-code: 2.6s)
POST /client/dashboard 200 in 1707ms (next.js: 27ms, proxy.ts: 22ms, application-code: 1657ms)
└─ ƒ getUnreadCount() in 1617ms lib/actions/notifications.ts
POST /login 200 in 130ms (next.js: 37ms, proxy.ts: 22ms, application-code: 71ms)
POST /client/dashboard 200 in 1598ms (next.js: 17ms, proxy.ts: 15ms, application-code: 1566ms)
└─ ƒ getUnreadCount() in 1532ms lib/actions/notifications.ts
GET /api/auth/get-session 200 in 1115ms (next.js: 90ms, proxy.ts: 16ms, application-code: 1009ms)
GET /api/auth/get-session 200 in 1176ms (next.js: 107ms, proxy.ts: 71ms, application-code: 998ms)
GET /client/search 200 in 145ms (next.js: 24ms, proxy.ts: 23ms, application-code: 98ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304564&lng=38.8251113 200 in 791ms (next.js: 19ms, proxy.ts: 20ms, application-code: 752ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304564&lng=38.8251113 200 in 473ms (next.js: 55ms, proxy.ts: 58ms, application-code: 361ms)
POST /client/search 200 in 1372ms (next.js: 175ms, proxy.ts: 47ms, application-code: 1150ms)
└─ ƒ getUnreadCount() in 1082ms lib/actions/notifications.ts
GET /client/contracts 200 in 2.0s (next.js: 34ms, proxy.ts: 19ms, application-code: 1953ms)
GET /client/payments 200 in 988ms (next.js: 23ms, proxy.ts: 23ms, application-code: 942ms)
GET /client/messages 200 in 192ms (next.js: 40ms, proxy.ts: 32ms, application-code: 120ms)
POST /client/messages 200 in 762ms (next.js: 38ms, proxy.ts: 55ms, application-code: 669ms)
└─ ƒ getProfileData() in 615ms lib/actions/profile.ts
GET /api/conversations 200 in 1000ms (next.js: 14ms, proxy.ts: 17ms, application-code: 969ms)
POST /client/messages 200 in 694ms (next.js: 20ms, proxy.ts: 27ms, application-code: 647ms)
└─ ƒ getProfileData() in 605ms lib/actions/profile.ts
GET /api/conversations 200 in 803ms (next.js: 23ms, proxy.ts: 18ms, application-code: 762ms)
POST /login 200 in 95ms (next.js: 18ms, proxy.ts: 19ms, application-code: 58ms)
○ Compiling /client/profile ...
GET /client/profile 200 in 6.4s (next.js: 6.2s, proxy.ts: 17ms, application-code: 131ms)
POST /client/profile 200 in 2.2s (next.js: 19ms, proxy.ts: 20ms, application-code: 2.2s)
└─ ƒ getProfileData() in 2110ms lib/actions/profile.ts
POST /client/profile 200 in 872ms (next.js: 74ms, proxy.ts: 39ms, application-code: 759ms)
└─ ƒ getProfileData() in 643ms lib/actions/profile.ts
POST /client/profile 200 in 522ms (next.js: 20ms, proxy.ts: 41ms, application-code: 461ms)
└─ ƒ getUnreadCount() in 416ms lib/actions/notifications.ts
✓ Finished filesystem cache database compaction in 19.4s
POST /client/profile 200 in 1759ms (next.js: 18ms, proxy.ts: 22ms, application-code: 1719ms)
└─ ƒ getUnreadCount() in 1649ms lib/actions/notifications.ts
POST /login 200 in 85ms (next.js: 16ms, proxy.ts: 16ms, application-code: 53ms)
POST /client/profile 200 in 2.4s (next.js: 28ms, proxy.ts: 30ms, application-code: 2.3s)
└─ ƒ getUnreadCount() in 2301ms lib/actions/notifications.ts
POST /client/profile 200 in 2.1s (next.js: 39ms, proxy.ts: 43ms, application-code: 2.0s)
└─ ƒ getUnreadCount() in 1975ms lib/actions/notifications.ts
POST /login 200 in 77ms (next.js: 15ms, proxy.ts: 13ms, application-code: 48ms)
POST /client/profile 200 in 1962ms (next.js: 19ms, proxy.ts: 30ms, application-code: 1912ms)
└─ ƒ getUnreadCount() in 1875ms lib/actions/notifications.ts
POST /client/profile 200 in 1838ms (next.js: 23ms, proxy.ts: 25ms, application-code: 1790ms)
└─ ƒ getUnreadCount() in 1725ms lib/actions/notifications.ts
POST /login 200 in 75ms (next.js: 17ms, proxy.ts: 13ms, application-code: 45ms)
POST /login 200 in 104ms (next.js: 27ms, proxy.ts: 14ms, application-code: 63ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 1792ms (next.js: 236ms, proxy.ts: 953ms, application-code: 603ms)
POST /login 200 in 1803ms (next.js: 483ms, proxy.ts: 992ms, application-code: 328ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 3.5s (next.js: 1098ms, proxy.ts: 526ms, application-code: 1835ms)
POST /login 200 in 3.5s (next.js: 1982ms, proxy.ts: 528ms, application-code: 960ms)
POST /login 200 in 180ms (next.js: 51ms, proxy.ts: 54ms, application-code: 75ms)
GET /api/auth/get-session 200 in 12.5s (next.js: 2.7s, proxy.ts: 525ms, application-code: 9.3s)
GET /api/auth/get-session 200 in 12.6s (next.js: 2.8s, proxy.ts: 520ms, application-code: 9.3s)
GET /api/auth/get-session 200 in 476ms (next.js: 94ms, proxy.ts: 50ms, application-code: 332ms)
POST /login 200 in 113ms (next.js: 30ms, proxy.ts: 21ms, application-code: 62ms)
POST /login 200 in 93ms (next.js: 16ms, proxy.ts: 14ms, application-code: 63ms)
POST /login 200 in 122ms (next.js: 22ms, proxy.ts: 27ms, application-code: 72ms)
POST /login 200 in 115ms (next.js: 23ms, proxy.ts: 24ms, application-code: 68ms)
POST /login 200 in 148ms (next.js: 17ms, proxy.ts: 14ms, application-code: 116ms)
POST /login 200 in 142ms (next.js: 25ms, proxy.ts: 30ms, application-code: 87ms)
POST /login 200 in 104ms (next.js: 20ms, proxy.ts: 14ms, application-code: 71ms)
POST /login 200 in 96ms (next.js: 19ms, proxy.ts: 16ms, application-code: 62ms)
POST /login 200 in 127ms (next.js: 19ms, proxy.ts: 24ms, application-code: 83ms)
POST /login 200 in 118ms (next.js: 28ms, proxy.ts: 21ms, application-code: 69ms)
POST /login 200 in 121ms (next.js: 17ms, proxy.ts: 17ms, application-code: 87ms)
POST /login 200 in 138ms (next.js: 28ms, proxy.ts: 31ms, application-code: 79ms)
GET /login 200 in 331ms (next.js: 24ms, proxy.ts: 15ms, application-code: 292ms)
GET /api/auth/me 401 in 1005ms (next.js: 64ms, proxy.ts: 23ms, application-code: 919ms)
GET /api/auth/me 401 in 1034ms (next.js: 18ms, proxy.ts: 27ms, application-code: 989ms)
POST /api/auth/sign-in/email 200 in 3.1s (next.js: 56ms, proxy.ts: 22ms, application-code: 3.0s)
GET /api/auth/get-session 200 in 500ms (next.js: 45ms, proxy.ts: 18ms, application-code: 437ms)
GET /auth/callback 200 in 525ms (next.js: 28ms, proxy.ts: 22ms, application-code: 475ms)
POST /login 200 in 233ms (next.js: 43ms, proxy.ts: 27ms, application-code: 163ms)
GET /api/auth/get-session 200 in 880ms (next.js: 71ms, proxy.ts: 16ms, application-code: 792ms)
GET /client/search 200 in 2.8s (next.js: 20ms, proxy.ts: 32ms, application-code: 2.8s)
GET /api/auth/get-session 200 in 1158ms (next.js: 55ms, proxy.ts: 19ms, application-code: 1084ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304452&lng=38.8250855 200 in 952ms (next.js: 15ms, proxy.ts: 16ms, application-code: 921ms)
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304452&lng=38.8250855 200 in 734ms (next.js: 27ms, proxy.ts: 35ms, application-code: 672ms)
POST /client/search 200 in 1863ms (next.js: 54ms, proxy.ts: 47ms, application-code: 1762ms)
└─ ƒ getUnreadCount() in 1694ms lib/actions/notifications.ts
GET /api/workers?query=&category=&minRating=0&maxDistance=100&lat=9.0304452&lng=38.8250855 200 in 359ms (next.js: 11ms, proxy.ts: 23ms, application-code: 325ms)
POST /client/search 200 in 492ms (next.js: 23ms, proxy.ts: 18ms, application-code: 451ms)
└─ ƒ getUnreadCount() in 404ms lib/actions/notifications.ts
GET /client/profile 200 in 157ms (next.js: 23ms, proxy.ts: 20ms, application-code: 114ms)
POST /client/profile 200 in 2.1s (next.js: 20ms, proxy.ts: 19ms, application-code: 2.1s)
└─ ƒ getProfileData() in 1991ms lib/actions/profile.ts
POST /client/profile 200 in 960ms (next.js: 51ms, proxy.ts: 56ms, application-code: 853ms)
└─ ƒ getProfileData() in 622ms lib/actions/profile.ts
POST /client/profile 200 in 1819ms (next.js: 20ms, proxy.ts: 22ms, application-code: 1777ms)
└─ ƒ getUnreadCount() in 1727ms lib/actions/notifications.ts
POST /login 200 in 100ms (next.js: 15ms, proxy.ts: 17ms, application-code: 68ms)
POST /client/profile 200 in 1484ms (next.js: 23ms, proxy.ts: 18ms, application-code: 1443ms)
└─ ƒ getUnreadCount() in 1388ms lib/actions/notifications.ts
○ Compiling /client/profile/settings ...
POST /client/profile/settings 200 in 648ms (next.js: 83ms, proxy.ts: 52ms, application-code: 513ms)
└─ ƒ getUnreadCount() in 411ms lib/actions/notifications.ts
GET /client/profile/settings 200 in 7.9s (next.js: 4.9s, proxy.ts: 24ms, application-code: 3.0s)
POST /login 200 in 95ms (next.js: 21ms, proxy.ts: 14ms, application-code: 60ms)
POST /client/profile 200 in 1903ms (next.js: 24ms, proxy.ts: 22ms, application-code: 1858ms)
└─ ƒ getProfileData() in 1792ms lib/actions/profile.ts
POST /client/profile 200 in 876ms (next.js: 51ms, proxy.ts: 114ms, application-code: 711ms)
└─ ƒ getProfileData() in 606ms lib/actions/profile.ts
POST /client/profile 200 in 1930ms (next.js: 35ms, proxy.ts: 24ms, application-code: 1871ms)
└─ ƒ getUnreadCount() in 1834ms lib/actions/notifications.ts
POST /client/profile 200 in 1923ms (next.js: 25ms, proxy.ts: 57ms, application-code: 1842ms)
└─ ƒ getUnreadCount() in 1802ms lib/actions/notifications.ts
GET /client/profile/settings 200 in 3.1s (next.js: 27ms, proxy.ts: 21ms, application-code: 3.1s)
POST /login 200 in 99ms (next.js: 19ms, proxy.ts: 15ms, application-code: 65ms)
POST /client/profile 200 in 2.3s (next.js: 63ms, proxy.ts: 16ms, application-code: 2.2s)
└─ ƒ getProfileData() in 2171ms lib/actions/profile.ts
POST /client/profile 200 in 690ms (next.js: 28ms, proxy.ts: 25ms, application-code: 637ms)
└─ ƒ getProfileData() in 600ms lib/actions/profile.ts
POST /client/profile 200 in 1853ms (next.js: 24ms, proxy.ts: 24ms, application-code: 1806ms)
└─ ƒ getUnreadCount() in 1760ms lib/actions/notifications.ts
POST /client/profile 200 in 1886ms (next.js: 24ms, proxy.ts: 22ms, application-code: 1840ms)
└─ ƒ getUnreadCount() in 1800ms lib/actions/notifications.ts
POST /login 200 in 116ms (next.js: 35ms, proxy.ts: 17ms, application-code: 63ms)
POST /client/profile 200 in 1603ms (next.js: 17ms, proxy.ts: 22ms, application-code: 1564ms)
└─ ƒ getUnreadCount() in 1531ms lib/actions/notifications.ts
POST /client/profile 200 in 2.1s (next.js: 16ms, proxy.ts: 19ms, application-code: 2.1s)
└─ ƒ getUnreadCount() in 2016ms lib/actions/notifications.ts
POST /login 200 in 99ms (next.js: 20ms, proxy.ts: 20ms, application-code: 59ms)
POST /login 200 in 84ms (next.js: 18ms, proxy.ts: 14ms, application-code: 52ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 99ms (next.js: 26ms, proxy.ts: 14ms, application-code: 59ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 104ms (next.js: 23ms, proxy.ts: 18ms, application-code: 63ms)
POST /login 200 in 108ms (next.js: 22ms, proxy.ts: 20ms, application-code: 66ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 123ms (next.js: 22ms, proxy.ts: 26ms, application-code: 75ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 500ms (next.js: 106ms, proxy.ts: 98ms, application-code: 295ms)
POST /login 200 in 334ms (next.js: 41ms, proxy.ts: 37ms, application-code: 256ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 131ms (next.js: 33ms, proxy.ts: 29ms, application-code: 69ms)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 137ms (next.js: 22ms, proxy.ts: 26ms, application-code: 89ms)
POST /login 200 in 9.9s (next.js: 4.1s, proxy.ts: 1327ms, application-code: 4.5s)
[browser] ⨯ unhandledRejection: Error: An unexpected response was received from the server.
at fetchServerAction (file://C:/Users/Remedan/Documents/Final year project Implementation/SkiD/.next/dev/static/chunks/node*modules_next_dist_client_0fhqo1d.*.js:11157:37)
POST /login 200 in 399ms (next.js: 147ms, proxy.ts: 62ms, application-code: 190ms)

this the terminal record when i was doing the manual testing

## Fixes Applied During Manual Testing

- None yet.
