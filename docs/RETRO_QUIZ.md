# Retro Knowledge Bonus — Batch 01

Apply after Camera & Traversal Pilot (19 files). No change to Retro generator, movement, portrait/landscape, or unlock rules. Adventure changes in this delta only fix the agreed camera regression.

## Source and review

The user supplied the master prompt and `Maze_Hunter_Retro_Bank_Soal_500(1).xlsx`, not the referenced JSON/ZIP. The 500 question rows were imported without rewriting questions, options, answer keys or explanations. Workbook subject tabs/IDs provide subject codes; Level/Grade are 1, SD. Review labels remain `draft_pedagogical_review`. Original spreadsheet remains the authoring reference. No Level 2+ questions were invented.

`netlify/private/questions_level01_500_master.json` is the private authoring bank. Do not move it into `public`, `src`, `dist`, browser Firestore collections, or client imports. Netlify bundles it only into the server function. The source repository can contain the question authoring data; this is not a Firebase credential. A public repository would expose the bank to source readers: restrict repository access if answer confidentiality is required beyond deployed frontend assets.

Run `python scripts/validate_question_bank.py`. This verifies structure/uniqueness, not academic quality. Human review must check facts, age/grade, translations, grammar, cultural context, curriculum, distractors and explanations. Record the approved IDs in `netlify/private/quiz-review.json`; only approved IDs are eligible publicly. A subject needs at least three approved questions. Random Mix needs three approved subjects. Do not mark all approved merely to bypass review. New content revisions need a new PACK_VERSION and review version together.

## Deploy

1. Copy changed files into the existing GitHub project and deploy Netlify. The new `retro-quiz` function uses the same server-only `FIREBASE_SERVICE_ACCOUNT_JSON` already used by `maze-room`. No multiplayer laptop is required for quizzes.
2. Update the existing Firebase project's **Firestore rules** using the included `firestore.rules`, then publish the rules. This adds read-only own-profile knowledge progress; quiz sessions remain Admin-only. It does not change Realtime Database rules.
3. Optional draft pilot, before academic approval: set **Netlify environment** `RETRO_QUIZ_DRAFT_ORIGIN` to the exact deploy preview origin, for example `https://deploy-preview-1--maze-hunter.netlify.app`, with no trailing slash, Markdown wrapper or path. Redeploy. Only a matching `https://deploy-preview-N--….netlify.app` Origin can start a draft quiz. The production origin cannot enable drafts. Remove this variable after review/pilot. Draft testing uses the signed-in account's real progress and is labeled as preview content.
4. Production needs no new quiz environment variable after content approval. Until approval, Retro remains playable normally and explicitly reports quiz availability status.
5. Refresh all devices. No restart of PowerShell 1 or 2 is necessary for this delta; no realtime gameplay protocol or jump rules changed.

Do not upload service-account JSON or environment files to GitHub.

## User flow

A pre-level panel defaults Bonus Quiz OFF. ON chooses MTK/IPA/IPS/IDN/ENG/FRA/ARB/ZHO/PP/TIK or Random Mix. Three questions appear only after the client wins and the backend verifies the Level 1 Golden Gate trace. The existing base reward is recorded first. Each answer is final; explanation/correct option is returned after submission. 3/3 doubles the run's base reward; all other outcomes and skip retain the base.

Server sessions use stable attempt IDs and pack version. Repeated finish/answer/retry operations do not reroll questions or award another bonus. Progress stores maximum rewards and additional bonus only; the existing 1–3 base star records remain unchanged. Wallet settlement reads protected bonus progress in the same transaction. Session ownership derives from verified Firebase Auth, not a supplied UID or correctCount.

On refresh, Retro's existing maze engine does not restore a maze mid-route. The Journey page offers Resume Bonus Quiz when a pending attempt exists. Completed/active quizzes resume through the backend; a completed proof with a lost response can be retried. Unfinished maze attempts safely skip without awarding a new bonus. No background award is claimed saved until acknowledged.

## Validation and limits

Question validator and 273 automated tests pass at the main verification checkpoint, including server scoring, duplicate/retry settlement, changed-answer rejection, cross-account session isolation via mocked Auth/transaction adapters, Golden Gate trace validation and camera geometry. Firestore production/emulator security rules and actual Netlify deployment have not been exercised from this environment.

Browser preview verified the pre-level OFF/unavailable flow and rendering of the unchanged Retro board. Three supplied public question projections were rendered in iframe viewports 390×844 (Arabic RTL), 844×390 (Mandarin/pinyin), and 1024×768 (French). DOM measurements showed no horizontal or vertical overflow; phone answer targets were about 46 px high. These are rendering-only fixtures with no answer bank or scoring backend. Full authenticated quiz flow and physical phone/tablet interaction still require deployment pilot. The 3D camera's visual motion remains unverified here because earlier browser attempts could not create a WebGL context. Do not interpret unit tests as proof of motion comfort.

Camera collision no longer searches other sides. Pitch extends to −55°/60°; upward input changes focus, and the positive vertical orbit preserves radius. Very tight spaces may still shorten camera distance along the chosen ray to avoid passing through geometry; this is not a claim that every old corridor has been widened.
